// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CircleFiPool.sol";
import "../src/DOMACollateral.sol";
import "../src/MockUSDC.sol";
import "../src/YellowIntegration.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Mock USDC for testing
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        // Deploy CircleFi Pool
        CircleFiPool pool = new CircleFiPool(address(usdc));
        console.log("CircleFiPool deployed at:", address(pool));

        // Deploy DOMA Collateral
        DOMACollateral doma = new DOMACollateral();
        console.log("DOMACollateral deployed at:", address(doma));

        // Deploy Yellow Integration
        YellowIntegration yellow = new YellowIntegration(address(pool));
        console.log("YellowIntegration deployed at:", address(yellow));

        // Mint some test domains
        doma.mintDomain("example.doma", 5000e6, msg.sender); // $5000 domain
        doma.mintDomain("test.doma", 10000e6, msg.sender); // $10000 domain
        doma.mintDomain("premium.doma", 25000e6, msg.sender); // $25000 domain

        console.log("Deployment completed!");
        console.log("USDC:", address(usdc));
        console.log("Pool:", address(pool));
        console.log("DOMA:", address(doma));
        console.log("Yellow:", address(yellow));

        vm.stopBroadcast();
    }
}