import { ReactElement, useCallback, useEffect, useState } from 'react'
import FormConsumerParameters from './FormConsumerParameters'
import styles from './index.module.css'
import Tabs, { TabsItem } from '@shared/atoms/Tabs'
import { UserCustomParameters } from '@oceanprotocol/lib'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Option } from 'src/@types/ddo/Option'

export function parseConsumerParameterValues(
  formValues?: UserCustomParameters,
  consumerParameters?: Record<string, string | number | boolean | Option[]>[]
): UserCustomParameters {
  if (!formValues || !consumerParameters) return

  const parsedValues = {}
  Object.entries(formValues)?.forEach((userCustomParameter) => {
    const [userCustomParameterKey, userCustomParameterValue] =
      userCustomParameter
    const { type } = consumerParameters.find(
      (param) => param.name === userCustomParameterKey
    )

    Object.assign(parsedValues, {
      [userCustomParameterKey]:
        type === 'select' && userCustomParameterValue === ''
          ? undefined
          : type === 'boolean'
          ? userCustomParameterValue === 'true'
          : userCustomParameterValue
    })
  })

  return parsedValues
}

export default function ConsumerParameters({
  services,
  selectedAlgorithmAsset,
  isLoading,
  svcIndex
}: {
  services: Service[]
  selectedAlgorithmAsset?: AssetExtended
  isLoading?: boolean
  svcIndex?: number
}): ReactElement {
  const [tabs, setTabs] = useState<TabsItem[]>([])
  const [tabIndex, setTabIndex] = useState(0)

  const updateTabs = useCallback(() => {
    const tabs: TabsItem[] = []

    // Dataset Services Tabs
    services?.forEach((service, index) => {
      if (service.consumerParameters?.length > 0) {
        tabs.push({
          title: `Dataset ${index + 1} Params`,
          content: (
            <FormConsumerParameters
              name={`datasetParams_${index}`}
              parameters={service.consumerParameters}
              disabled={isLoading}
            />
          )
        })
      }
    })

    // Algo Service Tab
    const algoSvc =
      selectedAlgorithmAsset?.credentialSubject?.services?.[svcIndex || 0]

    if (algoSvc?.consumerParameters?.length > 0) {
      tabs.push({
        title: 'Algo Service',
        content: (
          <FormConsumerParameters
            name="algoServiceParams"
            parameters={algoSvc.consumerParameters}
            disabled={isLoading}
          />
        )
      })
    }

    // Algo Params Tab (from metadata.algorithm.consumerParameters)
    const algoParams =
      selectedAlgorithmAsset?.credentialSubject?.metadata?.algorithm
        ?.consumerParameters

    if (algoParams?.length > 0) {
      tabs.push({
        title: 'Algo Params',
        content: (
          <FormConsumerParameters
            name="algoParams"
            parameters={algoParams}
            disabled={isLoading}
          />
        )
      })
    }

    return tabs
  }, [services, selectedAlgorithmAsset, svcIndex, isLoading])

  useEffect(() => {
    setTabs(updateTabs())
  }, [updateTabs])

  return (
    tabs.length > 0 && (
      <div className={styles.container}>
        <Tabs
          className={styles.consumerParametersTabs}
          items={tabs}
          selectedIndex={tabIndex}
          onIndexSelected={setTabIndex}
        />
      </div>
    )
  )
}
