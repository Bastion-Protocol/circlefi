const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.deployed();
  console.log("MockUSDC deployed to:", mockUSDC.address);

  // Deploy MockDomainOracle
  const MockDomainOracle = await ethers.getContractFactory("MockDomainOracle");
  const mockOracle = await MockDomainOracle.deploy();
  await mockOracle.deployed();
  console.log("MockDomainOracle deployed to:", mockOracle.address);

  // Deploy MockYellowSDK
  const MockYellowSDK = await ethers.getContractFactory("MockYellowSDK");
  const mockYellow = await MockYellowSDK.deploy();
  await mockYellow.deployed();
  console.log("MockYellowSDK deployed to:", mockYellow.address);

  // Deploy LendingPool
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(
    mockUSDC.address,
    mockOracle.address,
    mockYellow.address
  );
  await lendingPool.deployed();
  console.log("LendingPool deployed to:", lendingPool.address);

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    mockUSDC: mockUSDC.address,
    mockDomainOracle: mockOracle.address,
    mockYellowSDK: mockYellow.address,
    lendingPool: lendingPool.address,
    deployer: deployer.address
  };

  console.log("\nDeployment Summary:", deploymentInfo);

  // If deploying to testnet, verify contracts
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await lendingPool.deployTransaction.wait(5);

    console.log("Verifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: lendingPool.address,
        constructorArguments: [
          mockUSDC.address,
          mockOracle.address,
          mockYellow.address
        ],
      });
    } catch (error) {
      console.log("Verification error:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });