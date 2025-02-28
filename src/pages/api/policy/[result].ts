import { LoggerInstance } from '@oceanprotocol/lib'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { result } = req.query
      console.log('Result is ', result)
      res.status(200).json({ message: result })
    } catch (error) {
      LoggerInstance.error(error.data)
      res.status(500).json(error.data)
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}
