import Markdown from '@shared/Markdown'
import { useFormikContext } from 'formik'
import { ReactElement, ReactNode, useState, useEffect } from 'react'
import { Tab, Tabs as ReactTabs, TabList, TabPanel } from 'react-tabs'
import { FormPublishData } from 'src/components/Publish/_types'
import { ServiceEditForm } from 'src/components/Asset/Edit/_types'
import Tooltip from '../Tooltip'
import styles from './index.module.css'

import IconUrl from '@images/url.svg'
import IconIpfs from '@images/ipfs.svg'
import IconArweave from '@images/arweave.svg'
import IconGraphql from '@images/graphql.svg'

export interface TabsItem {
  field: any
  title: string
  content: ReactNode
  disabled?: boolean
  props: any
}

export interface TabsProps {
  items: TabsItem[]
  className?: string
}

const iconMap = {
  URL: IconUrl,
  IPFS: IconIpfs,
  ARWEAVE: IconArweave,
  GRAPHQL: IconGraphql
}

export default function TabsFile({
  items,
  className
}: TabsProps): ReactElement {
  const { values, setFieldValue } = useFormikContext<
    FormPublishData | ServiceEditForm
  >()

  const getCurrentFileType = () => {
    if ((values as FormPublishData)?.services) {
      return (values as FormPublishData).services[0]?.files?.[0]?.type
    }
    if ((values as ServiceEditForm)?.files) {
      return (values as ServiceEditForm).files?.[0]?.type
    }
    return undefined
  }

  const initialState = () => {
    const currentType = getCurrentFileType()
    const index = items.findIndex((tab: any) => {
      return tab.field.value === currentType
    })

    return index < 0 ? 0 : index
  }

  const [tabIndex, setTabIndex] = useState(initialState)
  console.log('🚀 ~ TabsFile ~ tabIndex:', tabIndex)
  const currentFileType = getCurrentFileType()

  useEffect(() => {
    const newIndex = items.findIndex((tab: any) => {
      return tab.field.value === currentFileType
    })
    if (newIndex >= 0) {
      setTabIndex((prevIndex) => {
        if (newIndex !== prevIndex) {
          return newIndex
        }
        return prevIndex
      })
    }
  }, [currentFileType, items])

  const setIndex = (tabName: string) => {
    const index = items.findIndex((tab: any) => {
      if (tab.title !== tabName) return false
      return tab
    })
    setTabIndex(index)
    setFieldValue(`${items[index].props.name}[0]`, {
      url: '',
      type: items[index].field.value
    })
  }

  const handleTabChange = (tabName: string) => {
    setIndex(tabName)
  }

  let textToolTip = false
  if ((values as FormPublishData)?.services) {
    textToolTip = (values as FormPublishData).services[0].access === 'compute'
  }

  return (
    <ReactTabs
      className={`${className || ''}`}
      selectedIndex={tabIndex}
      onSelect={(index) => {
        if (index !== undefined && index !== tabIndex) {
          setTabIndex(index)
        }
      }}
    >
      <div className={styles.tabListContainer}>
        <TabList className={styles.tabList}>
          {items.map((item, index) => {
            const IconComponent = iconMap[item.title.toUpperCase()]
            return (
              <Tab
                className={styles.tab}
                key={`tab_${items[tabIndex].props.name}_${index}`}
                onClick={
                  handleTabChange ? () => handleTabChange(item.title) : null
                }
                disabled={item.disabled}
              >
                <div className={styles.tabInner}>
                  {IconComponent && (
                    <IconComponent className={styles.tabIcon} />
                  )}
                  <span>{item.title}</span>
                </div>
              </Tab>
            )
          })}
        </TabList>
      </div>
      <div className={styles.tabContent}>
        {items.map((item, index) => {
          return (
            <TabPanel
              key={`tabpanel_${items[tabIndex].props.name}_${index}`}
              className={styles.tabPanel}
            >
              <label className={styles.tabLabel}>
                {item.field.label}
                {item.field.required && (
                  <span title="Required" className={styles.required}>
                    *
                  </span>
                )}
                {item.field.help && item.field.prominentHelp && (
                  <Tooltip
                    content={
                      <Markdown
                        text={`${item.field.help} ${
                          textToolTip ? item.field.computeHelp : ''
                        }`}
                      />
                    }
                  />
                )}
              </label>
              {item.content}
            </TabPanel>
          )
        })}
      </div>
    </ReactTabs>
  )
}
