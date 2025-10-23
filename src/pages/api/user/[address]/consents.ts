import IConsentsService from '@/server/consents/consents'
import { container } from '@/server/di/container'
import { ConsentDirection } from '@utils/consents/types'
import { NextApiRequest, NextApiResponse } from 'next'

const consentsService = container.get<IConsentsService>('Consents')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/user/[address]/consents HIT')

  const { address } = req.query

  if (!address || Array.isArray(address)) {
    console.error('[API] Missing "address" param in URL')
    return res.status(400).json({ error: 'Missing address' })
  }

  switch (req.method) {
    case 'GET': {
      const { direction } = req.query
      return await consentsService
        .getAddressConsents(address, direction as ConsentDirection)
        .then((result) => res.status(200).json(result))
        .catch((error) => {
          console.error(error)

          const status = error.response?.status || 500
          const data = error.response?.data || {
            message: 'Error getting user consents'
          }

          return res.status(status).json(data)
        })
    }
    case 'POST': {
      const { datasetDid, algorithmDid, request, reason } = req.body

      return await consentsService
        .createConsent(
          datasetDid,
          algorithmDid,
          request,
          reason,
          req.headers.authorization
        )
        .then((result) => res.status(201).json(result))
        .catch((error) => {
          console.error(error)

          const status = error.response?.status || 500
          const data = error.response?.data || {
            message: 'Error creating consent'
          }

          return res.status(status).json(data)
        })
    }
    default:
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
