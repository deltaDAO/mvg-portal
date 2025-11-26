import { downloadRemoteSourceFromIpfs, IpfsRemoteDocument } from '@utils/ipfs'
import appConfig from 'app.config.cjs'
import { RemoteSource } from '../../../@types/ddo/RemoteSource'
import { ReactElement, useEffect, useState } from 'react'

interface IpfsRemoteSourceProps {
  noDocumentLabel?: string
  remoteSource?: RemoteSource
  className?: string
  name?: string
}

export function IpfsRemoteSource({
  noDocumentLabel,
  remoteSource,
  className = '',
  name
}: IpfsRemoteSourceProps): ReactElement {
  const [document, setDocument] = useState<IpfsRemoteDocument>()

  useEffect(() => {
    async function downloadIpfsDocument() {
      try {
        const remoteDocument: IpfsRemoteDocument =
          await downloadRemoteSourceFromIpfs(
            remoteSource.ipfsCid,
            appConfig.ipfsGateway
          )
        setDocument(remoteDocument)
      } catch (error) {
        console.error(error)
      }
    }

    if (remoteSource?.ipfsCid) {
      downloadIpfsDocument()
    }
  }, [remoteSource?.ipfsCid])

  return document ? (
    <a
      href={document.content}
      download={document.filename}
      className={className}
    >
      {name || document.filename}
    </a>
  ) : noDocumentLabel ? (
    <span className={className}>{noDocumentLabel}</span>
  ) : (
    <span className={className}>No document</span>
  )
}
