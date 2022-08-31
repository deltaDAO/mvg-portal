import React, { ReactElement, useState } from 'react'
import { useNavigate } from '@reach/router'
import classNames from 'classnames/bind'
import { addExistingParamsToUrl } from './utils'
import Button from '../../atoms/Button'
import styles from './Filters.module.css'
import {
  FilterByAccessOptions,
  FilterByTypeOptions,
  FilterOptions,
  Filters
} from '../../../models/SortAndFilters'
import queryString from 'query-string'

const cx = classNames.bind(styles)

const clearFilters = [{ display: 'Clear', value: '' }]

const serviceFilterItems = [
  { display: 'data sets', value: FilterByTypeOptions.Data },
  { display: 'algorithms', value: FilterByTypeOptions.Algorithm },
  { display: 'edge devices', value: FilterByTypeOptions.Edge }
]

const accessFilterItems = [
  { display: 'download ', value: FilterByAccessOptions.Download },
  { display: 'compute ', value: FilterByAccessOptions.Compute }
]

export default function FilterPrice({
  addFiltersToUrl,
  accessType,
  setAccessType,
  serviceType,
  setServiceType,
  className
}: {
  addFiltersToUrl?: boolean
  accessType?: FilterByAccessOptions[]
  setAccessType?: (accessType: FilterByAccessOptions[]) => void
  serviceType?: FilterByTypeOptions[]
  setServiceType?: (serviceType: FilterByTypeOptions[]) => void
  className?: string
}): ReactElement {
  const parsedUrl = queryString.parse(location.search, {
    arrayFormat: 'separator'
  })
  const initialAccessFilter = !addFiltersToUrl
    ? accessType
    : !parsedUrl?.accessType
    ? []
    : Array.isArray(parsedUrl?.accessType)
    ? parsedUrl?.accessType
    : [parsedUrl?.accessType]
  const initialServiceFilter = !addFiltersToUrl
    ? serviceType
    : !parsedUrl?.serviceType
    ? []
    : Array.isArray(parsedUrl?.serviceType)
    ? parsedUrl?.serviceType
    : [parsedUrl?.serviceType]

  const navigate = useNavigate()
  const [accessSelection, setAccessSelection] =
    useState<string[]>(initialAccessFilter)
  const [serviceSelection, setServiceSelection] =
    useState<string[]>(initialServiceFilter)

  async function applyFilter(filter: Filters[], filterType: FilterOptions) {
    if (addFiltersToUrl) {
      let urlLocation = ''
      if (filterType.localeCompare(FilterOptions.AccessType) === 0) {
        urlLocation = await addExistingParamsToUrl(location, [
          FilterOptions.AccessType
        ])
      } else {
        urlLocation = await addExistingParamsToUrl(location, [
          FilterOptions.ServiceType
        ])
      }

      if (filter.length > 0 && urlLocation.indexOf(filterType) === -1) {
        const parsedFilter = filter.join(',')
        filterType === FilterOptions.AccessType
          ? (urlLocation = `${urlLocation}&accessType=${parsedFilter}`)
          : (urlLocation = `${urlLocation}&serviceType=${parsedFilter}`)
      }

      navigate(urlLocation)
    }
  }

  function updateFilterValues(
    newValue: string,
    prevValues: string[]
  ): string[] {
    const updatedValues = prevValues.includes(newValue)
      ? prevValues.filter((value) => value !== newValue)
      : [...prevValues, newValue]
    return updatedValues
  }

  async function handleSelectedFilter(
    value: Filters,
    filterType: FilterOptions
  ) {
    const updatedSelection =
      filterType === FilterOptions.AccessType
        ? updateFilterValues(value, accessSelection)
        : updateFilterValues(value, serviceSelection)

    await applyFilter(updatedSelection as Filters[], filterType)

    if (filterType === FilterOptions.AccessType) {
      setAccessSelection(updatedSelection)
      setAccessType &&
        setAccessType(updatedSelection as FilterByAccessOptions[])
    } else {
      setServiceSelection(updatedSelection)
      setServiceType &&
        setServiceType(updatedSelection as FilterByTypeOptions[])
    }
  }

  async function applyClearFilter(addFiltersToUrl: boolean) {
    setAccessSelection([])
    setServiceSelection([])
    setAccessType && setAccessType([])
    setServiceType && setServiceType([])
    if (addFiltersToUrl) {
      let urlLocation = await addExistingParamsToUrl(location, [
        FilterOptions.AccessType,
        FilterOptions.ServiceType
      ])
      urlLocation = `${urlLocation}`
      navigate(urlLocation)
    }
  }

  const styleClasses = cx({
    filterList: true,
    [className]: className
  })

  return (
    <div className={styleClasses}>
      {serviceFilterItems.map((e, index) => {
        const isServiceSelected = serviceSelection.includes(e.value)
        const selectFilter = cx({
          [styles.selected]: isServiceSelected,
          [styles.filter]: true
        })
        return (
          <Button
            size="small"
            style="text"
            key={index}
            className={selectFilter}
            onClick={async () => {
              handleSelectedFilter(e.value, FilterOptions.ServiceType)
            }}
          >
            {e.display}
          </Button>
        )
      })}
      <div className={styles.separator} />
      {accessFilterItems.map((e, index) => {
        const isAccessSelected = accessSelection.includes(e.value)
        const selectFilter = cx({
          [styles.selected]: isAccessSelected,
          [styles.filter]: true
        })
        return (
          <Button
            size="small"
            style="text"
            key={index}
            className={selectFilter}
            onClick={async () => {
              handleSelectedFilter(e.value, FilterOptions.AccessType)
            }}
          >
            {e.display}
          </Button>
        )
      })}
      {clearFilters.map((e, index) => {
        const showClear =
          accessSelection.length > 0 || serviceSelection.length > 0
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
  )
}
