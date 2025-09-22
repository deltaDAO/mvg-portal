import * as isIPFS from 'is-ipfs'
import pinataSDK from '@pinata/sdk'
import { FileItem } from '@utils/fileItem'
import { RemoteSource } from '../@types/ddo/RemoteSource'
import axios from 'axios'

export interface IpfsRemoteDocument {
  content: string
  filename: string
}

export function isCID(value: string) {
  return isIPFS.cid(value)
}

export async function serverSideUploadToIpfs(
  data: any,
  ipfsApiKey: string,
  ipfsSecretApiKey: string
): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[serverSideUploadToIpfs] serverSideUploadToIpfs is not allowed to run on client side'
    )
  }

  if (!(ipfsApiKey && ipfsSecretApiKey)) {
    throw new Error(
      '[serverSideUploadToIpfs] Set NEXT_PUBLIC_IPFS_API_KEY and NEXT_PUBLIC_IPFS_SECRET_API_KEY'
    )
  }

  try {
    // eslint-disable-next-line new-cap
    const pinata = new pinataSDK(ipfsApiKey, ipfsSecretApiKey)
    const result = await pinata.pinJSONToIPFS(data)
    return result.IpfsHash
  } catch (error) {
    throw new Error(`[serverSideUploadToIpfs] ${error.message}`)
  }
}

export async function uploadToIPFS(data: any): Promise<string> {
  try {
    const res = await fetch('/api/ipfs', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    const result = await res.json()
    if (!result.success) {
      throw new Error(result.message)
    }
    return result.data
  } catch (error) {
    throw new Error(`[uploadToIPFS] ${error.message}`)
  }
}

export async function serverSideDeleteIpfsFile(
  ipfsHash: string,
  ipfsApiKey: string,
  ipfsSecretApiKey: string
) {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[serverSideDeleteIpfsFile] serverSideDeleteIpfsFile is not allowed to run on client side'
    )
  }

  if (!(ipfsApiKey && ipfsSecretApiKey)) {
    throw new Error(
      '[serverSideDeleteIpfsFile] Set NEXT_PUBLIC_IPFS_API_KEY and NEXT_PUBLIC_IPFS_SECRET_API_KEY'
    )
  }

  try {
    // eslint-disable-next-line new-cap
    const pinata = new pinataSDK(ipfsApiKey, ipfsSecretApiKey)
    await pinata.unpin(ipfsHash)
  } catch (error) {
    throw new Error(`[serverSideDeleteIpfsFile] ${error.message}`)
  }
}

export async function deleteIpfsFile(ipfsHash: string) {
  try {
    const res = await fetch('/api/ipfs', {
      method: 'DELETE',
      body: ipfsHash
    })

    const result = await res.json()
    if (!result.success) {
      throw new Error(result.message)
    }
  } catch (error) {
    throw new Error(`[deleteIpfsFile] ${error.message}`)
  }
}

export async function uploadFileItemToIPFS(
  fileItem: FileItem
): Promise<RemoteSource> {
  const remoteDocument: IpfsRemoteDocument = {
    content: fileItem.content,
    filename: fileItem.name
  }

  const ipfsHash = await uploadToIPFS(remoteDocument)
  return {
    type: 'ipfs',
    ipfsCid: ipfsHash,
    headers: {}
  }
}

export async function downloadRemoteSourceFromIpfs(
  ipfsHash: string,
  ipfsGateway: string
): Promise<IpfsRemoteDocument | null> {
  if (!ipfsGateway) {
    throw new Error('[downloadRemoteSourceFromIpfs] Set IPFS_GATEWAY')
  }

  try {
    const response = await axios.get(`${ipfsGateway}/ipfs/${ipfsHash}`)
    return response.data
  } catch (error) {
    throw new Error(`[downloadRemoteSourceFromIpfs] ${error.message}`)
  }
}
