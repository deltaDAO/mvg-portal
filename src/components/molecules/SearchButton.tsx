import React, { FormEvent, ReactElement } from 'react'
import { ReactComponent as SearchIcon } from '../../images/search.svg'
import styles from './SearchButton.module.css'

export default function SearchButton(): ReactElement {
  async function handleButtonClick(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    document.getElementById('searchForm').focus()
    document.getElementById('searchFormSection').scrollIntoView()
  }

  return (
    <div className={styles.search}>
      <button onClick={handleButtonClick} className={styles.button}>
        <SearchIcon className={styles.searchIcon} />
      </button>
    </div>
  )
}
