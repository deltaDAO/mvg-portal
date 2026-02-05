import { ReactElement, useEffect } from 'react'
import classNames from 'classnames/bind'
import { addExistingParamsToUrl } from './utils'
import Button from '@shared/atoms/Button'
import {
  FilterByAccessOptions,
  FilterByTypeOptions
} from '../../@types/aquarius/SearchQuery'
import { useRouter } from 'next/router'
import queryString from 'query-string'
import styles from './Filter.module.css'
import { useFilter, Filters } from '@context/Filter'
import Input from '@components/@shared/FormInput'
import Accordion from '@components/@shared/Accordion'
import customFilters from '../../../filters.config'

const cx = classNames.bind(styles)

interface FilterStructure {
  id: string
  label: string
  type: string
  queryPath?: string
  options: {
    label: string
    value: string
    queryPath?: string
  }[]
}

const filterList: FilterStructure[] = [
  ...(Array.isArray(customFilters?.filters) &&
  customFilters?.filters?.length > 0 &&
  customFilters?.filters.some((filter) => filter !== undefined)
    ? // eslint-disable-next-line no-unsafe-optional-chaining
      customFilters?.filters
    : [])
]

export const filterSets = customFilters?.filterSets || {}

const purgatoryFilterItem = { display: 'show purgatory ', value: 'purgatory' }

export function getInitialFilters(
  parsedUrlParams: queryString.ParsedQuery<string>,
  filterIds: string[]
): Filters {
  if (!parsedUrlParams || !filterIds) return

  const initialFilters = {}
  filterIds.forEach((id) =>
    !parsedUrlParams?.[id]
      ? (initialFilters[id] = [])
      : Array.isArray(parsedUrlParams?.[id])
      ? (initialFilters[id] = parsedUrlParams?.[id])
      : (initialFilters[id] = [parsedUrlParams?.[id]])
  )

  return initialFilters as Filters
}

export default function Filter({
  addFiltersToUrl,
  showPurgatoryOption,
  expanded,
  className
}: {
  addFiltersToUrl?: boolean
  showPurgatoryOption?: boolean
  expanded?: boolean
  className?: string
}): ReactElement {
  const { filters, setFilters, ignorePurgatory, setIgnorePurgatory } =
    useFilter()

  const router = useRouter()

  const parsedUrl = queryString.parse(location.search, {
    arrayFormat: 'separator'
  })

  useEffect(() => {
    const initialFilters = getInitialFilters(parsedUrl, Object.keys(filters))
    setFilters(initialFilters)
  }, [])

  async function applyFilter(filter: string[], filterId: string) {
    if (!addFiltersToUrl) return

    let urlLocation = await addExistingParamsToUrl(location, [filterId])

    if (filter.length > 0 && urlLocation.indexOf(filterId) === -1) {
      const parsedFilter = filter.join(',')
      urlLocation = `${urlLocation}&${filterId}=${parsedFilter}`
    }

    router.push(urlLocation)
  }

  async function handleSelectedFilter(
    option: { label: string; value: string; queryPath?: string },
    filterId: string,
    queryPath?: string
  ) {
    const getFilterQueryString = `${option.queryPath || queryPath}=${
      option.value
    }`
    const updatedFilters = filters[filterId].includes(getFilterQueryString)
      ? {
          ...filters,
          [filterId]: filters[filterId].filter(
            (filter) => filter !== getFilterQueryString
          )
        }
      : {
          ...filters,
          [filterId]: [...filters[filterId], getFilterQueryString]
        }
    setFilters(updatedFilters)

    await applyFilter(updatedFilters[filterId], filterId)
  }

  async function clearFilters(addFiltersToUrl: boolean) {
    const clearedFilters = { ...filters }
    Object.keys(clearedFilters).forEach((key) => (clearedFilters[key] = []))
    setFilters(clearedFilters)

    if (ignorePurgatory !== undefined && setIgnorePurgatory !== undefined)
      setIgnorePurgatory(true)

    if (!addFiltersToUrl) return
    const urlLocation = await addExistingParamsToUrl(
      location,
      Object.keys(clearedFilters)
    )
    router.push(urlLocation)
  }

  const styleClasses = cx({
    filterList: true,
    [className]: className
  })

  const selectedFiltersCount = Object.values(filters).reduce(
    (acc, filter) => acc + filter.length,
    showPurgatoryOption && ignorePurgatory ? 1 : 0
  )

  return (
    <>
      <div className={styles.sidePositioning}>
        <Accordion
          title="Filters"
          defaultExpanded={expanded}
          badgeNumber={selectedFiltersCount}
          action={
            selectedFiltersCount > 0 && (
              <Button
                size="small"
                style="text"
                onClick={async () => {
                  clearFilters(addFiltersToUrl)
                }}
                className={styles.clearBtn}
              >
                Clear filters
              </Button>
            )
          }
        >
          <div className={styleClasses}>
            {filterList.map((filter, index) => (
              <div key={filter.id + index} className={styles.filterType}>
                <h5 className={styles.filterTypeLabel}>{filter.label}</h5>
                {filter.options.map((option) => {
                  const isSelected = filters[filter.id].includes(
                    `${option.queryPath || filter.queryPath}=${option.value}`
                  )
                  return (
                    <Input
                      key={option.value + option.queryPath}
                      name={option.label}
                      type="checkbox"
                      options={[option.label]}
                      checked={isSelected}
                      onChange={async () => {
                        handleSelectedFilter(
                          option,
                          filter.id,
                          filter?.queryPath
                        )
                      }}
                    />
                  )
                })}
              </div>
            ))}
            {showPurgatoryOption && (
              <div className={styles.filterType}>
                <h5 className={styles.filterTypeLabel}>Purgatory</h5>
                <Input
                  name={purgatoryFilterItem.value}
                  type="checkbox"
                  options={[purgatoryFilterItem.display]}
                  checked={ignorePurgatory}
                  onChange={async () => {
                    setIgnorePurgatory(!ignorePurgatory)
                  }}
                />
              </div>
            )}
          </div>
        </Accordion>
      </div>
      <div className={styles.topPositioning}>
        {filterList.map((filter, index) => (
          <div
            key={filter.id + index}
            className={styles.compactFilterContainer}
          >
            <Accordion
              title={filter.label}
              badgeNumber={filters[filter.id].length}
              compact
            >
              <div className={styles.compactOptionsContainer}>
                {filter.options.map((option) => {
                  const isSelected = filters[filter.id].includes(
                    `${option.queryPath || filter.queryPath}=${option.value}`
                  )

                  return (
                    <Input
                      key={option.value + option.queryPath}
                      name={option.label}
                      type="checkbox"
                      options={[option.label]}
                      checked={isSelected}
                      onChange={async () => {
                        handleSelectedFilter(
                          option,
                          filter.id,
                          filter?.queryPath
                        )
                      }}
                    />
                  )
                })}
              </div>
            </Accordion>
          </div>
        ))}
        {showPurgatoryOption && (
          <div className={styles.compactFilterContainer}>
            <Accordion
              title="Purgatory"
              badgeNumber={ignorePurgatory ? 1 : 0}
              compact
            >
              <Input
                name={purgatoryFilterItem.value}
                type="checkbox"
                options={[purgatoryFilterItem.display]}
                checked={ignorePurgatory}
                onChange={async () => {
                  setIgnorePurgatory(!ignorePurgatory)
                }}
              />
            </Accordion>
          </div>
        )}
      </div>
    </>
  )
}
