import { ReactElement } from 'react'
import { prettySize } from './utils'
import cleanupContentType from '@utils/cleanupContentType'
import styles from './Info.module.css'
import { FileInfo as FileInfoData } from '@oceanprotocol/lib'
import CircleCheckIcon from '@images/circle_check.svg'

export default function FileInfo({
  file,
  handleClose
}: {
  file: FileInfoData
  handleClose(): void
}): ReactElement {
  const contentTypeCleaned = file.contentType
    ? cleanupContentType(file.contentType)
    : null

  const hideUrl = file.type === 'hidden' || false

  // Show file information if there's a valid file (even if encrypted)
  const hasValidFile = file.valid === true
  const isEncrypted =
    (file as any).isEncrypted || file.url?.includes('[Encrypted file')
  const shouldShowConfirmed = hasValidFile && !isEncrypted

  // Don't render anything if there's no valid file
  if (!hasValidFile) {
    return null
  }

  return (
    <>
      <div className={styles.fileDetails}>
        {shouldShowConfirmed && (
          <div className={styles.defaultContainer}>
            <CircleCheckIcon />
            <div className={styles.confirmed}>File confirmed</div>
          </div>
        )}
        {isEncrypted && (
          <div className={styles.defaultContainer}>
            <div className={styles.confirmed}>
              Encrypted file (URL not editable)
            </div>
          </div>
        )}
        {file.contentLength && <span>{prettySize(+file.contentLength)}</span>}
        {file.contentLength && contentTypeCleaned && <span> • </span>}
        {contentTypeCleaned && <span>{contentTypeCleaned}</span>}
      </div>
    </>
  )
}
