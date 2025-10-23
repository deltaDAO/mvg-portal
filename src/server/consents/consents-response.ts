'use server'

import { Consent, PossibleRequests } from '@utils/consents/types'

interface IConsentResponseService {
  createConsentResponse(
    consentId: string,
    reason: string,
    permitted?: PossibleRequests,
    token?: string
  ): Promise<Consent>

  deleteConsentResponse(consentId: string, token?: string): Promise<void>
}

export default IConsentResponseService
