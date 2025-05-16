import Button from '@shared/atoms/Button'
import { InputProps } from '@shared/FormInput'
import { generateNftMetadata } from '@utils/nft'
import { useField } from 'formik'
import { ReactElement, useEffect, useState } from 'react'
import Refresh from '@images/refresh.svg'
import styles from './index.module.css'

export default function Nft(props: InputProps): ReactElement {
  const [field, meta, helpers] = useField(props.name)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshNftMetadata = () => {
    // Start fade out
    setIsRefreshing(true)

    // Wait for fade out, then change the image
    setTimeout(() => {
      const nftMetadata = generateNftMetadata()
      helpers.setValue({ ...nftMetadata })

      // Wait a moment before starting fade in
      setTimeout(() => {
        setIsRefreshing(false)
      }, 100)
    }, 300)
  }

  // Generate on first mount
  useEffect(() => {
    if (field.value?.name !== '') return

    refreshNftMetadata()
  }, [field.value?.name])

  return (
    <div className={styles.nft}>
      <figure className={styles.image}>
        <img
          src={field?.value?.image || field?.value?.image_data}
          width="128"
          height="128"
          alt={field?.value?.name || 'NFT'}
          className={isRefreshing ? styles.refreshing : ''}
        />
        <div className={styles.actions}>
          <Button
            style="text"
            size="small"
            className={styles.refresh}
            title="Rotate logo image"
            onClick={(e) => {
              e.preventDefault()
              refreshNftMetadata()
            }}
            disabled={isRefreshing}
          >
            <Refresh />
          </Button>
        </div>
      </figure>

      <div className={styles.token}>
        <strong>{field?.value?.name}</strong> —{' '}
        <strong>{field?.value?.symbol}</strong>
        <br />
        {field?.value?.description}
      </div>
    </div>
  )
}
