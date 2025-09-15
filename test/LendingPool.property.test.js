const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingPool Property-Based Tests", function () {
  let lendingPool, mockUSDC, mockOracle, mockYellow;
  let owner, addr1, addr2, addr3, addr4;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();

    const MockDomainOracle = await ethers.getContractFactory("MockDomainOracle");
    mockOracle = await MockDomainOracle.deploy();

    const MockYellowSDK = await ethers.getContractFactory("MockYellowSDK");
    mockYellow = await MockYellowSDK.deploy();

    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(mockUSDC.address, mockOracle.address, mockYellow.address);

    // Mint tokens to test addresses
    await mockUSDC.mint(addr1.address, ethers.utils.parseUnits("100000", 6));
    await mockUSDC.mint(addr2.address, ethers.utils.parseUnits("100000", 6));
    await mockUSDC.mint(addr3.address, ethers.utils.parseUnits("100000", 6));
    await mockUSDC.mint(addr4.address, ethers.utils.parseUnits("100000", 6));
  });

  describe("Interest Rate Properties", function () {
    it("Interest rate should increase with utilization", async function () {
      // Property: Higher utilization should result in higher interest rates
      const depositAmount = ethers.utils.parseUnits("10000", 6);
      
      // Provide initial liquidity
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      const initialRate = await lendingPool.getCurrentInterestRate();
      const initialUtilization = await lendingPool.getUtilizationRate();

      // Create circle and borrow to increase utilization
      const members = [addr2.address, addr3.address, addr4.address];
      await lendingPool.connect(addr2).createCircle(members, ethers.utils.parseUnits("3000", 6), 86400);
      
      const borrowAmount = ethers.utils.parseUnits("5000", 6);
      await lendingPool.connect(addr2).borrow(1, borrowAmount, "example.com");

      const newRate = await lendingPool.getCurrentInterestRate();
      const newUtilization = await lendingPool.getUtilizationRate();

      expect(newUtilization).to.be.gt(initialUtilization);
      expect(newRate).to.be.gt(initialRate);
    });

    it("Interest rate should never exceed maximum", async function () {
      // Property: Interest rate should be bounded by MAX_INTEREST_RATE
      const maxRate = 50; // 50% as defined in contract
      
      // Create extreme utilization scenario
      const depositAmount = ethers.utils.parseUnits("1000", 6);
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      const members = [addr2.address, addr3.address, addr4.address];
      await lendingPool.connect(addr2).createCircle(members, ethers.utils.parseUnits("3000", 6), 86400);
      
      // Try to borrow close to total supply
      const borrowAmount = ethers.utils.parseUnits("800", 6);
      await lendingPool.connect(addr2).borrow(1, borrowAmount, "example.com");

      const currentRate = await lendingPool.getCurrentInterestRate();
      expect(currentRate).to.be.lte(maxRate);
    });
  });

  describe("Liquidation Properties", function () {
    it("Loans should be liquidatable when overdue", async function () {
      // Property: Any overdue loan should be liquidatable
      const depositAmount = ethers.utils.parseUnits("10000", 6);
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      const members = [addr2.address, addr3.address, addr4.address];
      await lendingPool.connect(addr2).createCircle(members, ethers.utils.parseUnits("3000", 6), 86400);
      
      const borrowAmount = ethers.utils.parseUnits("500", 6);
      await lendingPool.connect(addr2).borrow(1, borrowAmount, "example.com");

      // Fast forward past due time
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine");

      // Should be liquidatable
      await expect(lendingPool.connect(addr3).liquidate(1)).to.not.be.reverted;
    });

    it("Liquidated loans should update state correctly", async function () {
      // Property: Liquidation should set isLiquidated = true and isActive = false
      const depositAmount = ethers.utils.parseUnits("10000", 6);
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      const members = [addr2.address, addr3.address, addr4.address];
      await lendingPool.connect(addr2).createCircle(members, ethers.utils.parseUnits("3000", 6), 86400);
      
      const borrowAmount = ethers.utils.parseUnits("500", 6);
      await lendingPool.connect(addr2).borrow(1, borrowAmount, "example.com");

      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine");

      await lendingPool.connect(addr3).liquidate(1);

      const loanInfo = await lendingPool.getLoanInfo(1);
      expect(loanInfo.isLiquidated).to.be.true;
      expect(loanInfo.isActive).to.be.false;
    });
  });

  describe("Circle Rotation Properties", function () {
    it("Only current borrower should be able to borrow", async function () {
      // Property: In a circle rotation, only the designated borrower can borrow
      const depositAmount = ethers.utils.parseUnits("10000", 6);
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      const members = [addr2.address, addr3.address, addr4.address];
      await lendingPool.connect(addr2).createCircle(members, ethers.utils.parseUnits("3000", 6), 86400);

      const borrowAmount = ethers.utils.parseUnits("500", 6);
      
      // addr2 should be able to borrow (first in rotation)
      await expect(lendingPool.connect(addr2).borrow(1, borrowAmount, "example.com")).to.not.be.reverted;
      
      // addr3 should not be able to borrow (not their turn)
      await expect(lendingPool.connect(addr3).borrow(1, borrowAmount, "defi.org"))
        .to.be.revertedWith("Not your turn to borrow");
    });
  });

  describe("Collateral Properties", function () {
    it("Loan amount should not exceed collateral value", async function () {
      // Property: Borrower cannot borrow more than 80% of collateral value
      const depositAmount = ethers.utils.parseUnits("10000", 6);
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      const members = [addr2.address, addr3.address, addr4.address];
      await lendingPool.connect(addr2).createCircle(members, ethers.utils.parseUnits("3000", 6), 86400);

      // example.com is worth 1000 tokens, so max loan should be 800 tokens
      const maxLoanAmount = ethers.utils.parseUnits("800", 6);
      const excessiveLoanAmount = ethers.utils.parseUnits("900", 6);

      // Should succeed with valid amount
      await expect(lendingPool.connect(addr2).borrow(1, maxLoanAmount, "example.com")).to.not.be.reverted;
      
      // Fast forward to next cycle for addr3
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine");

      // Should fail with excessive amount
      await expect(lendingPool.connect(addr3).borrow(1, excessiveLoanAmount, "example.com"))
        .to.be.revertedWith("Loan amount exceeds collateral value");
    });
  });

  describe("Invariant Properties", function () {
    it("Total supply should always equal deposits minus withdrawals", async function () {
      // Property: totalSupply = sum of all deposits - sum of all withdrawals
      const depositAmount1 = ethers.utils.parseUnits("1000", 6);
      const depositAmount2 = ethers.utils.parseUnits("2000", 6);
      const withdrawAmount = ethers.utils.parseUnits("500", 6);

      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount1);
      await lendingPool.connect(addr1).deposit(depositAmount1);

      await mockUSDC.connect(addr2).approve(lendingPool.address, depositAmount2);
      await lendingPool.connect(addr2).deposit(depositAmount2);

      const totalAfterDeposits = await lendingPool.totalSupply();
      expect(totalAfterDeposits).to.equal(depositAmount1.add(depositAmount2));

      await lendingPool.connect(addr1).withdraw(withdrawAmount);

      const totalAfterWithdrawal = await lendingPool.totalSupply();
      expect(totalAfterWithdrawal).to.equal(depositAmount1.add(depositAmount2).sub(withdrawAmount));
    });

    it("User deposits should always equal their individual deposit balance", async function () {
      // Property: userDeposits[user] should accurately track individual balances
      const depositAmount = ethers.utils.parseUnits("1500", 6);
      const withdrawAmount = ethers.utils.parseUnits("300", 6);

      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      let userBalance = await lendingPool.userDeposits(addr1.address);
      expect(userBalance).to.equal(depositAmount);

      await lendingPool.connect(addr1).withdraw(withdrawAmount);

      userBalance = await lendingPool.userDeposits(addr1.address);
      expect(userBalance).to.equal(depositAmount.sub(withdrawAmount));
    });

    it("Utilization rate should always be between 0 and 100", async function () {
      // Property: 0 <= utilizationRate <= 100
      const depositAmount = ethers.utils.parseUnits("10000", 6);
      await mockUSDC.connect(addr1).approve(lendingPool.address, depositAmount);
      await lendingPool.connect(addr1).deposit(depositAmount);

      let utilizationRate = await lendingPool.getUtilizationRate();
      expect(utilizationRate).to.be.gte(0);
      expect(utilizationRate).to.be.lte(100);

      // Add borrowing
      const members = [addr2.address, addr3.address, addr4.address];
      await lendingPool.connect(addr2).createCircle(members, ethers.utils.parseUnits("3000", 6), 86400);
      
      const borrowAmount = ethers.utils.parseUnits("5000", 6);
      await lendingPool.connect(addr2).borrow(1, borrowAmount, "example.com");

      utilizationRate = await lendingPool.getUtilizationRate();
      expect(utilizationRate).to.be.gte(0);
      expect(utilizationRate).to.be.lte(100);
    });
  });
});