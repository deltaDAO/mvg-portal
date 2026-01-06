'use client'

import { ReactElement, useEffect, useMemo, useState } from 'react'
import { useFormikContext } from 'formik'
import Tooltip from '@shared/atoms/Tooltip'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import styles from './index.module.css'
import { ComputeFlow, UserParameter, DatasetItemUserParams } from '../_types'

interface UserParametersStepProps {
  flow: ComputeFlow
  asset?: AssetExtended
  service?: Service
}

interface DatasetServiceParams {
  did?: string
  serviceId: string
  userParameters: UserParameter[]
}

interface DatasetAlgorithmService {
  id: string
  name: string
  userParameters: UserParameter[]
  checked?: boolean
}

interface DatasetAlgorithmEntry {
  id: string
  name: string
  services: DatasetAlgorithmService[]
}

type DatasetFlowFormValues = {
  algorithms?: DatasetAlgorithmEntry
  isUserParameters?: boolean
  userUpdatedParameters?: DatasetServiceParams[]
  datasetServiceParams?: DatasetServiceParams[]
  datasets?: DatasetItemUserParams[]
  updatedGroupedUserParameters?: {
    algoParams: DatasetServiceParams[]
    datasetParams: DatasetServiceParams[]
  }
}

type AlgorithmFlowFormValues = {
  datasets?: DatasetItemUserParams[]
  dataset?: string[]
  isUserParameters?: boolean
  userUpdatedParameters?: DatasetServiceParams[]
  algorithmServiceParams?: DatasetServiceParams[]
  updatedGroupedUserParameters?: {
    algoParams: DatasetServiceParams[]
    datasetParams: DatasetServiceParams[]
  }
}

type NormalizedEntry = {
  did?: string
  serviceId: string
  userParameters: UserParameter[]
}

type DatasetWithServices = {
  id?: string
  did?: string
  name?: string
  services?: Array<{
    id?: string
    serviceId?: string
    name?: string
    serviceName?: string
    checked?: boolean
    userParameters?: UserParameter[]
  }>
}

type NormalizedContext = {
  entries: NormalizedEntry[]
  algoParams: NormalizedEntry[]
  datasetParams: NormalizedEntry[]
  hasUserParams: boolean
}

