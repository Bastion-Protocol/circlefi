const { ethers } = require("hardhat");

async function main() {
  const [deployer, user1, user2, user3] = await ethers.getSigners();

  console.log("Setting up pools with accounts:");
  console.log("Deployer:", deployer.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);
  console.log("User3:", user3.address);

  // Get deployed contract addresses (you should update these after deployment)
  const LENDING_POOL_ADDRESS = process.env.LENDING_POOL_ADDRESS || "0x..."; // Update with actual address
  const MOCK_USDC_ADDRESS = process.env.MOCK_USDC_ADDRESS || "0x..."; // Update with actual address

  if (LENDING_POOL_ADDRESS === "0x..." || MOCK_USDC_ADDRESS === "0x...") {
    console.log("Please update contract addresses in the script or environment variables");
    return;
  }

  // Get contract instances
  const lendingPool = await ethers.getContractAt("LendingPool", LENDING_POOL_ADDRESS);
  const mockUSDC = await ethers.getContractAt("MockUSDC", MOCK_USDC_ADDRESS);

  // Mint tokens for users
  const mintAmount = ethers.utils.parseUnits("10000", 6); // 10k USDC
  await mockUSDC.mint(user1.address, mintAmount);
  await mockUSDC.mint(user2.address, mintAmount);
  await mockUSDC.mint(user3.address, mintAmount);
  console.log("Minted 10k USDC to each user");

  // User1 provides liquidity
  const depositAmount = ethers.utils.parseUnits("5000", 6);
  await mockUSDC.connect(user1).approve(lendingPool.address, depositAmount);
  await lendingPool.connect(user1).deposit(depositAmount);
  console.log("User1 deposited 5k USDC to provide liquidity");

  // Create a sample circle
  const members = [user1.address, user2.address, user3.address];
  const poolAmount = ethers.utils.parseUnits("3000", 6);
  const cycleLength = 86400 * 7; // 1 week cycles

  const tx = await lendingPool.connect(user1).createCircle(members, poolAmount, cycleLength);
  const receipt = await tx.wait();
  console.log("Created circle with 3 members, 1 week cycles");

  // Get circle info
  const circleInfo = await lendingPool.getCircleInfo(1);
  console.log("Circle created successfully:");
  console.log("- Members:", circleInfo.members.length);
  console.log("- Pool Amount:", ethers.utils.formatUnits(circleInfo.poolAmount, 6), "USDC");
  console.log("- Cycle Length:", circleInfo.cycleLength / 86400, "days");

  console.log("\nSetup complete! You can now:");
  console.log("1. Test borrowing with domain collateral");
  console.log("2. Simulate domain price changes");
  console.log("3. Test circle rotations");
  console.log("4. Practice liquidations");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });