import React, { ReactElement } from 'react'
import { addExistingParamsToUrl } from './utils'
import styles from './sort.module.css'
import {
  SortDirectionOptions,
  SortTermOptions
} from '../../@types/aquarius/SearchQuery'
import { useRouter } from 'next/router'
import Accordion from '@components/@shared/Accordion'
import Input from '@components/@shared/FormInput'

const sortItems = [
  { display: 'Relevance', value: SortTermOptions.Relevance },
  { display: 'Published', value: SortTermOptions.Created },
  { display: 'Sales', value: SortTermOptions.Orders },
  { display: 'Price', value: SortTermOptions.Price }
]

const sortDirections = [
  { display: '\u2191 Asc', value: SortDirectionOptions.Ascending },
  { display: '\u2193 Desc', value: SortDirectionOptions.Descending }
]

export default function Sort({
  sortType,
  setSortType,
  sortDirection,
  setSortDirection,
  expanded
}: {
  sortType: string
  setSortType: React.Dispatch<React.SetStateAction<string>>
  sortDirection: string
  setSortDirection: React.Dispatch<React.SetStateAction<string>>
  expanded?: boolean
}): ReactElement {
  const router = useRouter()

  async function sortResults(sortBy?: string, direction?: string) {
    let urlLocation: string
    if (sortBy) {
      urlLocation = await addExistingParamsToUrl(location, ['sort'])
      urlLocation = `${urlLocation}&sort=${sortBy}`
      setSortType(sortBy)
    } else if (direction) {
      urlLocation = await addExistingParamsToUrl(location, ['sortOrder'])
      urlLocation = `${urlLocation}&sortOrder=${direction}`
      setSortDirection(direction)
    }
    router.push(urlLocation)
  }

  return (
    <>
      <div className={styles.sidePositioning}>
        <Accordion title="Sort" defaultExpanded={expanded}>
          <div className={styles.sortList}>
            <div className={styles.sortType}>
              <h5 className={styles.sortTypeLabel}>Type</h5>
              {sortItems.map((item) => (
                <Input
                  key={item.value}
                  name="sortType"
                  type="radio"
                  options={[item.display]}
                  value={item.value}
                  checked={sortType === item.value}
                  onChange={() => sortResults(item.value, null)}
                />
              ))}
            </div>
            <div className={styles.sortDirection}>
              <h5 className={styles.sortDirectionLabel}>Direction</h5>
              {sortDirections.map((item) => (
                <Input
                  key={item.value}
                  name="sortDirection"
                  type="radio"
                  options={[item.display]}
                  value={item.value}
                  checked={sortDirection === item.value}
                  onChange={() => sortResults(null, item.value)}
                />
              ))}
            </div>
          </div>
        </Accordion>
      </div>
      <div className={styles.topPositioning}>
        <div className={styles.compactFilterContainer}>
          <Accordion title="Sort Type" compact>
            <div className={styles.compactOptionsContainer}>
              {sortItems.map((item) => (
                <Input
                  key={item.value}
                  name="sortType"
                  type="radio"
                  options={[item.display]}
                  value={item.value}
                  checked={sortType === item.value}
                  onChange={() => sortResults(item.value, null)}
                />
              ))}
            </div>
          </Accordion>
        </div>
        <div className={styles.compactFilterContainer}>
          <Accordion title="Sort Direction" compact>
            <div className={styles.compactOptionsContainer}>
              {sortDirections.map((item) => (
                <Input
                  key={item.value}
                  name="sortDirection"
                  type="radio"
                  options={[item.display]}
                  value={item.value}
                  checked={sortDirection === item.value}
                  onChange={() => sortResults(null, item.value)}
                />
              ))}
            </div>
          </Accordion>
        </div>
      </div>
    </>
  )
}
