import { Field, useField, useFormikContext } from 'formik'
import { ReactElement } from 'react'
import Input from '@shared/FormInput'
import Error from '@shared/FormInput/Error'
import styles from './Price.module.css'
import { FormPublishData } from '../_types'
import { getFieldContent } from '@utils/form'
import CoinSelect from './CoinSelect'

export default function Price({
  approvedBaseTokens,
  content
}: {
  approvedBaseTokens?: TokenInfo[]
  content?: any
}): ReactElement {
  const [field, meta] = useField('pricing.price')

  const { values } = useFormikContext<FormPublishData>()

  return (
    <div className={styles.price}>
      {values.pricing.type === 'free' ? (
        <div className={styles.free}>
          <Field
            {...getFieldContent('freeAgreement', content.fields)}
            component={Input}
            name="pricing.freeAgreement"
          />
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            <div className={styles.form}>
              <Input
                type="number"
                min="1"
                placeholder="0"
                prefix={
                  approvedBaseTokens?.length > 1 ? (
                    <CoinSelect approvedBaseTokens={approvedBaseTokens} />
                  ) : approvedBaseTokens?.length === 1 ? (
                    approvedBaseTokens[0]?.symbol
                  ) : (
                    values.pricing?.baseToken?.symbol || undefined
                  )
                }
                variant="publish"
                {...field}
              />
              <Error meta={meta} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
