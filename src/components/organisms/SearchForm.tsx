import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement } from 'react'
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

  return (
    <div id="searchFormSection" className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        {body && <Markdown text={body} className={styles.paragraph} />}
        <label className={styles.inputLabel} htmlFor="searchForm">
          {inputLabel}
        </label>
        <SearchBar
          isHome
          visibleInput
          placeholder={placeholder}
          name="searchForm"
        />
      </div>
    </div>
  )
}
