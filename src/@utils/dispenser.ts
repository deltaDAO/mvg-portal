import { LoggerInstance, Datatoken } from '@oceanprotocol/lib'
import { Signer, ethers } from 'ethers'

export async function setMinterToPublisher(
  signer: Signer,
  datatokenAddress: string,
  accountId: string,
  setError: (msg: string) => void
): Promise<ethers.providers.TransactionResponse> {
  const datatokenInstance = new Datatoken(signer)

  const removeMinterTx = await datatokenInstance.removeMinter(
    datatokenAddress,
    accountId,
    accountId
  )

  if (!removeMinterTx) {
    setError('Updating DDO failed.')
    LoggerInstance.error('Failed at cancelMinter')
  }

  await removeMinterTx.wait()

  return removeMinterTx
}

export async function setMinterToDispenser(
  signer: Signer,
  datatokenAddress: string,
  accountId: string,
  setError: (msg: string) => void
): Promise<ethers.providers.TransactionResponse> {
  const datatokenInstance = new Datatoken(signer)

  const addMinterTx = await datatokenInstance.addMinter(
    datatokenAddress,
    accountId,
    accountId
  )
  if (!addMinterTx) {
    setError('Updating DDO failed.')
    LoggerInstance.error('Failed at makeMinter')
  }
  await addMinterTx.wait()

  return addMinterTx
}
