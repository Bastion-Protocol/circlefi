# CircleFi - Decentralized Lending Circles

CircleFi is a innovative DeFi protocol that enables community-driven lending circles backed by domain NFT collateral. Built on Avalanche with integration to Yellow SDK state channels and DOMA domain pricing API.

## Features

### Smart Contract Enhancements ✅
- **Liquidation Logic**: Automated liquidation for overdue loans and under-collateralized positions
- **Variable Interest Rates**: Dynamic rates based on pool utilization (5-50% range)
- **Property-Based Testing**: Comprehensive test suite with invariant checking

### Frontend & UX ✅
- **Circle Management Dashboard**: Complete interface for borrower rotation and repayment tracking
- **Wallet Notifications**: Real-time notifications via Wagmi integration
- **Onboarding Flow**: Guided user experience with tooltips and explanatory modals

### Integration Tasks ✅
- **Mock Domain Oracle**: DOMA API mock for domain price feeds with realistic data
- **Yellow SDK Demo**: State channel integration for real-time circle updates
- **Subgraph Support**: GraphQL indexing for loans, circles, and collateral tracking

### Developer Experience ✅
- **Comprehensive Documentation**: Complete integration guide for Yellow SDK + DOMA
- **Hardhat Scripts**: Automated deployment and pool setup scripts
- **Testnet Deployment**: Ready for Avalanche Fuji testnet deployment

## Quick Start

### Installation

```bash
git clone https://github.com/Bastion-Protocol/circlefi
cd circlefi
npm install
```

### Development

```bash
# Compile contracts
npm run build

# Run tests
npm run test

# Start frontend
npm run dev

# Deploy to testnet
npm run deploy:fuji
```

### Project Structure

```
circlefi/
├── contracts/              # Smart contracts
│   ├── LendingPool.sol     # Main lending pool contract
│   ├── interfaces/         # Contract interfaces
│   └── mocks/              # Mock contracts for testing
├── frontend/               # React/Next.js frontend
│   ├── src/app/           # App pages
│   ├── src/components/    # React components
│   └── src/hooks/         # Wagmi hooks
├── test/                  # Contract tests
├── scripts/               # Deployment scripts
├── docs/                  # Documentation
└── subgraph/             # GraphQL subgraph
```

## Core Features

### Lending Circles

Create trusted lending circles where members take turns borrowing:

```typescript
const circle = await createCircle({
  members: ['0x...', '0x...', '0x...'],
  poolAmount: ethers.utils.parseUnits('10000', 6),
  cycleLength: 604800 // 1 week
})
```

### Domain Collateral

Use domain NFTs as collateral with real-time pricing:

```typescript
const loan = await borrow({
  circleId: 1,
  amount: ethers.utils.parseUnits('2500', 6),
  domainCollateral: 'example.com'
})
```

### Variable Interest Rates

Interest rates adjust automatically based on utilization:
- 0-80% utilization: 5-10% APR
- 80-100% utilization: 10-50% APR

## Testing

The project includes comprehensive testing:

### Unit Tests
```bash
npm run test
```

### Property-Based Tests
```bash
npm run test:property
```

### Fuzz Testing
```bash
npm run test:fuzz
```

## Deployment

### Local Development
```bash
npx hardhat node
npm run deploy:local
```

### Avalanche Fuji Testnet
```bash
npm run deploy:fuji
```

## Integration Examples

### React Hook Usage
```typescript
import { useCircleInfo, useBorrow } from '@/hooks/useContracts'

function BorrowingInterface({ circleId }) {
  const { data: circleInfo } = useCircleInfo(circleId)
  const { write: borrow } = useBorrow(circleId, '1000', 'mydomain.com')
  
  return (
    <button onClick={() => borrow?.()}>
      Borrow from Circle
    </button>
  )
}
```

### Contract Integration
```solidity
contract MyDeFiApp {
    ILendingPool public lendingPool;
    
    function integrateWithCircle(uint256 circleId) external {
        // Your integration logic here
        lendingPool.borrow(circleId, amount, domain);
    }
}
```

## Architecture

### Smart Contracts
- **LendingPool**: Main contract handling deposits, loans, and liquidations
- **MockDomainOracle**: Price feed for domain collateral
- **MockYellowSDK**: State channel management

### Frontend
- **Next.js 14**: Modern React framework
- **Tailwind CSS**: Utility-first styling
- **Wagmi**: Ethereum integration
- **RainbowKit**: Wallet connection

### Backend Services
- **Hardhat**: Development environment
- **Subgraph**: GraphQL indexing
- **Yellow SDK**: State channels
- **DOMA API**: Domain pricing

## Security Features

- **Reentrancy Protection**: All state-changing functions protected
- **Access Controls**: Role-based permissions
- **Liquidation Safeguards**: Automatic liquidation for overdue/under-collateralized loans
- **Interest Rate Bounds**: Mathematically bounded rates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- **Documentation**: [Developer Guide](docs/DEVELOPER_GUIDE.md)
- **Discord**: Join our community
- **Twitter**: Follow for updates

---

Built with ❤️ by [Bastion Protocol](https://bastion.com)