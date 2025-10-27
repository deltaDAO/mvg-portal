import { ReactElement } from 'react'
import { useFormikContext, Field } from 'formik'
import { useAccount } from 'wagmi'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import Input from '@shared/FormInput'
import StepTitle from '@shared/StepTitle'
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
    <>
      <StepTitle title="Select Algorithm" />

      <div className={styles.algorithmSelection}>
        <Field
          component={Input}
          name="algorithm"
          type="assetSelection"
          options={algorithms}
          accountId={accountId}
          selected={values.algorithm || []}
          disabled={false}
          priceOnRight={true}
          variant="compute"
        />
      </div>
    </>
  )
}
