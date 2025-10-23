import { ReactElement, ReactNode } from 'react'
import { Tab, Tabs as ReactTabs, TabList, TabPanel } from 'react-tabs'
import InputRadio from '@shared/FormInput/InputElement/Radio'
import styles from './index.module.css'
export interface TabsItem {
  title: string
  content: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  items: TabsItem[]
  className?: string
  handleTabChange?: (tabName: string) => void
  showRadio?: boolean
  selectedIndex?: number
  onIndexSelected?: (index: number) => void
  variant?: 'default' | 'publish'
  isEditPage?: boolean
}

export default function Tabs({
  items,
  className,
  handleTabChange,
  showRadio,
  selectedIndex,
  onIndexSelected,
  variant = 'default',
  isEditPage = false
}: TabsProps): ReactElement {
  return (
    <ReactTabs
      className={`${className || ''}`}
      selectedIndex={selectedIndex}
      onSelect={onIndexSelected}
    >
      <div
        className={variant === 'publish' ? styles.publishTabListWrapper : ''}
      >
        <div
          className={`${styles.tabListContainer} ${
            variant === 'publish' ? styles.publishTabListContainer : ''
          }`}
        >
          <TabList
            className={`${styles.tabList} ${
              variant === 'publish' ? styles.publishTabList : ''
            }`}
          >
            {items.map((item, index) => (
              <Tab
                className={`${styles.tab} ${
                  variant === 'publish' ? styles.publishTab : ''
                }`}
                key={index}
                onClick={
                  handleTabChange ? () => handleTabChange(item.title) : null
                }
                disabled={item.disabled}
              >
                {showRadio ? (
                  <InputRadio
                    className={styles.radioInput}
                    name={item.title}
                    type="radio"
                    checked={index === selectedIndex}
                    options={[item.title]}
                    readOnly
                    variant={variant}
                  />
                ) : (
                  item.title
                )}
              </Tab>
            ))}
          </TabList>
        </div>
      </div>
      <div
        className={`${styles.tabContent} ${
          variant === 'publish' ? styles.publishTabContent : ''
        }`}
      >
        {items.map((item, index) => (
          <TabPanel
            key={index}
            className={`${
              variant === 'publish' ? styles.publishTabPanel : ''
            } ${isEditPage ? styles.editTabPanel : ''}`}
          >
            {item.content}
          </TabPanel>
        ))}
      </div>
    </ReactTabs>
  )
}
