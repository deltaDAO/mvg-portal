import { ReactElement, useEffect } from 'react'
import { addExistingParamsToUrl } from './utils'
import styles from './sort.module.css'
import {
  SortDirectionOptions,
  SortTermOptions
} from '../../@types/aquarius/SearchQuery'
import { useRouter } from 'next/router'
import Accordion from '@components/@shared/Accordion'
import Input from '@components/@shared/FormInput'
import { Sort as SortInterface, useFilter } from '@context/Filter'
import queryString from 'query-string'

const sortItems = [
  { display: 'Relevance', value: SortTermOptions.Relevance },
  { display: 'Published', value: SortTermOptions.Created },
  { display: 'Sales', value: SortTermOptions.Orders },
  { display: 'Price', value: SortTermOptions.Price }
]

const sortDirections = [
  { display: '\u2191 Ascending', value: SortDirectionOptions.Ascending },
  { display: '\u2193 Descending', value: SortDirectionOptions.Descending }
]

function getInitialFilters(
  parsedUrlParams: queryString.ParsedQuery<string>,
  filterIds: (keyof SortInterface)[]
): SortInterface {
  if (!parsedUrlParams || !filterIds) return

  const initialFilters = {}
  filterIds.forEach((id) => (initialFilters[id] = parsedUrlParams?.[id]))

  return initialFilters as SortInterface
}

export default function Sort({
  expanded
}: {
  expanded?: boolean
}): ReactElement {
  const { sort, setSort } = useFilter()

  const router = useRouter()

  const parsedUrl = queryString.parse(location.search, {
    arrayFormat: 'separator'
  })

  useEffect(() => {
    const initialFilters = getInitialFilters(
      parsedUrl,
      Object.keys(sort) as (keyof SortInterface)[]
    )
    setSort(initialFilters)
  }, [])

  async function sortResults(
    sortBy?: SortTermOptions,
    direction?: SortDirectionOptions
  ) {
    let urlLocation: string
    if (sortBy) {
      urlLocation = await addExistingParamsToUrl(location, ['sort'])
      urlLocation = `${urlLocation}&sort=${sortBy}`
      setSort({ ...sort, sort: sortBy })
    } else if (direction) {
      urlLocation = await addExistingParamsToUrl(location, ['sortOrder'])
      urlLocation = `${urlLocation}&sortOrder=${direction}`
      setSort({ ...sort, sortOrder: direction })
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
                  checked={sort.sort === item.value}
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
                  checked={sort.sortOrder === item.value}
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
                  name="sortTypeCompact"
                  type="radio"
                  options={[item.display]}
                  value={item.value}
                  checked={sort.sort === item.value}
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
                  name="sortDirectionCompact"
                  type="radio"
                  options={[item.display]}
                  value={item.value}
                  checked={sort.sortOrder === item.value}
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
