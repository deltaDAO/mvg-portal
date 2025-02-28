import { DragEvent, ReactElement, useState } from 'react'
import styles from './index.module.css'
import Button from '@shared/atoms/Button'
import { FileItem } from '@utils/fileItem'
import { sha256 } from 'ohash'

export interface FileDropProps {
  dropAreaLabel: string
  onApply: (
    fileItems: FileItem[],
    success: (message: string, msgDelay: number) => void,
    error: (message: string, msgDelay: number) => void
  ) => void
  singleFile?: boolean
  buttonLabel?: string
  errorMessage?: string
}

export function FileDrop({
  singleFile,
  onApply,
  dropAreaLabel,
  buttonLabel,
  errorMessage
}: FileDropProps): ReactElement {
  const [dragIsOver, setDragIsOver] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])
  const [message, setMessage] = useState<string>('')

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragIsOver(true)
    setMessage('')
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragIsOver(false)
    setMessage('')
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragIsOver(false)

    // Fetch the files
    const droppedFiles = Array.from(event.dataTransfer.files)

    droppedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onloadend = () => {
        let content: string = ''
        if (typeof reader.result === 'string') {
          content = reader.result
        } else {
          const uint8Array = new Uint8Array(reader.result)
          const decoder = new TextDecoder('utf-8')
          content = decoder.decode(uint8Array)
        }

        const newFileItem: FileItem = {
          checksum: sha256(content),
          content,
          size: content.length,
          name: file.name
        }

        if (singleFile) {
          setFiles(() => [newFileItem])
        } else {
          setFiles((prevList) => [...prevList, ...[newFileItem]])
        }
      }

      reader.onerror = () => {
        console.error(
          `[FileDrop] There was an issue reading the file ${file.name}`
        )
      }

      reader.readAsDataURL(file)
      return reader
    })

    setMessage('')
  }

  function handleApply() {
    function success(message: string, msgDelay: number) {
      setMessage(message)

      setTimeout(function () {
        setMessage('')
      }, msgDelay)

      setFiles([])
    }

    function error(message: string, msgDelay: number) {
      setMessage(message)

      setTimeout(function () {
        setMessage('')
      }, msgDelay)

      setFiles([])
    }

    onApply(files, success, error)
  }

  function handleRemove(itemToRemove: FileItem) {
    const newList = files.filter((item) => {
      return item !== itemToRemove
    })
    setFiles(newList)
    setMessage('')
  }

  return (
    <div className={styles.dropareaform}>
      <div className={styles.dropline}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`${styles.filedrop} ${
            dragIsOver ? styles.dragover : styles.dragged
          }`}
        >
          {message.length > 0 ? message : dropAreaLabel}
        </div>
        <Button
          type="button"
          style="primary"
          className={styles.applybutton}
          onClick={handleApply}
          disabled={files.length === 0}
        >
          {buttonLabel || 'Apply'}
        </Button>
      </div>
      <div>
        {files.map((item: FileItem) => (
          <div className={styles.dropitem} key={item.name}>
            <Button style="primary" onClick={() => handleRemove(item)}>
              Remove
            </Button>
            <a
              className={styles.dropitemtext}
              href={item.content}
              download={item.name}
            >
              {item.name}
            </a>
          </div>
        ))}
      </div>
      {errorMessage?.length > 0 ? (
        <div className={styles.error}>{errorMessage}</div>
      ) : (
        <></>
      )}
    </div>
  )
}
