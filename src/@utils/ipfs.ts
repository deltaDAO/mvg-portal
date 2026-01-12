import * as isIPFS from 'is-ipfs'
import { FileItem } from '@utils/fileItem'
import { RemoteSource } from '../@types/ddo/RemoteSource'
import axios from 'axios'
import { getRuntimeConfig } from './runtimeConfig'

export interface IpfsRemoteDocument {
  content: string
  filename: string
}

export function isCID(value: string) {
  return isIPFS.cid(value)
}

export async function serverSideUploadToIpfs(
  data: any,
  ipfsJWT: string
): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[serverSideUploadToIpfs] serverSideUploadToIpfs is not allowed to run on client side'
    )
  }

  if (!ipfsJWT) {
    throw new Error('[serverSideUploadToIpfs] Set NEXT_PUBLIC_IPFS_JWT')
  }

  try {
    const pinataContent = {
      pinataContent: data
    }
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      pinataContent,
      {
        headers: {
          'Content-Type': 'application/json',
          // 🔑 Use the API Key and Secret Key in the headers for authentication
          Authorization: `Bearer ${ipfsJWT}`
        }
      }
    )

    return response.data.IpfsHash
  } catch (error) {
    throw new Error(`[serverSideUploadToIpfs] ${error.message}`)
  }
}

export async function uploadToIPFS(data: any): Promise<string> {
  try {
    const runtimeConfig = getRuntimeConfig()
    const ipfsJWT = runtimeConfig.NEXT_PUBLIC_IPFS_JWT
    const res = await fetch('/api/ipfs', {
      method: 'POST',
      headers: ipfsJWT ? { 'x-ipfs-jwt': ipfsJWT } : undefined,
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
  ipfsJWT: string
) {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[serverSideDeleteIpfsFile] serverSideDeleteIpfsFile is not allowed to run on client side'
    )
  }

  if (!ipfsJWT) {
    throw new Error('[serverSideDeleteIpfsFile] Set NEXT_PUBLIC_IPFS_JWT')
  }

  try {
    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
      headers: {
        // 🔑 Use the JWT as the Bearer Token for authorization
        Authorization: `Bearer ${ipfsJWT}`
      }
    })
  } catch (error) {
    throw new Error(`[serverSideDeleteIpfsFile] ${error.message}`)
  }
}

export async function deleteIpfsFile(ipfsHash: string) {
  try {
    const runtimeConfig = getRuntimeConfig()
    const ipfsJWT = runtimeConfig.NEXT_PUBLIC_IPFS_JWT
    const res = await fetch('/api/ipfs', {
      method: 'DELETE',
      headers: ipfsJWT ? { 'x-ipfs-jwt': ipfsJWT } : undefined,
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
