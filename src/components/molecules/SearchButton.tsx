import React, { FormEvent, ReactElement } from 'react'
import { ReactComponent as SearchIcon } from '../../images/search.svg'
import styles from './SearchButton.module.css'
import { useUserPreferences } from '../../providers/UserPreferences'

export default function SearchButton(): ReactElement {
  const { isSearchBarVisible, setSearchBarVisible } = useUserPreferences()
  const isHome = window.location.pathname === '/'

  React.useEffect(() => {
    if (!isHome) {
      const searchForm = document?.getElementById('searchForm')
      if (searchForm) searchForm.focus()
    }
  }, [isSearchBarVisible, isHome])

  async function handleButtonClick(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    setSearchBarVisible(!isSearchBarVisible)
    const searchFormSection = document?.getElementById('searchFormSection')
    if (searchFormSection) {
      document.getElementById('searchForm').focus()
      searchFormSection.scrollIntoView()
    }
  }

  return (
    <div className={styles.search}>
      <button onClick={handleButtonClick} className={styles.button}>
        <SearchIcon className={styles.searchIcon} />
      </button>
    </div>
  )
}
