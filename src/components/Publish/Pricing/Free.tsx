import { ReactElement, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { FormPublishData } from '../_types'
import Price from './Price'
import styles from './index.module.css'
import Alert from '../../@shared/atoms/Alert'

export default function Free({ content }: { content: any }): ReactElement {
  // connect with Form state, use for conditional field rendering
  const { values, setFieldValue } = useFormikContext<FormPublishData>()

  useEffect(() => {
    // if the user has agreed, then set pricing to continue
    if (values.pricing.freeAgreement) {
      setFieldValue('pricing.price', 1)
      setFieldValue('pricing.amountDataToken', 1000)
    } else {
      // disabled continue button if the user hasn't agree to the "free agreement"
      setFieldValue('pricing.price', 0)
      setFieldValue('pricing.amountDataToken', 0)
    }
  }, [setFieldValue, values])

  return (
    <>
      <Alert>{content.info}</Alert>
      <h4 className={styles.title}>Price</h4>
      <Price content={content} />
    </>
  )
}
