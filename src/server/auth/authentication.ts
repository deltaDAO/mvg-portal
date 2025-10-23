'use server'
import { Nonce } from '@utils/consents/types'
import { Axios, AxiosResponse } from 'axios'

interface IAuthenticationService {
  getClient(token?: string): Axios
  nonce(publicAddress: string, chainId: string, origin: string): Promise<Nonce>
  validate(
    publicAddress: string,
    encodedMessage: string
  ): Promise<AxiosResponse>
}

export default IAuthenticationService
