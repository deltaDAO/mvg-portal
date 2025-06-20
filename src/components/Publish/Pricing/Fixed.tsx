import { ReactElement } from 'react'
import FormHelp from '@shared/FormInput/Help'
import Price from './Price'
import Fees from './Fees'
import styles from './Fixed.module.css'
import InfoBox from '@shared/atoms/InfoBox'

export default function Fixed({
  approvedBaseTokens,
  content
}: {
  approvedBaseTokens: TokenInfo[]
  content: any
}): ReactElement {
  return (
    <div className={styles.container}>
      <InfoBox>{content.info}</InfoBox>

      <div className={styles.priceContainer}>
        <h4 className={styles.title}>Price</h4>
        <Price approvedBaseTokens={approvedBaseTokens} />
      </div>

      <Fees tooltips={content.tooltips} />
    </div>
  )
}
