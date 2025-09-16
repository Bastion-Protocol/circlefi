# CircleFi

A decentralized lending protocol built on Avalanche featuring small trusted lending circles, DOMA domain collateral, and Yellow SDK integration for gasless transactions.

## Features

- **Small Lending Circles**: Create or join intimate 3-4 member lending circles for better rates
- **USDC Lending**: Supply and borrow USDC with competitive interest rates
- **DOMA Domain Collateral**: Use high-value domain names as collateral for loans
- **Yellow SDK Integration**: Real-time rate updates and gasless transactions via state channels
- **Avalanche Network**: Fast, low-cost transactions with enterprise security

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **RainbowKit** for wallet connections
- **Wagmi** for Ethereum interactions
- **Lucide React** for icons

### Smart Contracts
- **Solidity ^0.8.19** for smart contracts
- **Foundry** for development, testing, and deployment
- **OpenZeppelin** for security primitives
- **Aave V3/Compound V3** architecture for lending pools

## Project Structure

```
circlefi/
├── contracts/                 # Smart contracts
│   ├── src/                  # Contract source files
│   │   ├── CircleFiPool.sol  # Main lending pool
│   │   ├── DOMACollateral.sol # Domain NFT collateral
│   │   ├── MockUSDC.sol      # Test USDC token
│   │   └── YellowIntegration.sol # Yellow SDK integration
│   ├── test/                 # Contract tests
│   └── script/               # Deployment scripts
├── src/                      # Frontend source
│   ├── app/                  # Next.js app router pages
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utilities and constants
└── public/                   # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- Foundry (for smart contracts)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Bastion-Protocol/circlefi.git
cd circlefi
```

2. Install dependencies:
```bash
npm install
```

3. Install Foundry (if not already installed):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

4. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration.

### Development

1. Start the development server:
```bash
npm run dev
```

2. Deploy contracts locally:
```bash
npm run compile
npm run deploy:local
```

3. Run contract tests:
```bash
npm run test:contracts
```

## Smart Contract Architecture

### CircleFiPool
Core lending pool contract based on Aave V3/Compound V3 architecture:
- USDC supply and borrowing
- Interest rate calculations
- Circle management (3-4 members)
- Liquidation mechanics

### DOMACollateral
NFT contract for DOMA domain collateral:
- Domain minting and valuation
- Collateral management
- Loan-to-value calculations
- Oracle integration for pricing

### YellowIntegration
Yellow SDK integration for enhanced UX:
- Real-time rate updates
- Gasless transaction execution
- State channel management
- Transaction relaying

## Key Features

### Lending Circles
- **Small Groups**: Maximum 4 members per circle
- **Trust-Based**: Enhanced rates for known participants
- **Flexible**: Create or join existing circles
- **Transparent**: All circle data on-chain

### Domain Collateral
- **High-Value Assets**: Premium domain names as collateral
- **50% LTV**: Conservative loan-to-value ratios
- **Oracle Pricing**: Regular valuation updates
- **NFT Standard**: ERC-721 compliant domain tokens

### Interest Rate Model
- **Dynamic Rates**: Based on utilization and circle performance
- **Optimal Utilization**: 80% target utilization
- **Base Rate**: 2% minimum borrowing rate
- **Slope Calculations**: Progressive rate increases

### Yellow SDK Benefits
- **Gasless Transactions**: No transaction fees for users
- **Real-Time Updates**: Live rate and balance updates
- **State Channels**: Off-chain computation with on-chain settlement
- **Enhanced UX**: Seamless DeFi interactions

## Deployment

### Testnet (Avalanche Fuji)
```bash
npm run deploy:fuji
```

### Mainnet (Avalanche)
```bash
npm run deploy:avalanche
```

## Testing

### Smart Contracts
```bash
npm run test:contracts
```

### Frontend
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security

This is an MVP implementation. For production deployment:
- Complete security audit required
- Multi-signature wallet setup
- Emergency pause mechanisms
- Rate limiting implementation
- Oracle redundancy

## License

Licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.

## Links

- [Avalanche Network](https://www.avax.network/)
- [DOMA Domains](https://doma.to/)
- [Yellow SDK](https://yellow.org/)
- [Aave V3](https://docs.aave.com/developers/)
- [Compound V3](https://docs.compound.finance/)

---

Built with ❤️ for the future of decentralized finance.