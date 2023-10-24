import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useRef
} from 'react'
import SearchIcon from '@images/search.svg'
import InputElement from '@shared/FormInput/InputElement'
import styles from './SearchBar.module.css'
import { addExistingParamsToUrl } from '../Search/utils'
import { useRouter } from 'next/router'
import { animated, useSpring } from 'react-spring'
import { useSearchBarStatus } from '@context/SearchBarStatus'

async function emptySearch() {
  const searchParams = new URLSearchParams(window?.location.href)
  const text = searchParams.get('text')

  if (text !== ('' || undefined || null)) {
    await addExistingParamsToUrl(location, ['text', 'owner', 'tags'])
  }
}

export default function SearchBar({
  placeholder,
  initialValue,
  isSearchPage
}: {
  placeholder?: string
  initialValue?: string
  isSearchPage?: boolean
}): ReactElement {
  const router = useRouter()
  const [value, setValue] = useState(initialValue || '')
  const parsed = router.query
  const isHome = window.location.pathname === '/'
  const searchBarRef = useRef<HTMLInputElement>(null)
  const {
    isSearchBarVisible,
    setSearchBarVisible,
    homeSearchBarFocus,
    setHomeSearchBarFocus
  } = useSearchBarStatus()

  useEffect(() => {
    if (parsed?.text || parsed?.owner)
      setValue((parsed?.text || parsed?.owner) as string)
  }, [parsed?.text, parsed?.owner])

  useEffect(() => {
    setSearchBarVisible(false)
    setHomeSearchBarFocus(false)
  }, [setSearchBarVisible, setHomeSearchBarFocus])

  useEffect(() => {
    if (!isSearchBarVisible && !homeSearchBarFocus) return
    if (searchBarRef?.current) {
      searchBarRef.current.focus()
    }
  }, [isSearchBarVisible, homeSearchBarFocus])

  async function startSearch(
    e: FormEvent<HTMLButtonElement | HTMLInputElement>
  ) {
    e.preventDefault()

    if (value === '') setValue(' ')

    const urlEncodedValue = encodeURIComponent(value)
    const url = await addExistingParamsToUrl(location, [
      'text',
      'owner',
      'tags'
    ])
    router.push(`${url}&text=${urlEncodedValue}`)
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

  const springStile = useSpring({
    transform:
      isHome || isSearchPage || isSearchBarVisible
        ? 'translateY(0%)'
        : 'translateY(-150%)',
    config: { mass: 1, tension: 140, friction: 12 }
  })

  return (
    <form className={styles.search} autoComplete={!value ? 'off' : 'on'}>
      <animated.div style={springStile} className={styles.springContainer}>
        <InputElement
          ref={searchBarRef}
          type="search"
          name="search"
          placeholder={placeholder || 'Search...'}
          value={value}
          onChange={handleChange}
          required
          size="small"
          className={styles.input}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleButtonClick} className={styles.button}>
          <SearchIcon className={styles.searchIcon} />
        </button>
      </animated.div>
    </form>
  )
}
