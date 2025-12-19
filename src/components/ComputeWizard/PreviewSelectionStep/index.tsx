'use client'

import { ReactElement, useEffect, useMemo } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import StepTitle from '@shared/StepTitle'
import { ComputeFlow, FormComputeData } from '../_types'

type AlgoPreview = {
  id: string
  name: string
  description: string
  service: {
    name: string
    description: string
    type: string
    duration: number
  }
}

type DatasetPreview = {
  id: string
  name: string
  description: string
  services: {
    id: string
    name: string
    description: string
    type: string
    duration: number
    userParameters?: unknown[]
  }[]
}

interface PreviewSelectionStepProps {
  flow: ComputeFlow
}

export default function PreviewSelectionStep({
  flow
}: PreviewSelectionStepProps): ReactElement {
  const isDatasetFlow = flow === 'dataset'
  const { values, setFieldValue } = useFormikContext<FormComputeData>()

  const algoPreview: AlgoPreview | null = useMemo(() => {
    if (!isDatasetFlow || !values.algorithms) return null
    const algo = values.algorithms
    const svc = algo.services?.find((s) => s.checked) || algo.services?.[0]
    if (!svc) return null
    return {
      id: algo.id,
      name: algo.name,
      description: algo.description || '',
      service: {
        name: svc.name,
        description: svc.serviceDescription || '',
        type: svc.type,
        duration: Number(svc.duration ?? 0)
      }
    }
  }, [isDatasetFlow, values.algorithms])

  const datasetPreview: DatasetPreview[] = useMemo(() => {
    if (isDatasetFlow || !values.datasets) return []
    return (values.datasets || [])
      .map((d) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const services = d.services ?? []
        const hasExplicitSelection = services.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: any) => s.checked
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const selected = hasExplicitSelection
          ? services.filter((s: any) => s.checked)
          : services.length > 0
          ? [services[0]]
          : []
        if (!selected.length) return null
        return {
          id: d.did || d.id || '',
          name: d.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          description: (d as any).description ?? '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          services: selected.map((s: any) => ({
            id: s.serviceId ?? s.id ?? '',
            name: s.serviceName ?? s.name ?? 'Unnamed Service',
            description:
              s.serviceDescription ?? s.description ?? 'No description',
            type: s.serviceType ?? s.type ?? 'Access',
            duration: Number(s.serviceDuration ?? s.duration ?? 0),
            userParameters: s.userParameters
          }))
        }
      })
      .filter(Boolean) as DatasetPreview[]
  }, [isDatasetFlow, values.datasets])

  useEffect(() => {
    if (isDatasetFlow) {
      const selectedAlgoService = values.algorithms?.services?.find(
        (s) => s.checked
      )
      const hasUserParams =
        !!(
          selectedAlgoService?.userParameters &&
          selectedAlgoService.userParameters.length > 0
        ) ||
        !!(
          values.datasetServiceParams && values.datasetServiceParams.length > 0
        )
      if (values.isUserParameters !== hasUserParams) {
        setFieldValue('isUserParameters', hasUserParams)
      }
      return
    }

    const pairs = datasetPreview.flatMap((d) =>
      d.services.map((s) => `${d.id}|${s.id}`)
    )
    const anyUserParams = datasetPreview.some((d) =>
      d.services.some((s) => s.userParameters && s.userParameters.length > 0)
    )
    const hasAlgoParams =
      Array.isArray(values.algorithmServiceParams) &&
      values.algorithmServiceParams.length > 0
    const shouldSetUserParams = hasAlgoParams || anyUserParams

    if (values.isUserParameters !== shouldSetUserParams) {
      setFieldValue('isUserParameters', shouldSetUserParams)
    }
    if (JSON.stringify(values.dataset) !== JSON.stringify(pairs)) {
      setFieldValue('dataset', pairs)
    }
  }, [
    isDatasetFlow,
    values.algorithms,
    values.datasetServiceParams,
    values.algorithmServiceParams,
    values.isUserParameters,
    values.dataset,
    datasetPreview,
    setFieldValue
  ])

  if (isDatasetFlow) {
    if (!algoPreview) {
      return (
        <div className={styles.container}>
          <StepTitle title="Preview Algorithm & Service" />
          <p>Please select an algorithm first</p>
        </div>
      )
    }

    return (
      <div className={styles.container}>
        <StepTitle title="Preview Algorithm & Service" />
        <div className={styles.previewContainer}>
          <div className={styles.algorithmContainer}>
            <div className={styles.algorithmHeader}>
              <h2 className={styles.algorithmName}>{algoPreview.name}</h2>
              <p className={styles.algorithmAddress}>{algoPreview.id}</p>
              <p className={styles.algorithmDescription}>
                {algoPreview.description.slice(0, 40)}
                {algoPreview.description.length > 40 ? '...' : ''}
              </p>
            </div>

            <div className={styles.servicesList}>
              <div className={styles.serviceItem}>
                <div className={styles.serviceHeader}>
                  <h3 className={styles.serviceName}>
                    {algoPreview.service.name}
                  </h3>
                </div>
                <p className={styles.serviceDescription}>
                  {algoPreview.service.description.slice(0, 40)}
                  {algoPreview.service.description.length > 40 ? '...' : ''}
                </p>
                <div className={styles.serviceDetails}>
                  <p>
                    <strong>Type:</strong> {algoPreview.service.type}
                  </p>
                </div>
                <div className={styles.serviceDetails}>
                  <p>
                    <strong>Access duration:</strong>{' '}
                    {Number(algoPreview.service.duration) === 0
                      ? 'Forever'
                      : `${Math.floor(
                          Number(algoPreview.service.duration) / (60 * 60 * 24)
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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Preview Selected Datasets & Services</h1>
      <div className={styles.previewContainer}>
        {datasetPreview.map((dataset) => (
          <div key={dataset.id} className={styles.datasetContainer}>
            <div className={styles.datasetHeader}>
              <h2 className={styles.datasetName}>{dataset.name}</h2>
              <p className={styles.datasetAddress}>{dataset.id}</p>
              <p className={styles.datasetDescription}>
                {dataset.description.slice(0, 40)}
                {dataset.description.length > 40 ? '...' : ''}
              </p>
            </div>

            <div className={styles.servicesList}>
              {dataset.services.map((service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <div className={styles.serviceHeader}>
                    <h3 className={styles.serviceName}>{service.name}</h3>
                  </div>
                  <p className={styles.serviceDescription}>
                    {service.description.slice(0, 40)}
                    {service.description.length > 40 ? '...' : ''}
                  </p>
                  <div className={styles.serviceDetails}>
                    <p>
                      <strong>Type:</strong> {service.type}
                    </p>
                  </div>
                  <div className={styles.serviceDetails}>
                    <p>
                      <strong>Access duration:</strong>{' '}
                      {Number(service.duration) === 0 ||
                      Number.isNaN(Number(service.duration))
                        ? 'Forever'
                        : `${Math.floor(
                            Number(service.duration) / (60 * 60 * 24)
                          )} days`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {datasetPreview.length === 0 && (
          <p className={styles.noSelection}>No services selected.</p>
        )}
      </div>
    </div>
  )
}
