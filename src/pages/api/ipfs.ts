import { LoggerInstance } from '@oceanprotocol/lib'
import { serverSideDeleteIpfsFile, serverSideUploadToIpfs } from '@utils/ipfs'
import appConfig from 'app.config.cjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headerValue = req.headers['x-ipfs-jwt']
  const headerToken = Array.isArray(headerValue) ? headerValue[0] : headerValue
  const ipfsJWT = headerToken || appConfig.ipfsJWT

  if (req.method === 'POST') {
    try {
      const data = await serverSideUploadToIpfs(JSON.parse(req.body), ipfsJWT)
      res.status(200).json({ success: true, data })
    } catch (error) {
      LoggerInstance.error(error.message)
      res.status(500).json({
        success: false,
        error: error.message || 'Could not upload the file to the IPFS provider'
      })
    }
  } else if (req.method === 'DELETE') {
    try {
      await serverSideDeleteIpfsFile(req.body, ipfsJWT)
      res.status(200).json({ success: true })
    } catch (error) {
      LoggerInstance.error(error.message)
      res.status(500).json({
        success: false,
        error: 'Could not delete the file on the IPFS provider'
      })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}
