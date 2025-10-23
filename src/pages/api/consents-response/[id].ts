import IConsentResponseService from '@/server/consents/consents-response'
import { container } from '@/server/di/container'
import type { NextApiRequest, NextApiResponse } from 'next'

const consentResponseService =
  container.get<IConsentResponseService>('ConsentResponse')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/consents-response/[id] HIT')

  const { id } = req.query

  if (!id || Array.isArray(id)) {
    console.error('[API] Missing "id" param in URL')
    return res.status(400).json({ error: 'Missing ID' })
  }

  switch (req.method) {
    case 'POST': {
      const { reason, permitted } = req.body
      return consentResponseService
        .createConsentResponse(id, reason, permitted, req.headers.authorization)
        .then((results) => res.status(201).json(results))
        .catch((error) => {
          console.error(error)

          const status = error.response?.status || 500
          const data = error.response?.data || {
            message: 'Error responding consent'
          }

          return res.status(status).json(data)
        })
    }
    case 'DELETE': {
      return consentResponseService
        .deleteConsentResponse(id, req.headers.authorization)
        .then(() => res.status(200).json({}))
        .catch((error) => {
          console.error(error)

          const status = error.response?.status || 500
          const data = error.response?.data || {
            message: 'Error deleting consent'
          }

          return res.status(status).json(data)
        })
    }
    default:
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
