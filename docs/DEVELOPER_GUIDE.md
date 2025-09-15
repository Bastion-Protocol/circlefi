# CircleFi Developer Guide

## Overview

CircleFi is a decentralized lending protocol that enables community-driven lending circles backed by domain NFT collateral. This guide will help you integrate CircleFi into your DeFi applications using the Yellow SDK and DOMA API.

## Quick Start

### Installation

```bash
npm install @bastion-protocol/circlefi
# or
yarn add @bastion-protocol/circlefi
```

### Basic Setup

```typescript
import { LendingPool, DomainOracle, YellowSDK } from '@bastion-protocol/circlefi'

// Initialize the lending pool
const lendingPool = new LendingPool({
  address: '0x...', // Deployed contract address
  provider: yourProvider,
})
```

## Core Concepts

### Lending Circles

Lending circles are groups of trusted individuals who pool their resources to provide mutual financial support. Each member takes turns borrowing from the pool while others contribute.

```typescript
// Create a new lending circle
const circle = await lendingPool.createCircle({
  members: ['0x...', '0x...', '0x...'], // Ethereum addresses
  poolAmount: ethers.utils.parseUnits('10000', 6), // 10k USDC
  cycleLength: 86400 * 7, // 1 week cycles
})
```

### Domain Collateral

CircleFi uses domain NFTs as collateral for loans. The DOMA API provides real-time domain valuations.

```typescript
// Check domain value
const domainValue = await domainOracle.getDomainPrice('example.com')
const isValid = await domainOracle.isDomainValid('example.com')
```

### Variable Interest Rates

Interest rates adjust automatically based on pool utilization:

- **Base Rate**: 5% when utilization is 0%
- **Optimal Rate**: Gradually increases to ~10% at 80% utilization
- **Maximum Rate**: Up to 50% when utilization exceeds 80%

```typescript
// Get current rates
const currentRate = await lendingPool.getCurrentInterestRate()
const utilization = await lendingPool.getUtilizationRate()
```

## Integration Guide

### Yellow SDK Integration

The Yellow SDK provides state channels for real-time updates and off-chain coordination.

```typescript
import { YellowSDK } from '@yellow-network/sdk'

const yellowSDK = new YellowSDK({
  apiKey: process.env.YELLOW_SDK_KEY,
  network: 'avalanche-fuji',
})

// Create state channel for a circle
const channelId = await yellowSDK.createStateChannel({
  participants: circleMembers,
  duration: '7d',
})

// Listen for updates
yellowSDK.on('channelUpdate', (channelId, newState) => {
  // Handle circle state changes
  updateCircleUI(newState)
})
```

### DOMA API Integration

Use the DOMA API for real-time domain price feeds:

```typescript
import { DomaAPI } from '@doma/api'

const doma = new DomaAPI({
  apiKey: process.env.DOMA_API_KEY,
})

// Get domain pricing
const domainData = await doma.getDomainInfo('example.com')
console.log(`Domain value: ${domainData.estimatedValue} ETH`)

// Subscribe to price updates
doma.subscribeToUpdates('example.com', (newPrice) => {
  // Update collateral values
  updateCollateralValue(newPrice)
})
```

## Smart Contract Integration

### Lending Pool Contract

```solidity
interface ILendingPool {
    function createCircle(
        address[] calldata members,
        uint256 poolAmount,
        uint256 cycleLength
    ) external returns (uint256);

    function borrow(
        uint256 circleId,
        uint256 amount,
        string calldata domainCollateral
    ) external returns (uint256);

    function repay(uint256 loanId) external;
    function liquidate(uint256 loanId) external;
}
```

### Usage Example

```solidity
contract MyDeFiApp {
    ILendingPool public lendingPool;
    
    constructor(address _lendingPool) {
        lendingPool = ILendingPool(_lendingPool);
    }
    
    function createManagedCircle(
        address[] calldata members,
        uint256 poolAmount
    ) external {
        uint256 circleId = lendingPool.createCircle(
            members,
            poolAmount,
            7 days // 1 week cycles
        );
        
        // Additional logic for managed circles
        emit CircleCreated(circleId, members);
    }
}
```

## Frontend Integration

### React Hooks

Use our React hooks for easy frontend integration:

```typescript
import { useCircleInfo, useLoanInfo, useCreateCircle } from '@bastion-protocol/circlefi-react'

function CircleManagement() {
  const { data: circleInfo } = useCircleInfo(circleId)
  const { write: createCircle } = useCreateCircle()
  
  const handleCreateCircle = () => {
    createCircle({
      members: ['0x...', '0x...'],
      poolAmount: '10000',
      cycleLength: 604800, // 1 week
    })
  }
  
  return (
    <div>
      <h2>Circle: {circleInfo?.members.length} members</h2>
      <button onClick={handleCreateCircle}>Create New Circle</button>
    </div>
  )
}
```

### Wallet Notifications

Integrate with Wagmi for wallet notifications:

