import { LoggerInstance } from '@oceanprotocol/lib'
import { serverSideDeleteIpfsFile, serverSideUploadToIpfs } from '@utils/ipfs'
import appConfig from 'app.config.cjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const data = await serverSideUploadToIpfs(
        JSON.parse(req.body),
        appConfig.ipfsApiKey,
        appConfig.ipfsSecretApiKey
      )
      res.status(200).json({ success: true, data })
    } catch (error) {
      LoggerInstance.error(error.message)
      res.status(500).json({
        success: false,
        error: 'Could not upload the file to the IPFS provider'
      })
    }
  } else if (req.method === 'DELETE') {
    try {
      await serverSideDeleteIpfsFile(
        req.body,
        appConfig.ipfsApiKey,
        appConfig.ipfsSecretApiKey
      )
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
