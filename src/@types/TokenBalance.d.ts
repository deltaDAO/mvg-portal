interface UserBalance {
  native: {
    symbol: string
    balance: string
  }
  approved?: TokenBalances
}

interface TokenBalances {
  [key: string]: string
}
