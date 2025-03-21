import { WalletClient } from 'viem'
import { ethers } from 'ethers'

export type GetEthersSignerParams = {
  client: WalletClient
  chainId: number
}

export async function getEthersSigner({
  client,
  chainId
}: GetEthersSignerParams) {
  if (!client) throw new Error('No wallet client provided')

  const ethersProvider = new ethers.providers.Web3Provider(
    client.transport as any,
    chainId
  )
  const { account } = client

  if (!account) throw new Error('No account found in wallet client')

  return ethersProvider.getSigner(account.address)
}
