// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/CircleFiPool.sol";
import "../src/MockUSDC.sol";

contract CircleFiPoolTest is Test {
    CircleFiPool public pool;
    MockUSDC public usdc;
    
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);
    address public user4 = address(0x4);

    function setUp() public {
        usdc = new MockUSDC();
        pool = new CircleFiPool(address(usdc));
        
        // Give users some USDC
        usdc.transfer(user1, 10000e6);
        usdc.transfer(user2, 10000e6);
        usdc.transfer(user3, 10000e6);
        usdc.transfer(user4, 10000e6);
    }

    function testSupplyAndWithdraw() public {
        vm.startPrank(user1);
        
        uint256 supplyAmount = 1000e6;
        usdc.approve(address(pool), supplyAmount);
        
        pool.supply(supplyAmount, 0);
        
        assertEq(pool.getSupplyBalance(user1), supplyAmount);
        assertEq(pool.totalSupply(), supplyAmount);
        
        pool.withdraw(supplyAmount);
        
        assertEq(pool.getSupplyBalance(user1), 0);
        assertEq(usdc.balanceOf(user1), 10000e6);
        
        vm.stopPrank();
    }

    function testCreateCircle() public {
        vm.prank(user1);
        uint256 circleId = pool.createCircle("Test Circle", 4);
        
        assertEq(circleId, 1);
        
        address[] memory members = pool.getCircleMembers(circleId);
        assertEq(members.length, 1);
        assertEq(members[0], user1);
    }

    function testCircleLending() public {
        // User1 creates circle and supplies
        vm.startPrank(user1);
        uint256 circleId = pool.createCircle("Lending Circle", 4);
        
        uint256 supplyAmount = 5000e6;
        usdc.approve(address(pool), supplyAmount);
        pool.supply(supplyAmount, circleId);
        vm.stopPrank();
        
        // User2 joins circle
        vm.prank(user2);
        pool.joinCircle(circleId);
        
        // User2 borrows from circle
        vm.startPrank(user2);
        uint256 borrowAmount = 2000e6;
        pool.borrow(borrowAmount, circleId);
        
        assertEq(pool.getBorrowBalance(user2), borrowAmount);
        assertEq(usdc.balanceOf(user2), 10000e6 + borrowAmount);
        vm.stopPrank();
    }

    function testInterestRateCalculation() public {
        uint256 utilizationRate = 0.5e18; // 50%
        uint256 borrowRate = pool.getBorrowRate(utilizationRate);
        uint256 supplyRate = pool.getSupplyRate(borrowRate, utilizationRate);
        
        assertGt(borrowRate, 0);
        assertGt(supplyRate, 0);
        assertLt(supplyRate, borrowRate);
    }

    function testCircleMemberLimit() public {
        vm.prank(user1);
        uint256 circleId = pool.createCircle("Small Circle", 3);
        
        vm.prank(user2);
        pool.joinCircle(circleId);
        
        vm.prank(user3);
        pool.joinCircle(circleId);
        
        // Circle is now full (3 members)
        vm.prank(user4);
        vm.expectRevert("Circle full");
        pool.joinCircle(circleId);
    }

    function testInsufficientLiquidity() public {
        vm.startPrank(user1);
        uint256 circleId = pool.createCircle("Test Circle", 4);
        
        uint256 supplyAmount = 1000e6;
        usdc.approve(address(pool), supplyAmount);
        pool.supply(supplyAmount, circleId);
        vm.stopPrank();
        
        vm.prank(user2);
        pool.joinCircle(circleId);
        
        vm.startPrank(user2);
        // Try to borrow more than available
        vm.expectRevert("Insufficient circle liquidity");
        pool.borrow(2000e6, circleId);
        vm.stopPrank();
    }
}