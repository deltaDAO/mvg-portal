import React, { ReactNode, ReactElement } from 'react'
import PageHeader from './PageHeader'
import Seo from './Seo'
import Container from '@shared/atoms/Container'
import SearchBar from '@components/Header/SearchBar'

export interface PageProps {
  children: ReactNode
  title?: string
  uri: string
  description?: string
  noPageHeader?: boolean
  headerCenter?: boolean
}

export default function Page({
  children,
  title,
  uri,
  description,
  noPageHeader,
  headerCenter
}: PageProps): ReactElement {
  const isHome = uri === '/'
  const isSearch = uri.startsWith('/search')

  return (
    <>
      <Seo title={title} description={description} uri={uri} />
      <Container>
        {!isHome && (
          <SearchBar
            placeholder="Search for service offerings"
            isSearchPage={isSearch}
          />
        )}
        {title && !noPageHeader && (
          <PageHeader
            title={isHome ? title : <>{title.slice(0, 400)}</>}
            center={headerCenter}
            description={description}
            isHome={isHome}
            showSearch={isHome}
          />
        )}
        {children}
      </Container>
    </>
  )
}
