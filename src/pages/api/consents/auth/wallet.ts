import IAuthenticationService from '@/server/auth/authentication'
import { container } from '@/server/di/container'
import { NextApiRequest, NextApiResponse } from 'next'

const authenticationService =
  container.get<IAuthenticationService>('Authentication')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/consents/auth/wallet HIT')

  switch (req.method) {
    case 'GET': {
      const { address, chainId } = req.query

      if (!address || Array.isArray(address)) {
        console.error('[API] Missing "address" param in URL')
        return res.status(400).json({ error: 'Missing address' })
      }

      if (!chainId || Array.isArray(chainId)) {
        console.error('[API] Missing "chainId" param in URL')
        return res.status(400).json({ error: 'Missing chainId' })
      }

      return await authenticationService
        .nonce(address, chainId, req.headers.referer)
        .then((nonce) => res.status(200).json(nonce))
        .catch((error) => {
          console.error(error)

          // Use backend status if available
          const status = error.response?.status || 500
          const data = error.response?.data || {
            message: 'Error getting nonce'
          }

          return res.status(status).json(data)
        })
    }
    case 'POST': {
      const { address, signature } = req.body

      if (!address || Array.isArray(address)) {
        console.error('[API] Missing "address" param in BODY')
        return res.status(400).json({ error: 'Missing address' })
      }

      if (!signature || Array.isArray(signature)) {
        console.error('[API] Missing "signature" param in BODY')
        return res.status(400).json({ error: 'Missing signature' })
      }

      return await authenticationService
        .validate(address, signature)
        .then(({ data }) => {
          res.status(200).json(data)
        })
        .catch((error) => {
          console.error(error)

          // Use backend status if available
          const status = error.response?.status || 500
          const data = error.response?.data || {
            message: 'Error verifying signature'
          }

          return res.status(status).json(data)
        })
    }
    default:
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
