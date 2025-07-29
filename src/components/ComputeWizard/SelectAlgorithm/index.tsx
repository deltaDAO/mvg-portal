import { ReactElement } from 'react'
import { useFormikContext, Field } from 'formik'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import Input from '@shared/FormInput'
import Button from '@shared/atoms/Button'
import { FormComputeData } from '../_types'
import styles from './index.module.css'

interface SelectAlgorithmProps {
  algorithms: AssetSelectionAsset[]
}

export default function SelectAlgorithm({
  algorithms
}: SelectAlgorithmProps): ReactElement {
  const { address: accountId } = useAccount()
  const { values } = useFormikContext<FormComputeData>()

  return (
    <div className={styles.container}>
      <h2>Select Algorithm</h2>

      <div className={styles.algorithmSelection}>
        <Field
          component={Input}
          name="algorithm"
          type="assetSelection"
          options={algorithms}
          accountId={accountId}
          selected={values.algorithm}
          disabled={false}
          priceOnRight={true}
        />
      </div>
    </div>
  )
}
