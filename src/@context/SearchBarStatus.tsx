import {
  createContext,
  useContext,
  ReactElement,
  ReactNode,
  useState
} from 'react'

interface SearchBarStatusValue {
  isSearchBarVisible: boolean
  setSearchBarVisible: (value: boolean) => void
  homeSearchBarFocus: boolean
  setHomeSearchBarFocus: (value: boolean) => void
}

const SearchBarStatusContext = createContext(null)

function SearchBarStatusProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const [isSearchBarVisible, setSearchBarVisible] = useState<boolean>(false)
  const [homeSearchBarFocus, setHomeSearchBarFocus] = useState<boolean>(false)

  return (
    <SearchBarStatusContext.Provider
      value={
        {
          isSearchBarVisible,
          setSearchBarVisible,
          homeSearchBarFocus,
          setHomeSearchBarFocus
        } as SearchBarStatusValue
      }
    >
      {children}
    </SearchBarStatusContext.Provider>
  )
}

// Helper hook to access the provider values
const useSearchBarStatus = (): SearchBarStatusValue =>
  useContext(SearchBarStatusContext)

export { SearchBarStatusProvider, useSearchBarStatus }
