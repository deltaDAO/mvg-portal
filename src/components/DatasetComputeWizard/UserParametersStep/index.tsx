'use client'

import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import Tooltip from '@shared/atoms/Tooltip'

interface UserParameter {
  name?: string
  label?: string
  description?: string
  type?: string
  default?: string
  required?: boolean
}

interface AlgorithmService {
  id: string
  name: string
  userParameters: UserParameter[]
}

interface Algorithm {
  id: string
  name: string
  services: AlgorithmService[]
}

interface FormValues {
  algorithms?: Algorithm
  userUpdatedParameters?: any[]
}

const PARAMETER_FIELDS = [
  {
    key: 'name',
    help: 'The parameter identifier/name used internally'
  },
  { key: 'label', help: 'The display label shown to users' },
  {
    key: 'description',
    help: 'Help text explaining what this parameter does'
  },
  {
    key: 'type',
    help: 'The data type: text, number, boolean, or select'
  },
  {
    key: 'default',
    help: 'The default value for this parameter'
  }
] as const

const PreviewAlgorithmParameters = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [localParams, setLocalParams] = useState<any[]>([])

  useEffect(() => {
    if (!values.algorithms) return

    const service = values.algorithms.services?.[0]
    if (!service) return

    // Initialize local parameters
    if (values.userUpdatedParameters?.length) {
      setLocalParams(values.userUpdatedParameters)
    } else {
      const initial = [
        {
          algorithmId: values.algorithms.id,
          serviceId: service.id,
          userParameters: service.userParameters.map((p) => ({ ...p }))
        }
      ]
      setLocalParams(initial)
      setFieldValue('userUpdatedParameters', initial)
    }

    // Set flag if there are parameters
    setFieldValue(
      'isUserParameters',
      !!service.userParameters && service.userParameters.length > 0
    )
  }, [values.algorithms, setFieldValue, values.userUpdatedParameters])

  const handleParamChange = (
    paramIndex: number,
    field: keyof UserParameter,
    value: string | boolean
  ) => {
    setLocalParams((prev) => {
      const updated = prev.map((item) => {
        const newParams = [...item.userParameters]
        newParams[paramIndex] = { ...newParams[paramIndex], [field]: value }
        return { ...item, userParameters: newParams }
      })
      setFieldValue('userUpdatedParameters', updated)
      return updated
    })
  }

  if (!values.algorithms) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>User Parameters</h1>
        <p className={styles.noParamsText}>Please select an algorithm first</p>
      </div>
    )
  }

  const service = values.algorithms.services?.[0]
  const updatedService = localParams[0] ?? {
    userParameters: service.userParameters
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Parameters</h1>

      <div className={styles.card}>
        <h2 className={styles.cardHeader}>
          <span className={styles.datasetName}>{values.algorithms.name}</span>
          <span className={styles.separator}> | </span>
          <span className={styles.serviceName}>{service.name}</span>
        </h2>

        {updatedService.userParameters.map(
          (param: UserParameter, index: number) => (
            <div key={index} className={styles.paramGroup}>
              <h3 className={styles.paramTitle}>Parameter {index + 1}</h3>
              <div className={styles.paramFields}>
                {PARAMETER_FIELDS.map(({ key, help }) => (
                  <div key={key} className={styles.paramFieldContainer}>
                    <label className={styles.paramLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      <Tooltip content={help} />
                    </label>
                    <input
                      className={styles.paramInput}
                      type="text"
                      value={(param as any)[key] ?? ''}
                      onChange={(e) =>
                        handleParamChange(
                          index,
                          key as keyof UserParameter,
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}

                <div className={styles.paramFieldContainer}>
                  <label className={styles.paramLabel}>Required</label>
                  <input
                    type="checkbox"
                    className={styles.paramInput}
                    checked={param.required ?? false}
                    onChange={(e) =>
                      handleParamChange(index, 'required', e.target.checked)
                    }
                  />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default PreviewAlgorithmParameters
