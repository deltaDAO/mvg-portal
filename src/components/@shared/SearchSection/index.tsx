import { ReactElement, ChangeEvent } from 'react'
import SearchIcon from '@images/search.svg'
import styles from './index.module.css'

interface SearchSectionProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function SearchSection({
  placeholder = 'Search by title, datatoken, or DID...',
  value,
  onChange,
  disabled = false
}: SearchSectionProps): ReactElement {
  function handleSearchInput(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
  }

  return (
    <div className={styles.searchContainer}>
      <input
        type="search"
        name="search"
        placeholder={placeholder}
        value={value}
        onChange={handleSearchInput}
        className={styles.search}
        disabled={disabled}
      />
      <div className={styles.searchButtonContainer}>
        <button
          type="button"
          className={styles.searchButton}
          disabled={disabled}
        >
          <SearchIcon className={styles.searchIcon} />
          <span className={styles.searchButtonText}>Search</span>
        </button>
      </div>
    </div>
  )
}
