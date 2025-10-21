import type { NextApiRequest, NextApiResponse } from 'next'
import ICredentialsService from 'src/server/credentials/credentials'
import { container } from 'src/server/di/container'
import { Address } from 'wagmi'

const credentialsService = container.get<ICredentialsService>('Credentials')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('[API] /api/credentials/[address] HIT')

    const { address } = req.query

    if (!address || typeof address !== 'string') {
      console.error('[API] Missing "address" param in URL')
      return res.status(400).json({ error: 'Missing address' })
    }

    const creds = await credentialsService.getAddressCredentials(
      address as Address
    )
    console.log('[API] Got credentials:', creds)

    return res.status(200).json(creds)
  } catch (err) {
    console.error('[API] /api/credentials ERROR:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
