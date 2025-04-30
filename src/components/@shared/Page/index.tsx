import { ReactNode, ReactElement } from 'react'
import PageHeader from './PageHeader'
import Seo from './Seo'
import Container from '@shared/atoms/Container'
import SearchBar from '@components/Header/SearchBar'
import { useUserPreferences } from '@context/UserPreferences'
import ExternalContentWarning from '../ExternalContentWarning'

export interface PageProps {
  children: ReactNode
  title?: string
  uri: string
  description?: string
  noPageHeader?: boolean
  headerCenter?: boolean
  noContainer?: boolean
}

export default function Page({
  children,
  title,
  uri,
  description,
  noPageHeader,
  headerCenter,
  noContainer
}: PageProps): ReactElement {
  const { allowExternalContent } = useUserPreferences()

  const isHome = uri === '/'
  const isSearchPage = uri.startsWith('/search')
  const isAssetPage = uri.startsWith('/asset')

  const content = (
    <>
      <SearchBar
        placeholder="Search for service offerings"
        isSearchPage={isSearchPage}
      />
      {isAssetPage && !allowExternalContent && <ExternalContentWarning />}
      {/* {title && !noPageHeader && (
        <PageHeader
          title={isHome ? title : <>{title.slice(0, 400)}</>}
          center={headerCenter}
          description={description}
          isHome={isHome}
        />
      )} */}
      {children}
    </>
  )

  return (
    <>
      <Seo title={title} description={description} uri={uri} />
      {noContainer ? content : <Container>{content}</Container>}
    </>
  )
}
