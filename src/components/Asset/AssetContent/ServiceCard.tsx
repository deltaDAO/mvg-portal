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
      <span className={styles.title}>Name: </span>
      {service.name || 'Unknown'}
      <br />
      <span className={styles.title}>Description: </span>
      <span>{service.description?.['@value']}</span>
      <br />
      <span className={styles.title}>Type: </span>
      {service.type}
      <br />
      <span className={styles.title}>Price: </span>
      {accessDetails.type === 'fixed' ? (
        `${accessDetails.price} ${(
          <span className={styles.tokenSymbol}>
            {accessDetails.baseToken.symbol}
          </span>
        )}`
      ) : (
        <span className={styles.free}>free</span>
      )}
      <br />
      <span className={styles.title}>Access Duration: </span>
      {service.timeout === 0
        ? 'Forever'
        : service.timeout >= 86400
        ? `${service.timeout / 86400} day(s)`
        : `${service.timeout / 3600} hour(s)`}
    </div>
  )
}
