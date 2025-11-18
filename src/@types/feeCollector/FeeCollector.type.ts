export type TokenDetails = {
  address: string
  decimals: number
  symbol: string
  name: string
}

export type Fees = {
  approved: boolean
  feePercentage: string
  maxFee: string
  minFee: string
  tokenAddress: string
}
