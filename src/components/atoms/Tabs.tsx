import React, { ReactElement, ReactNode } from 'react'
import { Tab, Tabs as ReactTabs, TabList, TabPanel } from 'react-tabs'
import styles from './Tabs.module.css'

interface TabsItem {
  title: string
  content: ReactNode
}

export default function Tabs({
  items,
  selectedIndex,
  setSelectedIndex,
  defaultIndex,
  className,
  handleTabChange
}: {
  items: TabsItem[]
  selectedIndex?: number
  setSelectedIndex?: (index: number) => void
  defaultIndex?: number
  className?: string
  handleTabChange?: (tabName: string) => void
}): ReactElement {
  return (
    <ReactTabs
      className={`${className && className}`}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex ? (e) => setSelectedIndex(e) : null}
      defaultIndex={defaultIndex}
    >
      <TabList className={styles.tabList}>
        {items.map((item) => (
          <Tab
            className={styles.tab}
            key={item.title}
            onClick={handleTabChange ? () => handleTabChange(item.title) : null}
          >
            {item.title}
          </Tab>
        ))}
      </TabList>
      <div className={styles.tabContent}>
        {items.map((item) => (
          <TabPanel key={item.title}>{item.content}</TabPanel>
        ))}
      </div>
    </ReactTabs>
  )
}
