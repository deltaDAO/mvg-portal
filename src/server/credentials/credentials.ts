'use server'
import { GaiaXVerifiablePresentationArray } from '@utils/verifiablePresentations/types'
import { Address } from 'wagmi'

interface ICredentialsService {
  getAddressCredentials(
    address: Address
  ): Promise<GaiaXVerifiablePresentationArray>
}

export default ICredentialsService
