interface UserBalance {
  native: TokenBalances
  approved?: TokenBalances
}

interface TokenBalances {
  [key: string]: string
}
