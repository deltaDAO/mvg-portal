import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  ReactElement
} from 'react'
import { navigate } from 'gatsby'
import queryString from 'query-string'
import { addExistingParamsToUrl } from '../templates/Search/utils'
import { ReactComponent as SearchIcon } from '../../images/search.svg'
import InputElement from '../atoms/Input/InputElement'
import styles from './SearchBar.module.css'
import { useUserPreferences } from '../../providers/UserPreferences'

async function emptySearch() {
  const searchParams = new URLSearchParams(window.location.href)
  const text = searchParams.get('text')
  if (text !== ('' || undefined || null)) {
    const url = await addExistingParamsToUrl(location, [
      'text',
      'owner',
      'tags'
    ])
    navigate(`${url}&text=%20`)
  }
}

export default function SearchBar({
  placeholder,
  initialValue,
  visibleInput,
  isSearchPage,
  name
}: {
  placeholder?: string
  initialValue?: string
  visibleInput?: boolean
  isSearchPage?: boolean
  name?: string
}): ReactElement {
  const [value, setValue] = useState(initialValue || '')
  const parsed = queryString.parse(location.search)
  const { text, owner } = parsed
  const { isSearchBarVisible } = useUserPreferences()
  const isHome = window.location.pathname === '/'

  useEffect(() => {
    ;(text || owner) && setValue((text || owner) as string)
  }, [text, owner])

  useEffect(() => {
    if (!isHome) {
      const searchForm = document?.getElementById('searchForm')
      if (searchForm) searchForm.focus()
    }
  }, [isHome, isSearchBarVisible])

  async function startSearch(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault()

    if (value === '') setValue(' ')

    const urlEncodedValue = encodeURIComponent(value)
    const url = await addExistingParamsToUrl(location, [
      'text',
      'owner',
      'tags'
    ])
    navigate(`${url}&text=${urlEncodedValue}`)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
    e.target.value === '' && emptySearch()
  }

  async function handleKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      await startSearch(e)
    }
  }

  async function handleButtonClick(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    await startSearch(e)
  }

  return (
    <form
      className={
        isHome
          ? styles.visibleInputSearchHome
          : isSearchPage
          ? styles.visibleInputSearch
          : styles.search
      }
    >
      <InputElement
        type="search"
        name={name || 'search'}
        placeholder={placeholder || 'Search...'}
        value={value}
        onChange={handleChange}
        required
        size="small"
        className={visibleInput ? styles.visibleInput : styles.input}
        onKeyPress={handleKeyPress}
      />
      <button
        onClick={handleButtonClick}
        className={visibleInput ? styles.visibleInputButton : styles.button}
      >
        <SearchIcon
          className={
            visibleInput ? styles.visibleInputSearchIcon : styles.searchIcon
          }
        />
      </button>
    </form>
  )
}
