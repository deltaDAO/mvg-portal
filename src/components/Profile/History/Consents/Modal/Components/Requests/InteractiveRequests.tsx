import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import { Field } from 'formik'
import { ReactNode } from 'react'
import styles from './InteractiveRequests.module.css'
import { useCompleteRequests } from './requests.hooks'

interface InteractiveRequestsProps {
  dataset: Asset
  algorithm: Asset
  fieldName?: string
  requests?: PossibleRequests
  children?: ReactNode
}

export const InteractiveRequests = ({
  dataset,
  algorithm,
  requests,
  fieldName = 'permitted',
  children
}: Readonly<InteractiveRequestsProps>) => {
  const getCompleteRequest = useCompleteRequests({ dataset, algorithm })
  const defaultRequests: PossibleRequests = {
    trusted_algorithm_publisher: false,
    trusted_algorithm: false,
    allow_network_access: false
  }
  const values = Object.entries(requests ?? defaultRequests)

  return (
    <div
      role="group"
      aria-labelledby="requests-group"
      className={styles.requestList}
    >
      {children}
      {values.map(([permission]) => (
        <label
          key={permission}
          className={`${styles.interactive} ${styles.requestItem}`}
        >
          <Field
            type="checkbox"
            name={`${fieldName}.${permission}`}
            className={styles.margined}
          />
          {getCompleteRequest(permission as keyof PossibleRequests)}
        </label>
      ))}
    </div>
  )
}
