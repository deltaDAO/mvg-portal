import { ReactElement } from 'react'
import Button from '../atoms/Button'
import Input from '../FormInput'
import styles from './index.module.css'

interface WalletFileUploadProps {
  onFileChange: (target: EventTarget) => void
  onBack: () => void
}

export default function WalletFileUpload({
  onFileChange,
  onBack
}: WalletFileUploadProps): ReactElement {
  return (
    <>
      <Input
        name="walletJSONFile"
        type="file"
        label="Select file to import"
        onChange={(e) => onFileChange(e.target)}
        className={styles.input}
      />
      <Button
        style="text"
        size="small"
        onClick={onBack}
        className={styles.cancel}
      >
        Back
      </Button>
    </>
  )
}
