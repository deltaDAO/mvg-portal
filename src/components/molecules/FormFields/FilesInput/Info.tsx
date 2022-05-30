import React, { ReactElement, useEffect } from 'react'
import { File as FileMetadata } from '@oceanprotocol/lib/dist/node/ddo/interfaces/File'
import { prettySize } from '../../../../utils'
import cleanupContentType from '../../../../utils/cleanupContentType'
import styles from './Info.module.css'
import { useField, useFormikContext } from 'formik'

interface ExtendedFileMetadata extends FileMetadata {
  isSelfDescriptionVerified?: boolean
}

export default function FileInfo({
  name,
  file
}: {
  name: string
  file: ExtendedFileMetadata
}): ReactElement {
  const { validateField } = useFormikContext()
  const [field, meta, helpers] = useField(name)

  // On mount, validate the field manually
  useEffect(() => {
    validateField(name)
  }, [name, validateField])

  return (
    <div className={styles.info}>
      <h3 className={styles.url}>{file.url}</h3>
      <ul>
        <li>URL confirmed</li>
        {file?.contentLength && <li>{prettySize(+file.contentLength)}</li>}
        {file?.contentType && <li>{cleanupContentType(file.contentType)}</li>}
        {file?.isSelfDescriptionVerified && <li>Valid self-description</li>}
      </ul>
      <button
        className={styles.removeButton}
        onClick={() => helpers.setValue(undefined)}
      >
        &times;
      </button>
    </div>
  )
}
