'use client'

import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import StepTitle from '@shared/StepTitle'

const PreviewAlgorithmDataset = ({ selectedAlgorithmAsset }: any) => {
  const { values, setFieldValue } = useFormikContext<any>()
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<any>(null)
  console.log('values!!', JSON.stringify(values.datasetServiceParams, null, 2))
  console.log('algo values!!', JSON.stringify(values.algorithms, null, 2))

  useEffect(() => {
    if (values.algorithms) {
      setSelectedAlgorithm(values.algorithms)

      const service = values.algorithms.services?.[0]
      if (
        (service?.userParameters && service.userParameters.length > 0) ||
        (values.datasetServiceParams && values.datasetServiceParams.length > 0)
      ) {
        setFieldValue('isUserParameters', true)
      } else {
        setFieldValue('isUserParameters', false)
      }
    }
  }, [values.algorithms, setFieldValue])

  if (!selectedAlgorithm) {
    return (
      <div className={styles.container}>
        <StepTitle title="Preview Algorithm & Service" />
        <p>Please select an algorithm first</p>
      </div>
    )
  }

  const service = selectedAlgorithm.services[0]

  return (
    <div className={styles.container}>
      <StepTitle title="Preview Algorithm & Service" />

      <div className={styles.previewContainer}>
        <div className={styles.algorithmContainer}>
          <div className={styles.algorithmHeader}>
            <h2 className={styles.algorithmName}>{selectedAlgorithm.name}</h2>
            <p className={styles.algorithmAddress}>{selectedAlgorithm.id}</p>
            <p className={styles.algorithmDescription}>
              {selectedAlgorithm.description.slice(0, 40)}
              {selectedAlgorithm.description.length > 40 ? '...' : ''}
            </p>
          </div>

          <div className={styles.servicesList}>
            <div className={styles.serviceItem}>
              <div className={styles.serviceHeader}>
                <h3 className={styles.serviceName}>{service.name}</h3>
              </div>
              <p className={styles.serviceDescription}>
                {service.serviceDescription.slice(0, 40)}
                {service.serviceDescription.length > 40 ? '...' : ''}
              </p>
              <div className={styles.serviceDetails}>
                <p>
                  <strong>Type:</strong> {service.type}
                </p>
              </div>
              <div className={styles.serviceDetails}>
                <p>
                  <strong>Access duration:</strong>{' '}
                  {Number(service.duration) === 0
                    ? 'Forever'
                    : `${Math.floor(
                        Number(service.duration) / (60 * 60 * 24)
                      )} days`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewAlgorithmDataset
