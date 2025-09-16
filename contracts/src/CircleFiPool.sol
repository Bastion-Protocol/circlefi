// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title CircleFiPool
 * @dev Core lending pool contract inspired by Aave V3/Compound V3 for USDC lending
 */
contract CircleFiPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct UserData {
        uint256 supplied;
        uint256 borrowed;
        uint256 lastUpdateTimestamp;
        uint256 interestIndex;
        bool isCircleMember;
        uint256 circleId;
    }

    struct CircleData {
        address[] members;
        uint256 totalSupplied;
        uint256 totalBorrowed;
        uint256 maxMembers;
        bool isActive;
        string name;
    }

    // Constants
    uint256 public constant INTEREST_RATE_BASE = 1e18;
    uint256 public constant UTILIZATION_OPTIMAL = 0.8e18; // 80%
    uint256 public constant RATE_SLOPE_1 = 0.04e18; // 4%
    uint256 public constant RATE_SLOPE_2 = 0.6e18; // 60%
    uint256 public constant BASE_VARIABLE_BORROW_RATE = 0.02e18; // 2%

    // State variables
    IERC20 public immutable USDC;
    
    mapping(address => UserData) public userData;
    mapping(uint256 => CircleData) public circles;
    
    uint256 public totalSupply;
    uint256 public totalBorrow;
    uint256 public liquidityIndex;
    uint256 public variableBorrowIndex;
    uint256 public lastUpdateTimestamp;
    uint256 public nextCircleId;
    
    // Events
    event Supply(address indexed user, uint256 amount, uint256 circleId);
    event Withdraw(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount, uint256 circleId);
    event Repay(address indexed user, uint256 amount);
    event CircleCreated(uint256 indexed circleId, address indexed creator, string name);
    event CircleMemberAdded(uint256 indexed circleId, address indexed member);

    constructor(address _usdc) Ownable(msg.sender) {
        USDC = IERC20(_usdc);
        liquidityIndex = INTEREST_RATE_BASE;
        variableBorrowIndex = INTEREST_RATE_BASE;
        lastUpdateTimestamp = block.timestamp;
        nextCircleId = 1;
    }

    /**
     * @dev Update interest rates and indices
     */
    function updateState() public {
        uint256 currentTimestamp = block.timestamp;
        if (currentTimestamp == lastUpdateTimestamp) return;

        uint256 timeDelta = currentTimestamp - lastUpdateTimestamp;
        
        if (totalSupply > 0) {
            uint256 utilizationRate = getUtilizationRate();
            uint256 borrowRate = getBorrowRate(utilizationRate);
            uint256 supplyRate = getSupplyRate(borrowRate, utilizationRate);

            // Update borrow index
            uint256 borrowRatePerSecond = borrowRate / 365 days;
            variableBorrowIndex = variableBorrowIndex * 
                (INTEREST_RATE_BASE + borrowRatePerSecond * timeDelta) / INTEREST_RATE_BASE;

            // Update liquidity index
            uint256 supplyRatePerSecond = supplyRate / 365 days;
            liquidityIndex = liquidityIndex * 
                (INTEREST_RATE_BASE + supplyRatePerSecond * timeDelta) / INTEREST_RATE_BASE;
        }

        lastUpdateTimestamp = currentTimestamp;
    }

    /**
     * @dev Supply USDC to the pool
     */
    function supply(uint256 amount, uint256 circleId) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(circleId == 0 || circles[circleId].isActive, "Invalid circle");
        
        updateState();
        
        if (circleId > 0) {
            require(userData[msg.sender].circleId == circleId || userData[msg.sender].circleId == 0, 
                "User already in different circle");
            if (userData[msg.sender].circleId == 0) {
                _addToCircle(circleId, msg.sender);
            }
        }

        USDC.safeTransferFrom(msg.sender, address(this), amount);
        
        userData[msg.sender].supplied += amount;
        userData[msg.sender].lastUpdateTimestamp = block.timestamp;
        userData[msg.sender].interestIndex = liquidityIndex;
        
        totalSupply += amount;
        
        if (circleId > 0) {
            circles[circleId].totalSupplied += amount;
        }

        emit Supply(msg.sender, amount, circleId);
    }

    /**
     * @dev Withdraw USDC from the pool
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        updateState();
        
        uint256 userBalance = getSupplyBalance(msg.sender);
        require(userBalance >= amount, "Insufficient balance");
        
        userData[msg.sender].supplied = userBalance - amount;
        userData[msg.sender].lastUpdateTimestamp = block.timestamp;
        userData[msg.sender].interestIndex = liquidityIndex;
        
        totalSupply -= amount;
        
        if (userData[msg.sender].circleId > 0) {
            circles[userData[msg.sender].circleId].totalSupplied -= amount;
        }

        USDC.safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, amount);
    }

    /**
     * @dev Borrow USDC from the pool
     */
    function borrow(uint256 amount, uint256 circleId) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(circleId > 0 && circles[circleId].isActive, "Invalid circle");
        require(userData[msg.sender].circleId == circleId, "Not a circle member");
        
        updateState();
        
        // Check circle has enough liquidity
        uint256 circleSupply = circles[circleId].totalSupplied;
        uint256 circleBorrowed = circles[circleId].totalBorrowed;
        require(circleSupply >= circleBorrowed + amount, "Insufficient circle liquidity");
        
        userData[msg.sender].borrowed += amount;
        userData[msg.sender].lastUpdateTimestamp = block.timestamp;
        
        totalBorrow += amount;
        circles[circleId].totalBorrowed += amount;

        USDC.safeTransfer(msg.sender, amount);

        emit Borrow(msg.sender, amount, circleId);
    }

    /**
     * @dev Repay borrowed USDC
     */
    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        updateState();
        
        uint256 borrowBalance = getBorrowBalance(msg.sender);
        uint256 repayAmount = Math.min(amount, borrowBalance);
        
        USDC.safeTransferFrom(msg.sender, address(this), repayAmount);
        
        userData[msg.sender].borrowed = borrowBalance - repayAmount;
        userData[msg.sender].lastUpdateTimestamp = block.timestamp;
        
        totalBorrow -= repayAmount;
        
        if (userData[msg.sender].circleId > 0) {
            circles[userData[msg.sender].circleId].totalBorrowed -= repayAmount;
        }

        emit Repay(msg.sender, repayAmount);
    }

    /**
     * @dev Create a new lending circle
     */
    function createCircle(string memory name, uint256 maxMembers) external returns (uint256) {
        require(maxMembers >= 3 && maxMembers <= 4, "Circle must have 3-4 members");
        require(bytes(name).length > 0, "Circle name required");
        
        uint256 circleId = nextCircleId++;
        
        circles[circleId] = CircleData({
            members: new address[](0),
            totalSupplied: 0,
            totalBorrowed: 0,
            maxMembers: maxMembers,
            isActive: true,
            name: name
        });
        
        _addToCircle(circleId, msg.sender);

        emit CircleCreated(circleId, msg.sender, name);
        return circleId;
    }

    /**
     * @dev Join an existing circle
     */
    function joinCircle(uint256 circleId) external {
        require(circles[circleId].isActive, "Circle not active");
        require(userData[msg.sender].circleId == 0, "Already in a circle");
        require(circles[circleId].members.length < circles[circleId].maxMembers, "Circle full");
        
        _addToCircle(circleId, msg.sender);
    }

    function _addToCircle(uint256 circleId, address member) internal {
        circles[circleId].members.push(member);
        userData[member].isCircleMember = true;
        userData[member].circleId = circleId;
        
        emit CircleMemberAdded(circleId, member);
    }

    // View functions
    function getSupplyBalance(address user) public view returns (uint256) {
        UserData memory data = userData[user];
        if (data.supplied == 0) return 0;
        
        return data.supplied * liquidityIndex / data.interestIndex;
    }

    function getBorrowBalance(address user) public view returns (uint256) {
        UserData memory data = userData[user];
        if (data.borrowed == 0) return 0;
        
        uint256 timeDelta = block.timestamp - data.lastUpdateTimestamp;
        uint256 borrowRatePerSecond = getCurrentBorrowRate() / 365 days;
        uint256 interest = data.borrowed * borrowRatePerSecond * timeDelta / INTEREST_RATE_BASE;
        
        return data.borrowed + interest;
    }

    function getUtilizationRate() public view returns (uint256) {
        if (totalSupply == 0) return 0;
        return totalBorrow * INTEREST_RATE_BASE / totalSupply;
    }

    function getBorrowRate(uint256 utilizationRate) public pure returns (uint256) {
        if (utilizationRate <= UTILIZATION_OPTIMAL) {
            return BASE_VARIABLE_BORROW_RATE + 
                   (utilizationRate * RATE_SLOPE_1 / UTILIZATION_OPTIMAL);
        } else {
            uint256 excessUtilization = utilizationRate - UTILIZATION_OPTIMAL;
            return BASE_VARIABLE_BORROW_RATE + RATE_SLOPE_1 + 
                   (excessUtilization * RATE_SLOPE_2 / (INTEREST_RATE_BASE - UTILIZATION_OPTIMAL));
        }
    }

    function getSupplyRate(uint256 borrowRate, uint256 utilizationRate) public pure returns (uint256) {
        return borrowRate * utilizationRate / INTEREST_RATE_BASE;
    }

    function getCurrentBorrowRate() public view returns (uint256) {
        return getBorrowRate(getUtilizationRate());
    }

    function getCurrentSupplyRate() public view returns (uint256) {
        uint256 utilizationRate = getUtilizationRate();
        return getSupplyRate(getBorrowRate(utilizationRate), utilizationRate);
    }

    function getCircleMembers(uint256 circleId) external view returns (address[] memory) {
        return circles[circleId].members;
    }
}