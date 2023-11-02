import { FormEvent, ReactElement } from 'react'
import SearchIcon from '@images/search.svg'
import styles from './SearchButton.module.css'
import { useSearchBarStatus } from '@context/SearchBarStatus'

export default function SearchButton(): ReactElement {
  const { isSearchBarVisible, setSearchBarVisible } = useSearchBarStatus()

  async function handleButtonClick(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault()

    setSearchBarVisible(!isSearchBarVisible)
  }

  return (
    <div className={styles.search}>
      <button onClick={handleButtonClick} className={styles.button}>
        <SearchIcon className={styles.searchIcon} />
      </button>
    </div>
  )
}
