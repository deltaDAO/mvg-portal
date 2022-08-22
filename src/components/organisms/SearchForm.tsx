import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement, useEffect, useRef } from 'react'
import { useUserPreferences } from '../../providers/UserPreferences'
import Markdown from '../atoms/Markdown'
import SearchBar from '../molecules/SearchBar'
import styles from './SearchForm.module.css'

const query = graphql`
  query SearchFormQuery {
    file(relativePath: { eq: "pages/index/searchForm/index.json" }) {
      childSearchFormJson {
        title
        body
        placeholder
        inputLabel
      }
    }
  }
`

interface SearchFormData {
  file: {
    childSearchFormJson: {
      title: string
      body: string
      placeholder: string
      inputLabel: string
    }
  }
}

export default function SearchForm(): ReactElement {
  const data: SearchFormData = useStaticQuery(query)
  const { title, body, placeholder, inputLabel } = data.file.childSearchFormJson
  const { searchBarScrollState, setSearchBarScrollState } = useUserPreferences()
  const searchformSection = useRef(null)

  useEffect(() => {
    if (searchBarScrollState) {
      searchformSection.current.scrollIntoView()
      setSearchBarScrollState(false)
    }
  }, [searchBarScrollState, setSearchBarScrollState])

  return (
    <div ref={searchformSection} className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        {body && <Markdown text={body} className={styles.paragraph} />}
        <label className={styles.inputLabel} htmlFor="searchInput">
          {inputLabel}
        </label>
        <SearchBar visibleInput placeholder={placeholder} name="searchInput" />
      </div>
    </div>
  )
}
