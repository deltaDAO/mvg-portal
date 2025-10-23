import IConsentsService from '@/server/consents/consents'
import { container } from '@/server/di/container'
import type { NextApiRequest, NextApiResponse } from 'next'

const consentsService = container.get<IConsentsService>('Consents')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/user/[address]/consents-amount HIT')

  const { address } = req.query
  if (!address || typeof address !== 'string') {
    console.error('[API] Missing "address" param in URL')
    return res.status(400).json({ error: 'Missing address' })
  }

  switch (req.method) {
    case 'GET': {
      return consentsService
        .getAddressConsentsAmount(address)
        .then((results) => res.status(200).json(results))
        .catch((error) => {
          console.error(error)
          res.status(500).json(error)
        })
    }
    default:
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
