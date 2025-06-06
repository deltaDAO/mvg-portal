import { ReactElement } from 'react'
import styles from './ServiceCard.module.css'
import { Service } from 'src/@types/ddo/Service'

export default function ServiceCard({
  service,
  accessDetails,
  onClick
}: {
  service: Service
  accessDetails: AccessDetails
  onClick: () => void
}): ReactElement {
  if (!accessDetails) return null

  return (
    <div onClick={onClick} className={styles.service}>
      <span className={styles.serviceTitle}>{service.name || 'Unknown'} </span>
      <br />
      <div>
        {service.description?.['@value'] ? (
          <span className={styles.serviceDescription}>
            {service.description?.['@value']}
          </span>
        ) : (
          <span className={styles.serviceDescriptionPlaceholder}>
            No description available.
          </span>
        )}
      </div>
      <span className={styles.title}>Type: </span>
      <span className={styles.access}>{service.type}</span>
      <br />
      <span className={styles.title}>Price: </span>
      {accessDetails.type === 'fixed' ? (
        <>
          {accessDetails.price}{' '}
          <span className={styles.tokenSymbol}>
            {accessDetails.baseToken.symbol}
          </span>
        </>
      ) : (
        <span className={styles.free}>free</span>
      )}
      <br />
      <div className={styles.selectButtonWrapper}>
        <button className={styles.selectButton}>Select</button>
      </div>{' '}
    </div>
  )
}
