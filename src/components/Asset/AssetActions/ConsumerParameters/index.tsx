import { ReactElement, useCallback, useEffect, useState } from 'react'
import FormConsumerParameters from './FormConsumerParameters'
import styles from './index.module.css'
import Tabs, { TabsItem } from '@shared/atoms/Tabs'
import {
  ConsumerParameter,
  Service,
  UserCustomParameters
} from '@oceanprotocol/lib'

export function parseConsumerParameterValues(
  formValues?: UserCustomParameters,
  parameters?: ConsumerParameter[]
): UserCustomParameters {
  if (!formValues) return

  const parsedValues = {}
  Object.entries(formValues)?.forEach((userCustomParameter) => {
    const [userCustomParameterKey, userCustomParameterValue] =
      userCustomParameter

    const { type } = parameters.find(
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
    if (selectedAlgorithmAsset?.services[0]?.consumerParameters?.length > 0) {
      tabs.push({
        title: 'Algo Service',
        content: (
          <FormConsumerParameters
            name="algoServiceParams"
            parameters={selectedAlgorithmAsset.services[0].consumerParameters}
            disabled={isLoading}
          />
        )
      })
    }
    if (
      selectedAlgorithmAsset?.metadata?.algorithm?.consumerParameters?.length
    ) {
      tabs.push({
        title: 'Algo Params',
        content: (
          <FormConsumerParameters
            name="algoParams"
            parameters={
              selectedAlgorithmAsset.metadata?.algorithm.consumerParameters
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
