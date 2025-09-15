import {
  CircleCreated,
  LoanCreated,
  LoanRepaid,
  LoanLiquidated,
  Deposit,
  Withdrawal
} from '../generated/LendingPool/LendingPool'
import { Circle, User, Loan, Deposit as DepositEntity, Withdrawal as WithdrawalEntity, ProtocolStats } from '../generated/schema'
import { BigInt, Address } from '@graphprotocol/graph-ts'

export function handleCircleCreated(event: CircleCreated): void {
  let circle = new Circle(event.params.param0.toString())
  circle.poolAmount = event.params.param2
  circle.currentBorrower = BigInt.fromI32(0)
  circle.cycleLength = BigInt.fromI32(604800) // Default 1 week
  circle.startTime = event.block.timestamp
  circle.isActive = true
  circle.totalBorrowed = BigInt.fromI32(0)
  circle.createdAt = event.block.timestamp
  circle.updatedAt = event.block.timestamp

  // Create member relationships
  let members: string[] = []
  for (let i = 0; i < event.params.param1.length; i++) {
    let memberAddress = event.params.param1[i]
    let member = User.load(memberAddress.toHexString())
    if (member == null) {
      member = new User(memberAddress.toHexString())
      member.totalDeposited = BigInt.fromI32(0)
      member.totalWithdrawn = BigInt.fromI32(0)
      member.totalBorrowed = BigInt.fromI32(0)
      member.totalRepaid = BigInt.fromI32(0)
      member.activeLoans = BigInt.fromI32(0)
      member.createdAt = event.block.timestamp
      member.updatedAt = event.block.timestamp
    }
    members.push(memberAddress.toHexString())
    member.save()
  }
  circle.members = members

  circle.save()

  // Update protocol stats
  updateProtocolStats()
}

export function handleLoanCreated(event: LoanCreated): void {
  let loan = new Loan(event.params.param0.toString())
  let borrower = User.load(event.params.param1.toHexString())
  
  if (borrower == null) {
    borrower = new User(event.params.param1.toHexString())
    borrower.totalDeposited = BigInt.fromI32(0)
    borrower.totalWithdrawn = BigInt.fromI32(0)
    borrower.totalBorrowed = BigInt.fromI32(0)
    borrower.totalRepaid = BigInt.fromI32(0)
    borrower.activeLoans = BigInt.fromI32(0)
    borrower.createdAt = event.block.timestamp
  }

  loan.borrower = borrower.id
  loan.amount = event.params.param2
  loan.domainCollateral = event.params.param3
  loan.isActive = true
  loan.isLiquidated = false
  loan.startTime = event.block.timestamp
  loan.dueTime = event.block.timestamp.plus(BigInt.fromI32(604800)) // 1 week default
  loan.createdAt = event.block.timestamp
  loan.updatedAt = event.block.timestamp

  // Update borrower stats
  borrower.totalBorrowed = borrower.totalBorrowed.plus(event.params.param2)
  borrower.activeLoans = borrower.activeLoans.plus(BigInt.fromI32(1))
  borrower.updatedAt = event.block.timestamp

  loan.save()
  borrower.save()

  updateProtocolStats()
}

export function handleLoanRepaid(event: LoanRepaid): void {
  let loan = Loan.load(event.params.param0.toString())
  if (loan != null) {
    loan.isActive = false
    loan.repaidAmount = event.params.param2
    loan.updatedAt = event.block.timestamp

    let borrower = User.load(loan.borrower)
    if (borrower != null) {
      borrower.totalRepaid = borrower.totalRepaid.plus(event.params.param2)
      borrower.activeLoans = borrower.activeLoans.minus(BigInt.fromI32(1))
      borrower.updatedAt = event.block.timestamp
      borrower.save()
    }

    loan.save()
  }

  updateProtocolStats()
}

export function handleLoanLiquidated(event: LoanLiquidated): void {
  let loan = Loan.load(event.params.param0.toString())
  if (loan != null) {
    loan.isActive = false
    loan.isLiquidated = true
    loan.liquidatedBy = event.params.param2.toHexString()
    loan.updatedAt = event.block.timestamp

    let borrower = User.load(loan.borrower)
    if (borrower != null) {
      borrower.activeLoans = borrower.activeLoans.minus(BigInt.fromI32(1))
      borrower.updatedAt = event.block.timestamp
      borrower.save()
    }

    loan.save()
  }

  updateProtocolStats()
}

export function handleDeposit(event: Deposit): void {
  let user = User.load(event.params.param0.toHexString())
  if (user == null) {
    user = new User(event.params.param0.toHexString())
    user.totalDeposited = BigInt.fromI32(0)
    user.totalWithdrawn = BigInt.fromI32(0)
    user.totalBorrowed = BigInt.fromI32(0)
    user.totalRepaid = BigInt.fromI32(0)
    user.activeLoans = BigInt.fromI32(0)
    user.createdAt = event.block.timestamp
  }

  let deposit = new DepositEntity(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  )
  deposit.user = user.id
  deposit.amount = event.params.param1
  deposit.timestamp = event.block.timestamp
  deposit.blockNumber = event.block.number
  deposit.transactionHash = event.transaction.hash

  user.totalDeposited = user.totalDeposited.plus(event.params.param1)
  user.updatedAt = event.block.timestamp

  deposit.save()
  user.save()

  updateProtocolStats()
}

export function handleWithdrawal(event: Withdrawal): void {
  let user = User.load(event.params.param0.toHexString())
  if (user != null) {
    let withdrawal = new WithdrawalEntity(
      event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
    )
    withdrawal.user = user.id
    withdrawal.amount = event.params.param1
    withdrawal.timestamp = event.block.timestamp
    withdrawal.blockNumber = event.block.number
    withdrawal.transactionHash = event.transaction.hash

    user.totalWithdrawn = user.totalWithdrawn.plus(event.params.param1)
    user.updatedAt = event.block.timestamp

    withdrawal.save()
    user.save()
  }

  updateProtocolStats()
}

function updateProtocolStats(): void {
  let stats = ProtocolStats.load('protocol')
  if (stats == null) {
    stats = new ProtocolStats('protocol')
    stats.totalSupply = BigInt.fromI32(0)
    stats.totalBorrowed = BigInt.fromI32(0)
    stats.totalCircles = BigInt.fromI32(0)
    stats.totalLoans = BigInt.fromI32(0)
    stats.totalUsers = BigInt.fromI32(0)
    stats.utilizationRate = BigInt.fromI32(0)
    stats.currentInterestRate = BigInt.fromI32(5) // Default 5%
  }

  // These would be calculated based on current state
  // For now, we'll increment counters
  stats.updatedAt = BigInt.fromI32(Date.now())
  stats.save()
}