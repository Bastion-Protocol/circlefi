const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingPool", function () {
  let lendingPool, mockUSDC, mockOracle, mockYellow;
  let owner, addr1, addr2, addr3, addr4;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    // Deploy mock contracts
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();

    const MockDomainOracle = await ethers.getContractFactory("MockDomainOracle");
    mockOracle = await MockDomainOracle.deploy();

    const MockYellowSDK = await ethers.getContractFactory("MockYellowSDK");
    mockYellow = await MockYellowSDK.deploy();

    // Deploy LendingPool
    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(mockUSDC.address, mockOracle.address, mockYellow.address);

    // Mint tokens to test addresses
    await mockUSDC.mint(addr1.address, ethers.utils.parseUnits("10000", 6));
    await mockUSDC.mint(addr2.address, ethers.utils.parseUnits("10000", 6));
    await mockUSDC.mint(addr3.address, ethers.utils.parseUnits("10000", 6));
    await mockUSDC.mint(addr4.address, ethers.utils.parseUnits("10000", 6));
  });

  describe("Deployment", function () {
    it("Should set the right token", async function () {
      expect(await lendingPool.token()).to.equal(mockUSDC.address);
    });

    it("Should set the right oracle", async function () {
      expect(await lendingPool.domainOracle()).to.equal(mockOracle.address);
    });
  });

  describe("Deposits and Withdrawals", function () {
    it("Should allow deposits", async function () {
      const depositAmount = ethers.utils.parseUnits("1000", 6);
      
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      expect(await lendingPool.userDeposits(addr1.address)).to.equal(depositAmount);
      expect(await lendingPool.totalSupply()).to.equal(depositAmount);
    });

    it("Should allow withdrawals", async function () {
      const depositAmount = ethers.utils.parseUnits("1000", 6);
      const withdrawAmount = ethers.utils.parseUnits("500", 6);
      
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);
      
      await lendingPool.connect(addr1).withdraw(withdrawAmount);

      expect(await lendingPool.userDeposits(addr1.address)).to.equal(depositAmount.sub(withdrawAmount));
    });
  });

  describe("Circle Creation", function () {
    it("Should create a circle", async function () {
      const members = [addr1.address, addr2.address, addr3.address];
      const poolAmount = ethers.utils.parseUnits("3000", 6);
      const cycleLength = 86400; // 1 day

      await expect(lendingPool.connect(addr1).createCircle(members, poolAmount, cycleLength))
        .to.emit(lendingPool, "CircleCreated");

      const circleInfo = await lendingPool.getCircleInfo(1);
      expect(circleInfo.members).to.deep.equal(members);
      expect(circleInfo.poolAmount).to.equal(poolAmount);
    });

    it("Should require at least 3 members", async function () {
      const members = [addr1.address, addr2.address];
      const poolAmount = ethers.utils.parseUnits("2000", 6);
      const cycleLength = 86400;

      await expect(lendingPool.connect(addr1).createCircle(members, poolAmount, cycleLength))
        .to.be.revertedWith("Circle must have at least 3 members");
    });
  });

  describe("Borrowing", function () {
    beforeEach(async function () {
      // Set up liquidity
      const depositAmount = ethers.utils.parseUnits("10000", 6);
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      // Create a circle
      const members = [addr2.address, addr3.address, addr4.address];
      const poolAmount = ethers.utils.parseUnits("3000", 6);
      const cycleLength = 86400;
      await lendingPool.connect(addr2).createCircle(members, poolAmount, cycleLength);
    });

    it("Should allow borrowing with valid domain collateral", async function () {
      const borrowAmount = ethers.utils.parseUnits("500", 6);
      const domain = "example.com";

      await expect(lendingPool.connect(addr2).borrow(1, borrowAmount, domain))
        .to.emit(lendingPool, "LoanCreated");

      const loanInfo = await lendingPool.getLoanInfo(1);
      expect(loanInfo.borrower).to.equal(addr2.address);
      expect(loanInfo.amount).to.equal(borrowAmount);
    });

    it("Should reject borrowing with invalid domain", async function () {
      const borrowAmount = ethers.utils.parseUnits("500", 6);
      const domain = "invalid.com";

      await expect(lendingPool.connect(addr2).borrow(1, borrowAmount, domain))
        .to.be.revertedWith("Invalid domain");
    });
  });

  describe("Interest Rate Calculation", function () {
    it("Should calculate interest rate based on utilization", async function () {
      // Test base rate when utilization is 0
      expect(await lendingPool.getCurrentInterestRate()).to.equal(5);

      // Add some supply and borrowing to test utilization
      const depositAmount = ethers.utils.parseUnits("1000", 6);
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      expect(await lendingPool.getUtilizationRate()).to.equal(0);
    });
  });

  describe("Liquidation", function () {
    beforeEach(async function () {
      // Set up scenario for liquidation
      const depositAmount = ethers.utils.parseUnits("10000", 6);
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      const members = [addr2.address, addr3.address, addr4.address];
      const poolAmount = ethers.utils.parseUnits("3000", 6);
      const cycleLength = 86400;
      await lendingPool.connect(addr2).createCircle(members, poolAmount, cycleLength);

      const borrowAmount = ethers.utils.parseUnits("500", 6);
      await lendingPool.connect(addr2).borrow(1, borrowAmount, "example.com");
    });

    it("Should allow liquidation of overdue loans", async function () {
      // Fast forward time to make loan overdue
      await ethers.provider.send("evm_increaseTime", [86401]); // 1 day + 1 second
      await ethers.provider.send("evm_mine");

      await expect(lendingPool.connect(addr3).liquidate(1))
        .to.emit(lendingPool, "LoanLiquidated");

      const loanInfo = await lendingPool.getLoanInfo(1);
      expect(loanInfo.isLiquidated).to.be.true;
    });
  });
});