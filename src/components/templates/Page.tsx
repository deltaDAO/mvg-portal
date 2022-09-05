import React, { ReactNode, ReactElement } from 'react'
import PageHeader from '../molecules/PageHeader'
import Seo from '../atoms/Seo'
import Container from '../atoms/Container'
import SearchBar from '../molecules/SearchBar'
import { graphql, useStaticQuery } from 'gatsby'
import { useUserPreferences } from '../../providers/UserPreferences'

const query = graphql`
  query SearchBarQuery {
    file(relativePath: { eq: "pages/index/searchForm/index.json" }) {
      childSearchFormJson {
        placeholder
      }
    }
  }
`

interface SearchFormData {
  file: {
    childSearchFormJson: {
      placeholder: string
    }
  }
}
export interface PageProps {
  children: ReactNode
  title?: string
  uri: string
  description?: string
  noPageHeader?: boolean
  headerCenter?: boolean
  isEdgeProvider?: boolean
}

export default function Page({
  children,
  title,
  uri,
  description,
  noPageHeader,
  headerCenter,
  isEdgeProvider
}: PageProps): ReactElement {
  const data: SearchFormData = useStaticQuery(query)
  const { placeholder } = data.file.childSearchFormJson
  const isHome = uri === '/'
  const isSearch = uri === '/search'
  const { isSearchBarVisible, setSearchBarVisible } = useUserPreferences()

  React.useLayoutEffect(() => {
    setSearchBarVisible(false)
  }, [isHome, setSearchBarVisible])

  const childElements = (
    <>
      {((!isHome && isSearchBarVisible) || isSearch) && (
        <>
          <SearchBar
            visibleInput
            name="searchInput"
            placeholder={placeholder}
            isSearchPage={isSearch}
          />
        </>
      )}
      {title && !noPageHeader && (
        <PageHeader
          title={title}
          description={description}
          center={headerCenter}
          powered={isHome}
          isEdgeProvider={isEdgeProvider}
        />
      )}
      {children}
    </>
  )

  return (
    <>
      <Seo title={title} description={description} uri={uri} />
      {isHome ? childElements : <Container>{childElements}</Container>}
    </>
  )
}