export default function UserParametersStep({
  flow,
  asset,
  service
}: UserParametersStepProps): ReactElement {
  const isDatasetFlow = flow === 'dataset'
  const { values, setFieldValue } = useFormikContext<
    DatasetFlowFormValues & AlgorithmFlowFormValues
  >()
  const [localParams, setLocalParams] = useState<NormalizedEntry[]>([])

  const context: NormalizedContext = useMemo(() => {
    if (isDatasetFlow) {
      const algo = values.algorithms
      if (!algo) {
        return {
          entries: [],
          algoParams: [],
          datasetParams: [],
          hasUserParams: false
        }
      }

      const algoService =
        algo.services?.find((s) => s.checked) || algo.services?.[0]
      if (!algoService) {
        return {
          entries: [],
          algoParams: [],
          datasetParams: [],
          hasUserParams: false
        }
      }

      const existingParams = values.userUpdatedParameters ?? []
      const existingAlgo = existingParams.find(
        (p) => p.serviceId === algoService.id && !p.did
      )
      const algoParams = existingAlgo ?? {
        serviceId: algoService.id,
        userParameters: (algoService.userParameters ?? []).map((p) => ({
          ...p,
          value: p.value ?? p.default ?? ''
        }))
      }

      const datasetParams =
        values.datasetServiceParams?.map((entry) => {
          const existing = existingParams.find(
            (p) => p.did === entry.did && p.serviceId === entry.serviceId
          )
          if (existing) return existing

          return {
            ...entry,
            userParameters: entry.userParameters.map((p) => ({
              ...p,
              value: p.value ?? p.default ?? ''
            }))
          }
        }) ?? []

      const entries = [algoParams, ...datasetParams]
      const hasUserParams = Boolean(
        algoService.userParameters?.length || datasetParams.length
      )

      return {
        entries,
        algoParams: [algoParams],
        datasetParams,
        hasUserParams
      }
    }

    const datasets = (values.datasets as DatasetWithServices[]) || []
    const algoServiceParams = values.algorithmServiceParams || []

    const datasetsWithParams = datasets
      .map((d) => ({
        ...d,
        services: (d.services ?? []).filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: any) => s.checked && s.userParameters?.length > 0
        )
      }))
      .filter((d) => d.services.length > 0)

    const anyUserParameters = datasetsWithParams.some((d) =>
      d.services.some((s) => s.userParameters && s.userParameters.length > 0)
    )
    const hasAlgoParams = algoServiceParams.length > 0

    const existingParams = values.userUpdatedParameters ?? []

    const datasetParams = datasetsWithParams.flatMap((dataset) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dataset.services.map((srv: any) => {
        const existing = existingParams.find(
          (p) => p.did === dataset.did && p.serviceId === srv.serviceId
        )
        if (existing) return existing
        return {
          did: dataset.did,
          serviceId: srv.serviceId,
          userParameters: srv.userParameters.map((p) => ({
            ...p,
            value: p.default ?? ''
          }))
        }
      })
    )

    const algoParams =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      algoServiceParams.map((entry: any) => {
        const existing = existingParams.find(
          (p) => p.did === entry.did && p.serviceId === entry.serviceId
        )
        if (existing) return existing
        return {
          did: entry.did,
          serviceId: entry.serviceId,
          userParameters: entry.userParameters.map((p) => ({
            ...p,
            value: p.value ?? p.default ?? ''
          }))
        }
      }) ?? []

    const entries = [...algoParams, ...datasetParams]
    const hasUserParams = anyUserParameters || hasAlgoParams

    return {
      entries,
      algoParams,
      datasetParams,
      hasUserParams
    }
  }, [
    isDatasetFlow,
    values.algorithms,
    values.datasetServiceParams,
    values.datasets,
    values.userUpdatedParameters,
    values.algorithmServiceParams
  ])

  useEffect(() => {
    const deepEqual = (a: unknown, b: unknown) =>
      JSON.stringify(a) === JSON.stringify(b)

    if (!deepEqual(localParams, context.entries)) {
      setLocalParams(context.entries)
    }

    if (!deepEqual(values.userUpdatedParameters, context.entries)) {
      setFieldValue('userUpdatedParameters', context.entries)
    }

    const grouped = {
      algoParams: context.algoParams,
      datasetParams: context.datasetParams
    }
    if (!deepEqual(values.updatedGroupedUserParameters, grouped)) {
      setFieldValue('updatedGroupedUserParameters', grouped)
    }

    if (values.isUserParameters !== context.hasUserParams) {
      setFieldValue('isUserParameters', context.hasUserParams)
    }
  }, [
    context.entries,
    context.algoParams,
    context.datasetParams,
    context.hasUserParams,
    localParams,
    setFieldValue,
    values.userUpdatedParameters,
    values.updatedGroupedUserParameters,
    values.isUserParameters
  ])

  const handleParamChange = (
    did: string | undefined,
    serviceId: string,
    index: number,
    value: string
  ) => {
    setLocalParams((prev) => {
      const updated = prev.map((entry) => {
        if (entry.serviceId === serviceId && entry.did === did) {
          const userParameters = [...entry.userParameters]
          userParameters[index] = { ...userParameters[index], value }
          return { ...entry, userParameters }
        }
        return entry
      })
      setFieldValue('userUpdatedParameters', updated)
      const algoParams = updated.filter((p) => !p.did)
      const datasetParams = updated.filter((p) => p.did)
      setFieldValue('updatedGroupedUserParameters', {
        algoParams,
        datasetParams
      })
      return updated
    })
  }

  const renderInputField = (
    param: UserParameter,
    onChange: (v: string) => void
  ) => {
    switch (param.type) {
      case 'number':
        return (
          <input
            type="number"
            className={styles.paramInput}
            value={
              param.value === undefined || param.value === null
                ? ''
                : String(param.value)
            }
            onChange={(e) => onChange(e.target.value)}
          />
        )
      case 'boolean':
        return (
          <select
            className={styles.paramInput}
            value={param.value === true ? 'true' : 'false'}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        )
      case 'select':
        return (
          <select
            className={styles.paramInput}
            value={
              param.value === undefined || param.value === null
                ? ''
                : String(param.value)
            }
            onChange={(e) => onChange(e.target.value)}
          >
            {param.options?.map((opt) => {
              const key = Object.keys(opt)[0]
              return (
                <option key={key} value={key}>
                  {opt[key]}
                </option>
              )
            })}
          </select>
        )
      default:
        return (
          <input
            type="text"
            className={styles.paramInput}
            value={
              param.value === undefined || param.value === null
                ? ''
                : String(param.value)
            }
            onChange={(e) => onChange(e.target.value)}
          />
        )
    }
  }

  const entriesToRender = localParams
  if (
    isDatasetFlow &&
    (!values.algorithms || !values.algorithms.services?.[0])
  ) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>User Parameters</h1>
        <p className={styles.noParamsText}>Please select an algorithm first</p>
      </div>
    )
  }

  if (!isDatasetFlow && entriesToRender.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>User Parameters</h1>
        <p className={styles.noParamsText}>
          No user parameters found for selected datasets.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Parameters</h1>
      {isDatasetFlow ? (
        entriesToRender.map((entry) => {
          const isMainDataset = entry.did === asset?.id
          const dataset =
            entry.did && values.datasets
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (values.datasets as any[]).find(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (d: any) => d.id === entry.did || d.did === entry.did
                )
              : null

          const datasetName = isMainDataset
            ? asset?.credentialSubject?.metadata?.name
            : dataset?.name

          const serviceName = isMainDataset
            ? service?.name
            : dataset?.services?.find(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (s: any) =>
                  s.id === entry.serviceId || s.serviceId === entry.serviceId
              )?.name

          return (
            <div
              key={entry.serviceId + (entry.did ?? '')}
              className={styles.card}
            >
              <h2 className={styles.cardHeader}>
                {entry.did ? (
                  <>
                    <span className={styles.datasetName}>{datasetName}</span>
                    <span className={styles.separator}> | </span>
                    <span className={styles.serviceName}>
                      {serviceName ?? 'Service'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className={styles.datasetName}>
                      {values.algorithms?.name || 'Algorithm'}
                    </span>
                    <span className={styles.separator}> | </span>
                    <span className={styles.serviceName}>
                      {values.algorithms?.services?.[0]?.name ?? 'Service'}
                    </span>
                  </>
                )}
              </h2>

              {entry.userParameters.map((param, i) => (
                <div key={i} className={styles.paramRow}>
                  <label className={styles.paramLabel}>
                    {param.label}
                    {param.required && (
                      <span className={styles.requiredMark}>*</span>
                    )}
                    {param.description && (
                      <Tooltip content={param.description} />
                    )}
                  </label>
                  {renderInputField(param, (v) =>
                    handleParamChange(entry.did, entry.serviceId, i, v)
                  )}
                </div>
              ))}
            </div>
          )
        })
      ) : (
        <>
          {values.algorithmServiceParams?.length > 0 &&
            entriesToRender
              .filter((p) =>
                values.algorithmServiceParams?.some(
                  (a) => a.did === p.did && a.serviceId === p.serviceId
                )
              )
              .map((entry) => (
                <div key={entry.did + entry.serviceId} className={styles.card}>
                  <h2 className={styles.cardHeader}>
                    <span className={styles.datasetName}>
                      {asset?.credentialSubject?.metadata?.name ?? 'Algorithm'}
                    </span>
                    <span className={styles.separator}> | </span>
                    <span className={styles.serviceName}>
                      {service?.name ?? 'Service'}
                    </span>
                  </h2>
                  {entry.userParameters.map(
                    (param: UserParameter, i: number) => (
                      <div key={i} className={styles.paramRow}>
                        <label className={styles.paramLabel}>
                          {param.label}
                          {param.required && (
                            <span className={styles.requiredMark}>*</span>
                          )}
                          {param.description && (
                            <Tooltip content={param.description} />
                          )}
                        </label>
                        {renderInputField(param, (v) =>
                          handleParamChange(entry.did, entry.serviceId, i, v)
                        )}
                      </div>
                    )
                  )}
                </div>
              ))}

          {values.datasets &&
            (values.datasets as DatasetWithServices[]).map((dataset) => {
              const selectedServices =
                (dataset.services ?? []).filter(
                  (s) => s.checked && s.userParameters?.length > 0
                ) || []

              if (!selectedServices.length) return null

              return (
                <div key={dataset.did || dataset.id} className={styles.card}>
                  <h2 className={styles.cardHeader}>
                    <span className={styles.datasetName}>{dataset.name}</span>
                    <span className={styles.separator}> | </span>
                    <span className={styles.serviceName}>
                      {selectedServices[0].serviceName ??
                        selectedServices[0].name ??
                        'Service'}
                    </span>
                  </h2>

                  {selectedServices.map((srv) => {
                    const matched = localParams.find(
                      (u) =>
                        u.did === (dataset.did || dataset.id) &&
                        u.serviceId === (srv.serviceId ?? srv.id)
                    )
                    const params =
                      matched?.userParameters ??
                      (srv.userParameters || []).map((p) => ({
                        ...p,
                        value: p.default ?? ''
                      }))

                    return params.map((param: UserParameter, i: number) => (
                      <div
                        key={`${srv.serviceId ?? srv.id}-${i}`}
                        className={styles.paramRow}
                      >
                        <label className={styles.paramLabel}>
                          {param.label}
                          {param.required && (
                            <span className={styles.requiredMark}>*</span>
                          )}
                          {param.description && (
                            <Tooltip content={param.description} />
                          )}
                        </label>
                        {renderInputField(param, (v) =>
                          handleParamChange(
                            dataset.did || dataset.id,
                            srv.serviceId ?? srv.id,
                            i,
                            v
                          )
                        )}
                      </div>
                    ))
                  })}
                </div>
              )
            })}
        </>
      )}
    </div>
  )
}
