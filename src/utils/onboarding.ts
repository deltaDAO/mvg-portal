import { GX_NETWORK_ID } from '../../chains.config'
import { UserBalance } from '../@types/TokenBalance'

interface IErrorParams {
  accountId: string
  web3Provider: boolean
  networkId: number
  balance: null | UserBalance
}

const getErrorMessage = ({
  accountId,
  web3Provider,
  networkId,
  balance
}: IErrorParams): string => {
  if (!accountId || !web3Provider) {
    return 'Looks like your account is not connected to the portal, please go back to the "Connect" step.'
  }
  if (networkId !== GX_NETWORK_ID) {
    return 'Looks like you are not connected to the Gaia-X testnet, please go back to the "Network" step.'
  }
  if (balance !== null) {
    if (Number(balance?.eth) === 0) {
      return "Looks like you don't have any GX test tokens, please click on the claim button to get some."
    }
    if (Number(balance?.ocean) === 0) {
      return "Looks like you don't have any OCEAN test tokens, please click on the claim button to get some."
    }
  }

  return 'Looks like something went wrong, please try again.'
}

export { getErrorMessage }
