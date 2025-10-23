import Eye from '@images/eye.svg'
import Info from '@images/info.svg'
import { useAssetTextField } from './AssetTextField.hook'
import styles from './AssetTextField.module.css'

export const AssetTextField = () => {
  const { selected, inputValue, error, written, handleInputChange } =
    useAssetTextField()
  return (
    <>
      <input
        className={styles.reasonTextbox}
        name="algorithm-did"
        placeholder="did:op:..."
        disabled={!!selected}
        onChange={handleInputChange}
        value={inputValue}
        maxLength={100}
      />
      {error && (
        <span className={`${styles.feedback} ${styles.errorMessage}`}>
          <Eye />
          {error}
        </span>
      )}
      {written && !error && (
        <span className={`${styles.feedback} ${styles.successMessage}`}>
          <Info />
          <code>{written.nft.name}</code>
        </span>
      )}
    </>
  )
}

export default AssetTextField
