import { ReactElement } from 'react'
import FormHelp from '@shared/FormInput/Help'
import Price from './Price'
import Fees from './Fees'
import styles from './Fixed.module.css'
import Alert from '@shared/atoms/Alert'

export default function Fixed({
  approvedBaseTokens,
  content
}: {
  approvedBaseTokens: TokenInfo[]
  content: any
}): ReactElement {
  return (
    <div className={styles.container}>
      <Alert>{content.info}</Alert>

      <div className={styles.priceContainer}>
        <h4 className={styles.title}>Price</h4>
        <Price approvedBaseTokens={approvedBaseTokens} />
      </div>

      <Fees tooltips={content.tooltips} />
    </div>
  )
}
