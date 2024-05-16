import { getSupportedChainIds } from '../../chains.config'

interface IErrorParams {
  accountId: string
  web3Provider: boolean
  networkId: number
}

const getErrorMessage = ({
  accountId,
  web3Provider,
  networkId
}: IErrorParams): string => {
  if (!accountId || !web3Provider) {
    return 'Looks like your account is not connected to the portal, please go back to the "Connect" step.'
  }
  if (!getSupportedChainIds().includes(networkId)) {
    return 'Looks like you are not connected to a supported network, please go back to the "Network" step.'
  }

  return 'Looks like something went wrong, please try again.'
}

export { getErrorMessage }
