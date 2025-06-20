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
}

export default function Page({
  children,
  title,
  uri,
  description,
  noPageHeader,
  headerCenter
}: PageProps): ReactElement {
  const { allowExternalContent } = useUserPreferences()

  const isHome = uri === '/'
  const isSearchPage = uri.startsWith('/search')
  const isAssetPage = uri.startsWith('/asset')

  return (
    <>
      <Seo title={title} description={description} uri={uri} />

      {/* Header section - always wrapped in Container except for home page */}
      {!isHome && (
        <Container>
          {/* <SearchBar
            placeholder="Search for service offerings"
            isSearchPage={isSearchPage}
          /> */}
          {isAssetPage && !allowExternalContent && <ExternalContentWarning />}
          {title && !noPageHeader && (
            <PageHeader center={headerCenter} isHome={isHome} />
          )}
        </Container>
      )}

      {/* Main content - full width for home, contained for others */}
      <main className={isHome ? 'full-width' : ''}>
        {isHome ? children : <Container>{children}</Container>}
      </main>
    </>
  )
}
