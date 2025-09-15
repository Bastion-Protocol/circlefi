import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { avalancheFuji, hardhat } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const { chains, publicClient } = configureChains(
  [avalancheFuji, hardhat],
  [publicProvider()]
)

const { wallets } = getDefaultWallets({
  appName: 'CircleFi',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo',
  chains,
})

const connectors = connectorsForWallets([
  ...wallets,
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export { chains, wagmiConfig }