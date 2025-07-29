import { ReactElement } from 'react'
import { useFormikContext } from 'formik'
import { FormComputeData } from '../_types'
import styles from './index.module.css'

export default function ConfigureEnvironment(): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormComputeData>()

  return (
    <div className={styles.container}>
      <h2>C2D Environment Configuration</h2>
      <p>Configure the compute environment resources</p>

      <div className={styles.configGrid}>
        <div className={styles.configItem}>
          <label htmlFor="cpu">CPU (cores)</label>
          <input
            type="number"
            id="cpu"
            name="cpu"
            value={values.cpu}
            onChange={(e) => setFieldValue('cpu', parseInt(e.target.value))}
            min="1"
            max="32"
          />
        </div>

        <div className={styles.configItem}>
          <label htmlFor="gpu">GPU (units)</label>
          <input
            type="number"
            id="gpu"
            name="gpu"
            value={values.gpu}
            onChange={(e) => setFieldValue('gpu', parseInt(e.target.value))}
            min="0"
            max="8"
          />
        </div>

        <div className={styles.configItem}>
          <label htmlFor="ram">RAM (GB)</label>
          <input
            type="number"
            id="ram"
            name="ram"
            value={values.ram}
            onChange={(e) => setFieldValue('ram', parseInt(e.target.value))}
            min="1"
            max="128"
          />
        </div>

        <div className={styles.configItem}>
          <label htmlFor="disk">Disk (GB)</label>
          <input
            type="number"
            id="disk"
            name="disk"
            value={values.disk}
            onChange={(e) => setFieldValue('disk', parseInt(e.target.value))}
            min="1"
            max="1000"
          />
        </div>
      </div>

      <div className={styles.textareaItem}>
        <label htmlFor="environmentData">C2D Environment Data</label>
        <textarea
          id="environmentData"
          name="environmentData"
          value={values.environmentData}
          onChange={(e) => setFieldValue('environmentData', e.target.value)}
          placeholder="Additional configuration data"
          rows={4}
        />
      </div>
    </div>
  )
}
