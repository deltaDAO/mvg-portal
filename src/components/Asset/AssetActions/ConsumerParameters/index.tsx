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
  service,
  selectedAlgorithmAsset,
  isLoading
}: {
  service: Service
  selectedAlgorithmAsset?: AssetExtended
  isLoading?: boolean
}): ReactElement {
  const [tabs, setTabs] = useState<TabsItem[]>([])
  const [tabIndex, setTabIndex] = useState(0)
  const updateTabs = useCallback(() => {
    const tabs = []
    if (service.consumerParameters?.length > 0) {
      tabs.push({
        title: 'Data Service',
        content: (
          <FormConsumerParameters
            name="dataServiceParams"
            parameters={service.consumerParameters}
            disabled={isLoading}
          />
        )
      })
    }
    // TODO -
    if (
      selectedAlgorithmAsset?.credentialSubject?.services[0]?.consumerParameters
        ?.length > 0
    ) {
      tabs.push({
        title: 'Algo Service',
        content: (
          <FormConsumerParameters
            name="algoServiceParams"
            parameters={
              selectedAlgorithmAsset.credentialSubject?.services[0]
                .consumerParameters
            }
            disabled={isLoading}
          />
        )
      })
    }
    if (
      selectedAlgorithmAsset?.credentialSubject?.metadata?.algorithm
        ?.consumerParameters?.length
    ) {
      tabs.push({
        title: 'Algo Params',
        content: (
          <FormConsumerParameters
            name="algoParams"
            parameters={
              selectedAlgorithmAsset.credentialSubject?.metadata?.algorithm
                .consumerParameters
            }
            disabled={isLoading}
          />
        )
      })
    }

    return tabs
  }, [selectedAlgorithmAsset, service, isLoading])

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
