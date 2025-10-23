import IConsentsHealthService from '@/server/consents/health'
import { container } from '@/server/di/container'
import type { NextApiRequest, NextApiResponse } from 'next'

const healthService = container.get<IConsentsHealthService>('ConsentHealth')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/health/[service] HIT')

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { service } = req.query
  if (!service || Array.isArray(service)) {
    console.error('[API] Missing "service" param in URL')
    return res.status(400).json({ error: 'Missing Service' })
  }

  switch (service) {
    case 'consents':
      return healthService
        .getHealth()
        .then(() => res.status(200).json({ message: 'Healthy' }))
        .catch(() => res.status(500).json({ message: 'Not healthy' }))
    default:
      return res.status(404).json({ error: `Unknown service "${service}"` })
  }
}
