'use server'
import IAuthenticationService from '@/server/auth/authentication'
import { container } from '@/server/di/container'
import IEnvironmentService from '@/server/env/env'
import { Nonce } from '@utils/consents/types'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { injectable } from 'inversify'

@injectable()
export class AuthenticationService implements IAuthenticationService {
  private client: AxiosInstance

  private getBaseClient(): AxiosInstance {
    if (this.client) return this.client

    const environment = container.get<IEnvironmentService>('Env')
    this.client = axios.create({
      baseURL: environment.get('CONSENTS_API_URL'),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return this.client
  }

  getClient(token?: string): AxiosInstance {
    const baseClient = this.getBaseClient()

    return axios.create({
      baseURL: baseClient.defaults.baseURL,
      headers: {
        ...(token ? { Authorization: token } : {})
      }
    })
  }

  async nonce(
    publicAddress: string,
    chainId: string,
    origin: string
  ): Promise<Nonce> {
    return this.getClient()
      .get('/auth/wallet/nonce/', {
        params: {
          address: publicAddress,
          chain_id: chainId
        },
        headers: {
          Origin: origin
        }
      })
      .then(({ data }) => data)
  }

  async validate(
    publicAddress: string,
    encodedMessage: string
  ): Promise<AxiosResponse> {
    return this.getClient().post('/auth/wallet/verify/', {
      address: publicAddress,
      signature: encodedMessage
    })
  }
}
