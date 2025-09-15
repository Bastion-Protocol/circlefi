// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ICircleFi.sol";

contract LendingPool is ILendingPool, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    IDomainOracle public domainOracle;
    IYellowSDK public yellowSDK;

    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80% LTV
    uint256 public constant BASE_INTEREST_RATE = 5; // 5% base rate
    uint256 public constant OPTIMAL_UTILIZATION = 80; // 80% optimal utilization
    uint256 public constant MAX_INTEREST_RATE = 50; // 50% max rate

    uint256 public totalSupply;
    uint256 public totalBorrowed;
    uint256 public nextLoanId = 1;
    uint256 public nextCircleId = 1;

    mapping(uint256 => LoanInfo) public loans;
    mapping(uint256 => CircleInfo) public circles;
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256[]) public userLoans;
    mapping(address => uint256[]) public userCircles;

    event CircleCreated(uint256 indexed circleId, address[] members, uint256 poolAmount);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, string domainCollateral);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanLiquidated(uint256 indexed loanId, address indexed borrower, address indexed liquidator);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    constructor(IERC20 _token, IDomainOracle _domainOracle, IYellowSDK _yellowSDK) {
        token = _token;
        domainOracle = _domainOracle;
        yellowSDK = _yellowSDK;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        userDeposits[msg.sender] += amount;
        totalSupply += amount;

        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(userDeposits[msg.sender] >= amount, "Insufficient balance");
        require(totalSupply - totalBorrowed >= amount, "Insufficient liquidity");

        userDeposits[msg.sender] -= amount;
        totalSupply -= amount;
        token.safeTransfer(msg.sender, amount);

        emit Withdrawal(msg.sender, amount);
    }

    function createCircle(
        address[] calldata members,
        uint256 poolAmount,
        uint256 cycleLength
    ) external override returns (uint256) {
        require(members.length >= 3, "Circle must have at least 3 members");
        require(poolAmount > 0, "Pool amount must be greater than 0");
        require(cycleLength > 0, "Cycle length must be greater than 0");

        uint256 circleId = nextCircleId++;
        
        CircleInfo storage circle = circles[circleId];
        circle.members = members;
        circle.poolAmount = poolAmount;
        circle.cycleLength = cycleLength;
        circle.startTime = block.timestamp;
        circle.isActive = true;

        // Create Yellow SDK state channel for the circle
        bytes32 channelId = yellowSDK.createStateChannel(members);

        // Add circle to each member's list
        for (uint256 i = 0; i < members.length; i++) {
            userCircles[members[i]].push(circleId);
        }

        emit CircleCreated(circleId, members, poolAmount);
        return circleId;
    }

    function joinCircle(uint256 circleId) external override {
        CircleInfo storage circle = circles[circleId];
        require(circle.isActive, "Circle is not active");
        
        // Check if user is already a member
        bool isMember = false;
        for (uint256 i = 0; i < circle.members.length; i++) {
            if (circle.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Not a member of this circle");
    }

    function borrow(
        uint256 circleId,
        uint256 amount,
        string calldata domainCollateral
    ) external override nonReentrant returns (uint256) {
        CircleInfo storage circle = circles[circleId];
        require(circle.isActive, "Circle is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(domainOracle.isDomainValid(domainCollateral), "Invalid domain");

        // Check if it's the user's turn to borrow
        uint256 currentCycle = (block.timestamp - circle.startTime) / circle.cycleLength;
        uint256 expectedBorrower = currentCycle % circle.members.length;
        require(circle.members[expectedBorrower] == msg.sender, "Not your turn to borrow");

        // Get domain collateral value
        uint256 domainValue = domainOracle.getDomainPrice(domainCollateral);
        uint256 maxLoanAmount = (domainValue * LIQUIDATION_THRESHOLD) / 100;
        require(amount <= maxLoanAmount, "Loan amount exceeds collateral value");

        // Check liquidity
        require(totalSupply - totalBorrowed >= amount, "Insufficient liquidity");

        uint256 loanId = nextLoanId++;
        uint256 interestRate = getCurrentInterestRate();
        
        LoanInfo storage loan = loans[loanId];
        loan.borrower = msg.sender;
        loan.amount = amount;
        loan.collateralValue = domainValue;
        loan.domainCollateral = domainCollateral;
        loan.interestRate = interestRate;
        loan.startTime = block.timestamp;
        loan.dueTime = block.timestamp + circle.cycleLength;
        loan.isActive = true;

        totalBorrowed += amount;
        userLoans[msg.sender].push(loanId);

        token.safeTransfer(msg.sender, amount);

        emit LoanCreated(loanId, msg.sender, amount, domainCollateral);
        return loanId;
    }

    function repay(uint256 loanId) external override nonReentrant {
        LoanInfo storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");
        require(loan.borrower == msg.sender, "Not the borrower");

        uint256 interest = calculateInterest(loanId);
        uint256 totalAmount = loan.amount + interest;

        loan.isActive = false;
        totalBorrowed -= loan.amount;

        token.safeTransferFrom(msg.sender, address(this), totalAmount);

        emit LoanRepaid(loanId, msg.sender, totalAmount);
    }

    function liquidate(uint256 loanId) external override nonReentrant {
        LoanInfo storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");
        require(block.timestamp > loan.dueTime, "Loan is not overdue");
        
        // Check if collateral value has dropped below liquidation threshold
        uint256 currentDomainValue = domainOracle.getDomainPrice(loan.domainCollateral);
        uint256 interest = calculateInterest(loanId);
        uint256 totalDebt = loan.amount + interest;
        uint256 ltv = (totalDebt * 100) / currentDomainValue;
        
        require(ltv >= LIQUIDATION_THRESHOLD || block.timestamp > loan.dueTime, "Loan cannot be liquidated");

        loan.isActive = false;
        loan.isLiquidated = true;
        totalBorrowed -= loan.amount;

        // Liquidator gets a portion of the collateral value
        uint256 liquidationReward = currentDomainValue / 10; // 10% reward
        if (liquidationReward > 0) {
            token.safeTransfer(msg.sender, liquidationReward);
        }

        emit LoanLiquidated(loanId, loan.borrower, msg.sender);
    }

    function getUtilizationRate() external view override returns (uint256) {
        if (totalSupply == 0) return 0;
        return (totalBorrowed * 100) / totalSupply;
    }

    function getCurrentInterestRate() public view override returns (uint256) {
        uint256 utilizationRate = this.getUtilizationRate();
        
        if (utilizationRate <= OPTIMAL_UTILIZATION) {
            // Linear increase from base rate to optimal rate
            return BASE_INTEREST_RATE + (utilizationRate * BASE_INTEREST_RATE) / OPTIMAL_UTILIZATION;
        } else {
            // Steep increase after optimal utilization
            uint256 excessUtilization = utilizationRate - OPTIMAL_UTILIZATION;
            uint256 excessRate = (excessUtilization * (MAX_INTEREST_RATE - BASE_INTEREST_RATE * 2)) / (100 - OPTIMAL_UTILIZATION);
            return BASE_INTEREST_RATE * 2 + excessRate;
        }
    }

    function calculateInterest(uint256 loanId) public view returns (uint256) {
        LoanInfo storage loan = loans[loanId];
        if (!loan.isActive) return 0;
        
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 yearlyInterest = (loan.amount * loan.interestRate) / 100;
        return (yearlyInterest * timeElapsed) / 365 days;
    }

    function getLoanInfo(uint256 loanId) external view returns (LoanInfo memory) {
        return loans[loanId];
    }

    function getCircleInfo(uint256 circleId) external view returns (CircleInfo memory) {
        return circles[circleId];
    }

    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }

    function getUserCircles(address user) external view returns (uint256[] memory) {
        return userCircles[user];
    }

    function setDomainOracle(IDomainOracle _newOracle) external onlyOwner {
        domainOracle = _newOracle;
    }

    function setYellowSDK(IYellowSDK _newSDK) external onlyOwner {
        yellowSDK = _newSDK;
    }
}