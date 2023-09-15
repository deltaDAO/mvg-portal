import React, {
  createContext,
  useContext,
  ReactElement,
  ReactNode,
  useState
} from 'react'

export interface Filters {
  accessType: string[]
  serviceType: string[]
  filterSet: string[]
}

interface FilterValue {
  filters: Filters
  setFilters: (filters: Filters) => void
  ignorePurgatory: boolean
  setIgnorePurgatory: (value: boolean) => void
}

const FilterContext = createContext(null)

function FilterProvider({ children }: { children: ReactNode }): ReactElement {
  const [filters, setFilters] = useState<Filters>({
    accessType: [],
    serviceType: [],
    filterSet: []
  })
  const [ignorePurgatory, setIgnorePurgatory] = useState<boolean>(true)

  return (
    <FilterContext.Provider
      value={
        {
          filters,
          setFilters,
          ignorePurgatory,
          setIgnorePurgatory
        } as FilterValue
      }
    >
      {children}
    </FilterContext.Provider>
  )
}

// Helper hook to access the provider values
const useFilter = (): FilterValue => useContext(FilterContext)

export { FilterProvider, useFilter }
