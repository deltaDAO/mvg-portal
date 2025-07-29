import { ReactElement } from 'react'
import { useFormikContext, Field } from 'formik'
import Input from '@shared/FormInput'
import { FormComputeData } from '../_types'
import styles from './index.module.css'

export default function Review(): ReactElement {
  const { values } = useFormikContext<FormComputeData>()

  return (
    <div className={styles.container}>
      <h2>Review and Purchase</h2>
      <p>Review your compute job configuration</p>

      <div className={styles.reviewSection}>
        <h3>Selected Algorithm</h3>
        <p>{values.algorithm?.name || 'None selected'}</p>

        <h3>Selected Environment</h3>
        <p>{values.computeEnv?.id || 'None selected'}</p>

        <h3>Resources</h3>
        <p>
          CPU: {values.cpu}, RAM: {values.ram}GB, Disk: {values.disk}GB
        </p>
        <p>Job Duration: {values.jobDuration} seconds</p>
      </div>

      <div className={styles.termsSection}>
        <Field
          component={Input}
          name="termsAndConditions"
          type="checkbox"
          options={['Terms and Conditions']}
          prefixes={['I agree to the']}
          actions={['/terms']}
          disabled={false}
          hideLabel={true}
        />

        <Field
          component={Input}
          name="acceptPublishingLicense"
          type="checkbox"
          options={['Publishing License']}
          prefixes={['I agree the']}
          disabled={false}
          hideLabel={true}
        />
      </div>
    </div>
  )
}
