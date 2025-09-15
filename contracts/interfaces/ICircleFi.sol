// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDomainOracle {
    function getDomainPrice(string calldata domain) external view returns (uint256);
    function isDomainValid(string calldata domain) external view returns (bool);
    function getLastUpdated(string calldata domain) external view returns (uint256);
}

interface ILendingPool {
    struct LoanInfo {
        address borrower;
        uint256 amount;
        uint256 collateralValue;
        string domainCollateral;
        uint256 interestRate;
        uint256 startTime;
        uint256 dueTime;
        bool isActive;
        bool isLiquidated;
    }

    struct CircleInfo {
        address[] members;
        uint256 poolAmount;
        uint256 currentBorrower;
        uint256 cycleLength;
        uint256 startTime;
        bool isActive;
    }

    function createCircle(address[] calldata members, uint256 poolAmount, uint256 cycleLength) external returns (uint256);
    function joinCircle(uint256 circleId) external;
    function borrow(uint256 circleId, uint256 amount, string calldata domainCollateral) external returns (uint256);
    function repay(uint256 loanId) external;
    function liquidate(uint256 loanId) external;
    function getUtilizationRate() external view returns (uint256);
    function getCurrentInterestRate() external view returns (uint256);
}

interface IYellowSDK {
    function createStateChannel(address[] calldata participants) external returns (bytes32);
    function updateChannelState(bytes32 channelId, bytes calldata newState) external;
    function closeChannel(bytes32 channelId) external;
    function getChannelState(bytes32 channelId) external view returns (bytes memory);
}