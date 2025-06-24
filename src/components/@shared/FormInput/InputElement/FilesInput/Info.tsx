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

  return (
    <>
      <div className={styles.fileDetails}>
        <div className={styles.defaultContainer}>
          <CircleCheckIcon />
          <div className={styles.confirmed}>File confirmed</div>
        </div>
        {file.contentLength && <span>{prettySize(+file.contentLength)}</span>}
        {file.contentLength && contentTypeCleaned && <span> • </span>}
        {contentTypeCleaned && <span>{contentTypeCleaned}</span>}
      </div>
    </>
  )
}
