export function assetStateToString(state: number): string {
  switch (state) {
    case 0:
      return 'Active'
    case 1:
      return 'EndOfLife'
    case 2:
      return 'Deprecated'
    case 3:
      return 'RevokedByPublisher'
    case 4:
      return 'OrderingIsTemporaryDisabled'
    case 5:
      return 'Unlisted'

    default:
      break
  }
}

export function assetStateToNumber(state: string): number {
  switch (state) {
    case 'Active':
      return 0
    case 'EndOfLife':
      return 1
    case 'Deprecated':
      return 2
    case 'RevokedByPublisher':
      return 3
    case 'OrderingIsTemporaryDisabled':
      return 4
    case 'Unlisted':
      return 5

    default:
      break
  }
}
