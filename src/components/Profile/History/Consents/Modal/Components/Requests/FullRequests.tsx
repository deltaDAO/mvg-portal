import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import { ReactNode } from 'react'
import styles from './FullRequests.module.css'
import { useCompleteRequests } from './requests.hooks'

interface FullRequestsProps {
  dataset: Asset
  algorithm: Asset
  requests: PossibleRequests
  children?: ReactNode
}

export const FullRequests = ({
  dataset,
  algorithm,
  requests,
  children
}: Readonly<FullRequestsProps>) => {
  const getCompleteRequest = useCompleteRequests({ dataset, algorithm })
  const values = Object.entries(requests)
  return (
    <div className={styles.requestContainer}>
      {children ? <p className={styles.title}>{children}</p> : <></>}
      <ul className={styles.requestList}>
        {values.map(([key]) => (
          <li key={key} className={styles.requestItem}>
            {getCompleteRequest(key as keyof PossibleRequests)}
          </li>
        ))}
      </ul>
    </div>
  )
}
