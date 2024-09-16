import { ReactElement } from 'react'
import styles from './ServiceCard.module.css'
import { Service } from '@oceanprotocol/lib'

export default function ServiceCard({
  service,
  price,
  onClick
}: {
  service: Service
  price: string
  onClick: () => void
}): ReactElement {
  return (
    <div onClick={onClick} className={styles.service}>
      <span className={styles.title}>Name: </span>
      {service.name || 'Unknown'}
      <br />
      <span className={styles.title}>Description: </span>
      <span>{service.description}</span>
      <br />
      <span className={styles.title}>Type: </span>
      {service.type}
      <br />
      <span className={styles.title}>Price: </span>
      {price}
    </div>
  )
}
