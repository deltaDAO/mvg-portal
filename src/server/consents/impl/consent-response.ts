'use server'
import IAuthenticationService from '@/server/auth/authentication'
import { container } from '@/server/di/container'
import { validateWithSchema } from '@utils/consents/api'
import { ConsentSchema } from '@utils/consents/schemas'
import { Consent, PossibleRequests } from '@utils/consents/types'
import { injectable } from 'inversify'
import IConsentResponseService from '../consents-response'

@injectable()
export class ConsentResponseService implements IConsentResponseService {
  getClient = (token?: string) =>
    container.get<IAuthenticationService>('Authentication').getClient(token)

  async createConsentResponse(
    consentId: string,
    reason: string,
    permitted?: PossibleRequests,
    token?: string
  ): Promise<Consent> {
    console.log(permitted)
    const isPermitted =
      permitted && Object.values(permitted).some((value) => Boolean(value))

    return this.getClient(token)
      .post(`/consents/${consentId}/response/`, {
        reason,
        permitted: isPermitted ? JSON.stringify(permitted) : '0'
      })
      .then(validateWithSchema(ConsentSchema))
  }

  async deleteConsentResponse(
    consentId: string,
    token?: string
  ): Promise<void> {
    return this.getClient(token).delete(
      `/consents/${consentId}/delete-response/`
    )
  }
}
