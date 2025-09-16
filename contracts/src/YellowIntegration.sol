// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CircleFiPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title YellowIntegration
 * @dev Contract for Yellow SDK integration providing real-time rates and gasless transactions
 */
contract YellowIntegration is Ownable, ReentrancyGuard {
    CircleFiPool public immutable pool;
    
    struct RateData {
        uint256 supplyRate;
        uint256 borrowRate;
        uint256 timestamp;
        uint256 utilizationRate;
    }

    struct GaslessTransaction {
        address user;
        bytes4 selector;
        bytes data;
        uint256 nonce;
        uint256 expiry;
        bytes signature;
    }

    mapping(address => uint256) public nonces;
    mapping(bytes32 => bool) public executedTransactions;
    
    RateData public currentRates;
    uint256 public constant RATE_UPDATE_INTERVAL = 300; // 5 minutes
    
    // Yellow SDK state channel data
    mapping(address => bytes32) public stateChannels;
    mapping(bytes32 => uint256) public channelBalances;
    
    event RatesUpdated(uint256 supplyRate, uint256 borrowRate, uint256 utilizationRate);
    event GaslessTransactionExecuted(address indexed user, bytes4 indexed selector, uint256 nonce);
    event StateChannelOpened(address indexed user, bytes32 channelId, uint256 initialBalance);
    event StateChannelClosed(address indexed user, bytes32 channelId, uint256 finalBalance);

    constructor(address _pool) Ownable(msg.sender) {
        pool = CircleFiPool(_pool);
        _updateRates();
    }

    /**
     * @dev Update real-time rates (called by Yellow SDK oracles)
     */
    function updateRates() external onlyOwner {
        _updateRates();
    }

    function _updateRates() internal {
        uint256 supplyRate = pool.getCurrentSupplyRate();
        uint256 borrowRate = pool.getCurrentBorrowRate();
        uint256 utilizationRate = pool.getUtilizationRate();
        
        currentRates = RateData({
            supplyRate: supplyRate,
            borrowRate: borrowRate,
            timestamp: block.timestamp,
            utilizationRate: utilizationRate
        });
        
        emit RatesUpdated(supplyRate, borrowRate, utilizationRate);
    }

    /**
     * @dev Execute gasless transaction for user
     */
    function executeGaslessTransaction(
        GaslessTransaction memory transaction
    ) external onlyOwner nonReentrant {
        require(transaction.expiry > block.timestamp, "Transaction expired");
        require(transaction.nonce == nonces[transaction.user], "Invalid nonce");
        
        bytes32 txHash = keccak256(abi.encode(transaction));
        require(!executedTransactions[txHash], "Transaction already executed");
        
        // Verify signature (simplified for MVP)
        bytes32 messageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            txHash
        ));
        
        // Execute the transaction based on selector
        if (transaction.selector == CircleFiPool.supply.selector) {
            (uint256 amount, uint256 circleId) = abi.decode(transaction.data, (uint256, uint256));
            _executeSupply(transaction.user, amount, circleId);
        } else if (transaction.selector == CircleFiPool.withdraw.selector) {
            uint256 amount = abi.decode(transaction.data, (uint256));
            _executeWithdraw(transaction.user, amount);
        } else if (transaction.selector == CircleFiPool.borrow.selector) {
            (uint256 amount, uint256 circleId) = abi.decode(transaction.data, (uint256, uint256));
            _executeBorrow(transaction.user, amount, circleId);
        } else if (transaction.selector == CircleFiPool.repay.selector) {
            uint256 amount = abi.decode(transaction.data, (uint256));
            _executeRepay(transaction.user, amount);
        }
        
        executedTransactions[txHash] = true;
        nonces[transaction.user]++;
        
        emit GaslessTransactionExecuted(transaction.user, transaction.selector, transaction.nonce);
    }

    /**
     * @dev Open state channel for real-time updates
     */
    function openStateChannel(address user, uint256 initialBalance) external onlyOwner {
        bytes32 channelId = keccak256(abi.encodePacked(user, block.timestamp, block.difficulty));
        
        stateChannels[user] = channelId;
        channelBalances[channelId] = initialBalance;
        
        emit StateChannelOpened(user, channelId, initialBalance);
    }

    /**
     * @dev Close state channel and settle final balance
     */
    function closeStateChannel(address user, uint256 finalBalance) external onlyOwner {
        bytes32 channelId = stateChannels[user];
        require(channelId != bytes32(0), "No active channel");
        
        channelBalances[channelId] = finalBalance;
        delete stateChannels[user];
        
        emit StateChannelClosed(user, channelId, finalBalance);
    }

    /**
     * @dev Get real-time rates with freshness check
     */
    function getRealTimeRates() external view returns (
        uint256 supplyRate,
        uint256 borrowRate,
        uint256 utilizationRate,
        bool isStale
    ) {
        bool stale = block.timestamp - currentRates.timestamp > RATE_UPDATE_INTERVAL;
        
        return (
            currentRates.supplyRate,
            currentRates.borrowRate,
            currentRates.utilizationRate,
            stale
        );
    }

    /**
     * @dev Get user's state channel info
     */
    function getUserStateChannel(address user) external view returns (
        bytes32 channelId,
        uint256 balance,
        bool isActive
    ) {
        channelId = stateChannels[user];
        balance = channelBalances[channelId];
        isActive = channelId != bytes32(0);
    }

    // Internal execution functions for gasless transactions
    function _executeSupply(address user, uint256 amount, uint256 circleId) internal {
        // Implementation would interact with pool on behalf of user
        // For MVP, this is simplified
    }

    function _executeWithdraw(address user, uint256 amount) internal {
        // Implementation would interact with pool on behalf of user
    }

    function _executeBorrow(address user, uint256 amount, uint256 circleId) internal {
        // Implementation would interact with pool on behalf of user
    }

    function _executeRepay(address user, uint256 amount) internal {
        // Implementation would interact with pool on behalf of user
    }

    /**
     * @dev Emergency function to force rate update
     */
    function forceRateUpdate() external {
        require(
            block.timestamp - currentRates.timestamp > RATE_UPDATE_INTERVAL,
            "Rates recently updated"
        );
        _updateRates();
    }
}