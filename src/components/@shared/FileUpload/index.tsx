import { ReactElement, useState } from 'react'
import { FileItem } from '@utils/fileItem'
import styles from './index.module.css'
import crypto from 'crypto'
import Button from '@shared/atoms/Button'

export interface FileUploadProps {
  fileName?: string
  buttonLabel: string
  setFileItem: (fileItem: FileItem, onError: () => void) => void
  buttonStyle?: 'default' | 'publish'
}

export function FileUpload({
  buttonLabel,
  setFileItem,
  fileName,
  buttonStyle = 'default'
}: FileUploadProps): ReactElement {
  const [uploadFileName, setUploadFileName] = useState('')

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault()

    for (const file of event.target.files) {
      setUploadFileName(file.name)

      const reader = new FileReader()

      reader.onloadend = () => {
        const hash = crypto.createHash('sha256')

        let content: string = ''
        if (typeof reader.result === 'string') {
          content = reader.result
        } else {
          const uint8Array = new Uint8Array(reader.result)
          const decoder = new TextDecoder('utf-8')
          content = decoder.decode(uint8Array)
        }
        hash.update(content)

        const newFileItem: FileItem = {
          checksum: hash.digest('hex'),
          content,
          size: content.length,
          name: file.name
        }

        setFileItem(newFileItem, () => setUploadFileName(''))
      }

      reader.onerror = () => {
        console.error(
          `[FileDrop] There was an issue reading the file ${file.name}`
        )
      }

      reader.readAsDataURL(file)
    }
  }

  function fileNameLabel(): string {
    if (uploadFileName) {
      return uploadFileName
    } else if (fileName) {
      return fileName
    } else {
      return ''
    }
  }

  function handleButtonClick() {
    document.getElementById('file-upload')?.click()
  }

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <Button
        style={buttonStyle === 'default' ? 'primary' : buttonStyle}
        onClick={handleButtonClick}
        className={`${styles.marginRight2}`}
      >
        {buttonLabel}
      </Button>
      {fileNameLabel() && (
        <div className={styles.fileName}>{fileNameLabel()}</div>
      )}
    </div>
  )
}
