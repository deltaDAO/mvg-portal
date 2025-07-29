import { ReactElement } from 'react'
import { useFormikContext } from 'formik'
import { FormComputeData } from '../_types'
import styles from './index.module.css'

export default function SelectEnvironment(): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormComputeData>()

  return (
    <div className={styles.container}>
      <h2>Select C2D Environment</h2>
      <p>Choose a Compute-to-Data environment for your job</p>

      <div className={styles.environmentList}>
        <div className={styles.environmentItem}>
          <input
            type="radio"
            id="env1"
            name="environment"
            value="env1"
            checked={values.environment === 'env1'}
            onChange={(e) => setFieldValue('environment', e.target.value)}
          />
          <label htmlFor="env1">Test Environment 1</label>
        </div>

        <div className={styles.environmentItem}>
          <input
            type="radio"
            id="env2"
            name="environment"
            value="env2"
            checked={values.environment === 'env2'}
            onChange={(e) => setFieldValue('environment', e.target.value)}
          />
          <label htmlFor="env2">Test Environment 2</label>
        </div>

        <div className={styles.environmentItem}>
          <input
            type="radio"
            id="env3"
            name="environment"
            value="env3"
            checked={values.environment === 'env3'}
            onChange={(e) => setFieldValue('environment', e.target.value)}
          />
          <label htmlFor="env3">Test Environment 3</label>
        </div>
      </div>
    </div>
  )
}
