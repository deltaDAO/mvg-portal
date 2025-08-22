import { ReactElement } from 'react'
import FormHelp from '@shared/FormInput/Help'
import Price from './Price'
import Fees from './Fees'
import styles from './Fixed.module.css'
import stylesIndex from './index.module.css'
import { useFormikContext } from 'formik'
import { FormPublishData } from '../_types'

export default function Fixed({
  approvedBaseTokens,
  content
}: {
  approvedBaseTokens: TokenInfo[]
  content: any
}): ReactElement {
  const { values } = useFormikContext<FormPublishData>()
  return (
    <>
      <FormHelp>{content.info}</FormHelp>

      <h4 className={stylesIndex.title}>Price</h4>

      <Price approvedBaseTokens={approvedBaseTokens} />
      <Fees tooltips={content.tooltips} assetPrice={values.pricing.price} />
    </>
  )
}
