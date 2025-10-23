'use server'
import IAuthenticationService from '@/server/auth/authentication'
import IConsentsService from '@/server/consents/consents'
import { container } from '@/server/di/container'
import {
  Consent,
  ConsentDirection,
  PossibleRequests,
  UserConsentsData
} from '@utils/consents/types'
import { injectable } from 'inversify'

const missingCallback = <T>(error: any, defaultValue: T) => {
  if (!error.response || error.response?.status === 404) return defaultValue
  console.error('Error fetching user consents', error)
  throw error
}

const defaultMissingCallback = <T>(defaultValue: T) => {
  return (error) => missingCallback(error, defaultValue)
}

@injectable()
export class ConsentsService implements IConsentsService {
  getClient = (token?: string) =>
    container.get<IAuthenticationService>('Authentication').getClient(token)

  async createConsent(
    datasetDid: string,
    algorithmDid: string,
    request: PossibleRequests,
    reason?: string,
    token?: string
  ): Promise<Consent> {
    return this.getClient(token)
      .post('/consents/', {
        reason,
        dataset: datasetDid,
        algorithm: algorithmDid,
        request: JSON.stringify(request)
      })
      .then((data) => data.data)
  }

  async getAddressConsents(
    address: string,
    direction?: ConsentDirection
  ): Promise<Array<Consent>> {
    return this.getClient()
      .get(`/users/${address}/${direction?.toLowerCase() ?? ''}/`)
      .then(({ data }) => data)
      .catch(defaultMissingCallback([]))
  }

  async getAddressConsentsAmount(
    address: string
  ): Promise<UserConsentsData | undefined> {
    return this.getClient()
      .get(`/users/${address}/`)
      .then((data) => data.data)
      .catch(defaultMissingCallback(undefined))
  }

  async deleteConsent(consentId: string, token?: string): Promise<void> {
    return this.getClient(token).delete(`/consents/${consentId}/`)
  }
}