```typescript
import { useNotifications } from '@bastion-protocol/circlefi-react'

function NotificationCenter() {
  const { notifications, markAsRead } = useNotifications()
  
  return (
    <div>
      {notifications.map(notification => (
        <div key={notification.id} className="notification">
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Subgraph Integration

Query historical data using our GraphQL subgraph:

```graphql
query GetCircleHistory($circleId: ID!) {
  circle(id: $circleId) {
    id
    members {
      address
      joinedAt
    }
    loans {
      id
      borrower
      amount
      domainCollateral
      status
      createdAt
    }
    totalBorrowed
    isActive
  }
}
```

### Usage in React

```typescript
import { useQuery } from '@apollo/client'

const GET_CIRCLE_HISTORY = gql`
  query GetCircleHistory($circleId: ID!) {
    circle(id: $circleId) {
      loans {
        id
        amount
        status
        createdAt
      }
    }
  }
`

function CircleHistory({ circleId }) {
  const { loading, error, data } = useQuery(GET_CIRCLE_HISTORY, {
    variables: { circleId },
  })
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {data?.circle?.loans.map(loan => (
        <div key={loan.id}>
          Loan #{loan.id}: {loan.amount} - {loan.status}
        </div>
      ))}
    </div>
  )
}
```

## Testing

### Unit Testing

```typescript
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('LendingPool Integration', () => {
  it('should create circle and handle borrowing', async () => {
    const [owner, ...users] = await ethers.getSigners()
    
    // Deploy contracts
    const lendingPool = await deployLendingPool()
    
    // Create circle
    const tx = await lendingPool.createCircle(
      users.slice(0, 3).map(u => u.address),
      ethers.utils.parseUnits('10000', 6),
      86400 * 7
    )
    
    expect(tx).to.emit(lendingPool, 'CircleCreated')
  })
})
```

### Property-Based Testing

```typescript
import fc from 'fast-check'

describe('Interest Rate Properties', () => {
  it('should maintain rate bounds', async () => {
    await fc.assert(fc.asyncProperty(
      fc.integer(0, 100), // utilization rate
      async (utilization) => {
        const rate = await calculateInterestRate(utilization)
        expect(rate).to.be.gte(5) // Base rate
        expect(rate).to.be.lte(50) // Max rate
      }
    ))
  })
})
```

## Error Handling

### Common Errors

```typescript
try {
  await lendingPool.borrow(circleId, amount, domain)
} catch (error) {
  switch (error.code) {
    case 'INSUFFICIENT_COLLATERAL':
      // Handle insufficient collateral
      break
    case 'NOT_YOUR_TURN':
      // Handle wrong borrower
      break
    case 'INVALID_DOMAIN':
      // Handle invalid domain
      break
    default:
      // Handle unexpected errors
      console.error('Unexpected error:', error.message)
  }
}
```

## Best Practices

### Security

1. Always validate domain ownership before using as collateral
2. Implement proper access controls for circle management
3. Use slippage protection for large transactions
4. Monitor liquidation health regularly

### Performance

1. Cache domain price data to reduce API calls
2. Use subgraph for historical data queries
3. Implement proper loading states in UI
4. Batch contract calls when possible

### User Experience

1. Provide clear explanations of circle mechanics
2. Show real-time interest rate updates
3. Implement push notifications for important events
4. Use progressive disclosure for complex features

## API Reference

### LendingPool Methods

```typescript
interface LendingPool {
  // Read methods
  getUserDeposits(user: string): Promise<BigNumber>
  getCircleInfo(circleId: number): Promise<CircleInfo>
  getLoanInfo(loanId: number): Promise<LoanInfo>
  getCurrentInterestRate(): Promise<number>
  getUtilizationRate(): Promise<number>
  
  // Write methods
  deposit(amount: BigNumber): Promise<TransactionResponse>
  withdraw(amount: BigNumber): Promise<TransactionResponse>
  createCircle(params: CreateCircleParams): Promise<TransactionResponse>
  borrow(params: BorrowParams): Promise<TransactionResponse>
  repay(loanId: number): Promise<TransactionResponse>
  liquidate(loanId: number): Promise<TransactionResponse>
}
```

## Deployment

### Avalanche Fuji Testnet

```bash
# Deploy to testnet
npm run deploy:fuji

# Verify contracts
npm run verify:fuji

# Set up initial pools
npm run setup:pools
```

### Environment Variables

```bash
# Required
PRIVATE_KEY=0x...
YELLOW_SDK_KEY=your_yellow_api_key
DOMA_API_KEY=your_doma_api_key

# Optional
INFURA_PROJECT_ID=your_infura_id
ETHERSCAN_API_KEY=your_etherscan_key
```

## Support

- **Documentation**: [https://docs.circlefi.bastion.com](https://docs.circlefi.bastion.com)
- **Discord**: [https://discord.gg/bastion-protocol](https://discord.gg/bastion-protocol)
- **GitHub**: [https://github.com/Bastion-Protocol/circlefi](https://github.com/Bastion-Protocol/circlefi)

## License

MIT License - see LICENSE file for details.