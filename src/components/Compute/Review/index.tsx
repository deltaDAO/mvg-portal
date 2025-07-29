import { ReactElement } from 'react'
import { useFormikContext } from 'formik'
import { FormComputeData } from '../_types'
import styles from './index.module.css'

export default function Review(): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormComputeData>()

  return (
    <div className={styles.container}>
      <h2>Review</h2>
      <p>Review your compute job configuration</p>

      <div className={styles.reviewSection}>
        <h3>Your Compute Job</h3>

        <div className={styles.reviewItem}>
          <label>
            <input
              type="checkbox"
              checked={values.makeAvailable}
              onChange={(e) => setFieldValue('makeAvailable', e.target.checked)}
            />
            Make available compute in project
          </label>
        </div>

        <div className={styles.reviewDetails}>
          <div className={styles.detailItem}>
            <strong>Dataset:</strong> Test Asset
          </div>
          <div className={styles.detailItem}>
            <strong>Algorithm:</strong> {values.algorithm || 'Not selected'}
          </div>
          <div className={styles.detailItem}>
            <strong>C2D Environment:</strong>{' '}
            {values.environment || 'Not selected'}
          </div>
          <div className={styles.detailItem}>
            <strong>C2D Environment Configuration:</strong>
            <ul>
              <li>CPU: {values.cpu} cores</li>
              <li>GPU: {values.gpu}</li>
              <li>RAM: {values.ram} GB</li>
              <li>Disk: {values.disk} GB</li>
            </ul>
          </div>
        </div>

        <div className={styles.descriptionItem}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={(e) => setFieldValue('description', e.target.value)}
            placeholder="Describe your compute job"
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
