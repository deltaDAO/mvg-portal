import IConsentsService from '@/server/consents/consents'
import { container } from '@/server/di/container'
import { NextApiRequest, NextApiResponse } from 'next'

const consentsService = container.get<IConsentsService>('Consents')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/consents/[id] HIT')

  const { id } = req.query

  if (!id || Array.isArray(id)) {
    console.error('[API] Missing "id" param in URL')
    return res.status(400).json({ error: 'Missing ID' })
  }

  switch (req.method) {
    case 'DELETE': {
      return consentsService
        .deleteConsent(id, req.headers.authorization)
        .then(() => res.status(200).json({ message: 'Deleted' }))
        .catch((error) => {
          console.error(error)

          // Use backend status if available
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
