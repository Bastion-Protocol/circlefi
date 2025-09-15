import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { toast } from 'react-hot-toast'

// Contract ABIs (simplified for demonstration)
const LENDING_POOL_ABI = [
  // Read functions
  {
    name: 'getUserDeposits',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getCircleInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'circleId', type: 'uint256' }],
    outputs: [{ name: '', type: 'tuple', components: [
      { name: 'members', type: 'address[]' },
      { name: 'poolAmount', type: 'uint256' },
      { name: 'currentBorrower', type: 'uint256' },
      { name: 'cycleLength', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
    ]}],
  },
  {
    name: 'getLoanInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'loanId', type: 'uint256' }],
    outputs: [{ name: '', type: 'tuple', components: [
      { name: 'borrower', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'collateralValue', type: 'uint256' },
      { name: 'domainCollateral', type: 'string' },
      { name: 'interestRate', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'dueTime', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'isLiquidated', type: 'bool' },
    ]}],
  },
  {
    name: 'getCurrentInterestRate',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getUtilizationRate',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Write functions
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'createCircle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'members', type: 'address[]' },
      { name: 'poolAmount', type: 'uint256' },
      { name: 'cycleLength', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'borrow',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'circleId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'domainCollateral', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'repay',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'loanId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'liquidate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'loanId', type: 'uint256' }],
    outputs: [],
  },
] as const

// Contract addresses (these would be updated after deployment)
const LENDING_POOL_ADDRESS = process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS || '0x...'
const MOCK_USDC_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || '0x...'

// Hook for reading user deposits
export function useUserDeposits(userAddress?: string) {
  return useContractRead({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'getUserDeposits',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    enabled: Boolean(userAddress),
    watch: true,
  })
}

// Hook for reading circle information
export function useCircleInfo(circleId: number) {
  return useContractRead({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'getCircleInfo',
    args: [BigInt(circleId)],
    enabled: circleId > 0,
    watch: true,
  })
}

// Hook for reading loan information
export function useLoanInfo(loanId: number) {
  return useContractRead({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'getLoanInfo',
    args: [BigInt(loanId)],
    enabled: loanId > 0,
    watch: true,
  })
}

// Hook for reading current interest rate
export function useCurrentInterestRate() {
  return useContractRead({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'getCurrentInterestRate',
    watch: true,
  })
}

// Hook for reading utilization rate
export function useUtilizationRate() {
  return useContractRead({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'getUtilizationRate',
    watch: true,
  })
}

// Hook for depositing funds
export function useDeposit(amount: string) {
  const { config } = usePrepareContractWrite({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'deposit',
    args: amount ? [parseUnits(amount, 6)] : undefined,
    enabled: Boolean(amount),
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('Deposit successful!')
    },
    onError: (error) => {
      toast.error(`Deposit failed: ${error.message}`)
    },
  })
}

// Hook for withdrawing funds
export function useWithdraw(amount: string) {
  const { config } = usePrepareContractWrite({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'withdraw',
    args: amount ? [parseUnits(amount, 6)] : undefined,
    enabled: Boolean(amount),
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('Withdrawal successful!')
    },
    onError: (error) => {
      toast.error(`Withdrawal failed: ${error.message}`)
    },
  })
}

// Hook for creating a circle
export function useCreateCircle(members: string[], poolAmount: string, cycleLength: number) {
  const { config } = usePrepareContractWrite({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'createCircle',
    args: (members.length > 0 && poolAmount && cycleLength) ? [
      members as `0x${string}`[],
      parseUnits(poolAmount, 6),
      BigInt(cycleLength),
    ] : undefined,
    enabled: Boolean(members.length > 0 && poolAmount && cycleLength),
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('Circle created successfully!')
    },
    onError: (error) => {
      toast.error(`Circle creation failed: ${error.message}`)
    },
  })
}

// Hook for borrowing from a circle
export function useBorrow(circleId: number, amount: string, domainCollateral: string) {
  const { config } = usePrepareContractWrite({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'borrow',
    args: (circleId && amount && domainCollateral) ? [
      BigInt(circleId),
      parseUnits(amount, 6),
      domainCollateral,
    ] : undefined,
    enabled: Boolean(circleId && amount && domainCollateral),
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('Loan created successfully!')
    },
    onError: (error) => {
      toast.error(`Borrowing failed: ${error.message}`)
    },
  })
}

// Hook for repaying a loan
export function useRepay(loanId: number) {
  const { config } = usePrepareContractWrite({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'repay',
    args: loanId ? [BigInt(loanId)] : undefined,
    enabled: Boolean(loanId),
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('Loan repaid successfully!')
    },
    onError: (error) => {
      toast.error(`Repayment failed: ${error.message}`)
    },
  })
}

// Hook for liquidating a loan
export function useLiquidate(loanId: number) {
  const { config } = usePrepareContractWrite({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'liquidate',
    args: loanId ? [BigInt(loanId)] : undefined,
    enabled: Boolean(loanId),
  })

  return useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('Liquidation successful!')
    },
    onError: (error) => {
      toast.error(`Liquidation failed: ${error.message}`)
    },
  })
}

// Utility function to format token amounts
export function formatTokenAmount(amount: bigint | undefined, decimals = 6): string {
  if (!amount) return '0'
  return formatUnits(amount, decimals)
}

// Utility function to format percentages
export function formatPercentage(value: bigint | undefined): string {
  if (!value) return '0%'
  return `${value.toString()}%`
}