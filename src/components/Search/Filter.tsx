import React, { ReactElement, useEffect } from 'react'
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

const cx = classNames.bind(styles)

const clearFilters = [{ display: 'Clear filters', value: '' }]

interface FilterStructure {
  id: keyof Filters
  label: string
  type: string
  options: {
    label: string
    value: string
  }[]
}

const filterList: FilterStructure[] = [
  {
    id: 'serviceType',
    label: 'Service Type',
    type: 'filterList',
    options: [
      { label: 'datasets', value: FilterByTypeOptions.Data },
      { label: 'algorithms', value: FilterByTypeOptions.Algorithm }
    ]
  },
  {
    id: 'accessType',
    label: 'Access Type',
    type: 'filterList',
    options: [
      { label: 'download', value: FilterByAccessOptions.Download },
      { label: 'compute', value: FilterByAccessOptions.Compute }
    ]
  },
  {
    id: 'filterSet',
    label: 'Categories',
    type: 'filterList',
    options: [
      {
        label: 'automotive',
        value: 'automotive'
      },
      {
        label: 'manufacturing',
        value: 'manufacturing'
      },
      {
        label: 'text analysis',
        value: 'textAnalysis'
      },
      {
        label: 'finance',
        value: 'finance'
      }
    ]
  }
]

export const filterSets = {
  automotive: [
    'charging',
    'ev',
    'gx4m',
    'mobility',
    'moveid',
    'parking',
    'traffic'
  ],
  manufacturing: [
    'euprogigant',
    'industry40',
    'manufacturing',
    'predictive-maintenance'
  ],
  textAnalysis: ['library', 'ocr', 'text-analysis'],
  finance: ['graphql']
}

const purgatoryFilterItem = { display: 'show purgatory ', value: 'purgatory' }

export function getInitialFilters(
  parsedUrlParams: queryString.ParsedQuery<string>,
  filterIds: (keyof Filters)[]
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
  className
}: {
  addFiltersToUrl?: boolean
  showPurgatoryOption?: boolean
  className?: string
}): ReactElement {
  const { filters, setFilters, ignorePurgatory, setIgnorePurgatory } =
    useFilter()

  const router = useRouter()

  const parsedUrl = queryString.parse(location.search, {
    arrayFormat: 'separator'
  })

  useEffect(() => {
    const initialFilters = getInitialFilters(
      parsedUrl,
      Object.keys(filters) as (keyof Filters)[]
    )
    setFilters(initialFilters)
  }, [])

  async function applyFilter(filter: string[], filterId: keyof Filters) {
    if (addFiltersToUrl) {
      let urlLocation = await addExistingParamsToUrl(location, [filterId])

      if (filter.length > 0 && urlLocation.indexOf(filterId) === -1) {
        const parsedFilter = filter.join(',')
        urlLocation = `${urlLocation}&${filterId}=${parsedFilter}`
      }

      router.push(urlLocation)
    }
  }

  async function handleSelectedFilter(value: string, filterId: keyof Filters) {
    const updatedFilters = filters[filterId].includes(value)
      ? { ...filters, [filterId]: filters[filterId].filter((e) => e !== value) }
      : { ...filters, [filterId]: [...filters[filterId], value] }
    setFilters(updatedFilters)

    await applyFilter(updatedFilters[filterId], filterId)
  }

  async function applyClearFilter(addFiltersToUrl: boolean) {
    const clearedFilters = { ...filters }
    Object.keys(clearedFilters).forEach((key) => (clearedFilters[key] = []))
    setFilters(clearedFilters)

    if (ignorePurgatory !== undefined && setIgnorePurgatory !== undefined)
      setIgnorePurgatory(true)

    if (addFiltersToUrl) {
      const urlLocation = await addExistingParamsToUrl(
        location,
        Object.keys(clearedFilters)
      )
      router.push(urlLocation)
    }
  }

  const styleClasses = cx({
    filterList: true,
    [className]: className
  })

  const selectedFiltersCount = Object.values(filters).reduce(
    (acc, filter) => acc + filter.length,
    0
  )

  return (
    <Accordion
      defaultState={true}
      title="Filters"
      badgeNumber={selectedFiltersCount}
    >
      <div className={styleClasses}>
        <div className={styles.filtersHeader}>
          {clearFilters.map((e, index) => {
            const showClear = Object.values(filters)?.some(
              (filter) => filter?.length > 0
            )
            return (
              <Button
                size="small"
                style="text"
                key={index}
                className={showClear ? styles.showClear : styles.hideClear}
                onClick={async () => {
                  applyClearFilter(addFiltersToUrl)
                }}
              >
                {e.display}
              </Button>
            )
          })}
        </div>
        {filterList.map((filter) => (
          <div key={filter.id} className={styles.filterType}>
            <h4 className={styles.filterTypeLabel}>{filter.label}</h4>
            {filter.options.map((option) => {
              const isSelected = filters[filter.id].includes(option.value)
              return (
                <Input
                  key={option.value}
                  name={option.label}
                  type="checkbox"
                  options={[option.label]}
                  checked={isSelected}
                  onChange={async () => {
                    handleSelectedFilter(option.value, filter.id)
                  }}
                />
              )
            })}
          </div>
        ))}
        {showPurgatoryOption && (
          <div className={styles.filterType}>
            <h4 className={styles.filterTypeLabel}>Purgatory</h4>
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
  )
}
