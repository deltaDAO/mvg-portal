import React, { ReactNode, ReactElement } from 'react'
import PageHeader from '../molecules/PageHeader'
import Seo from '../atoms/Seo'
import Container from '../atoms/Container'
import SearchBar from '../molecules/SearchBar'

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
  const isSearch = uri === '/search'

  const childElements = (
    <>
      {isSearch && (
        <>
          <SearchBar
            visibleInput
            placeholder="Search for data sets / algorithms"
          />
        </>
      )}
      {title && !noPageHeader && (
        <PageHeader
          title={title}
          description={description}
          center={headerCenter}
          powered={isHome}
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
