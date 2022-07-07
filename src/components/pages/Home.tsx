import React, {
  ReactElement,
  useEffect,
  useLayoutEffect,
  useState
} from 'react'
import styles from './Home.module.css'
import AssetList from '../organisms/AssetList'
import Button from '../atoms/Button'
import Permission from '../organisms/Permission'
import {
  generateBaseQuery,
  getFilterTerm,
  queryMetadata
} from '../../utils/aquarius'
import { DDO, Logger } from '@oceanprotocol/lib'
import { useUserPreferences } from '../../providers/UserPreferences'
import { useIsMounted } from '../../hooks/useIsMounted'
import { useCancelToken } from '../../hooks/useCancelToken'
import { SearchQuery } from '../../models/aquarius/SearchQuery'
import {
  SortDirectionOptions,
  SortOptions,
  SortTermOptions
} from '../../models/SortAndFilters'
import { BaseQueryParams } from '../../models/aquarius/BaseQueryParams'
import { PagedAssets } from '../../models/PagedAssets'
import HomeIntro from '../organisms/HomeIntro'
import HomeContent from '../organisms/HomeContent'
import Container from '../atoms/Container'
import { useAddressConfig } from '../../hooks/useAddressConfig'
import OnboardingSection from './Home/Onboarding'
import { useWeb3 } from '../../providers/Web3'
import PromotionBanner, { PromoBanner } from '../molecules/PromotionBanner'
import { graphql, useStaticQuery } from 'gatsby'

function sortElements(items: DDO[], sorted: string[]) {
  items.sort(function (a, b) {
    return (
      sorted.indexOf(a.dataToken.toLowerCase()) -
      sorted.indexOf(b.dataToken.toLowerCase())
    )
  })
  return items
}

const promotionBannerQuery = graphql`
  query promotionBannerQuery {
    content: allFile(
      filter: { relativePath: { eq: "promotionBanners.json" } }
    ) {
      edges {
        node {
          childContentJson {
            banners {
              title
              description
              link
              image {
                childImageSharp {
                  original {
                    src
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export function SectionQueryResult({
  title,
  query,
  action,
  queryData,
  className,
  assetListClassName
}: {
  title: ReactElement | string
  query: SearchQuery
  action?: ReactElement
  queryData?: string[]
  className?: string
  assetListClassName?: string
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState<boolean>()
  const isMounted = useIsMounted()
  const newCancelToken = useCancelToken()
  useEffect(() => {
    async function init() {
      if (chainIds.length === 0) {
        const result: PagedAssets = {
          results: [],
          page: 0,
          totalPages: 0,
          totalResults: 0
        }
        setResult(result)
        setLoading(false)
      } else {
        try {
          setLoading(true)
          const result = await queryMetadata(query, newCancelToken())
          if (!isMounted()) return
          if (queryData && result?.totalResults > 0) {
            const sortedAssets = sortElements(result.results, queryData)
            const overflow = sortedAssets.length - 9
            sortedAssets.splice(sortedAssets.length - overflow, overflow)
            result.results = sortedAssets
          }
          setResult(result)
          setLoading(false)
        } catch (error) {
          Logger.error(error.message)
        }
      }
    }
    init()
  }, [chainIds.length, isMounted, newCancelToken, query, queryData])

  return (
    <section className={className || styles.section}>
      <h3>{title}</h3>
      <AssetList
        assets={result?.results}
        showPagination={false}
        isLoading={loading}
        className={assetListClassName}
      />
      {action && action}
    </section>
  )
}

export default function HomePage(): ReactElement {
  const [queryLatest, setQueryLatest] = useState<SearchQuery>()
  const { chainIds } = useUserPreferences()
  const { featured, hasFeaturedAssets } = useAddressConfig()
  const { balance, balanceLoading, chainId, web3Loading } = useWeb3()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const data = useStaticQuery(promotionBannerQuery)
  const {
    banners
  }: {
    banners: PromoBanner[]
  } = data.content.edges[0].node.childContentJson

  useLayoutEffect(() => {
    const { eth, ocean } = balance
    if (web3Loading) {
      setShowOnboarding(false)
      return
    }
    if (
      chainId !== 2021000 ||
      (chainId === 2021000 && !balanceLoading && (eth === '0' || ocean === '0'))
    ) {
      setShowOnboarding(true)
      return
    }
    setShowOnboarding(false)
  }, [balance, balanceLoading, chainId, web3Loading])

  useEffect(() => {
    const queryParams = {
      esPaginationOptions: {
        size: hasFeaturedAssets() ? featured.length : 9
      },
      filters: hasFeaturedAssets() ? [getFilterTerm('id', featured)] : undefined
    }

    const baseParams = {
      ...queryParams,
      chainIds: chainIds,
      esPaginationOptions: { size: 9 },
      sortOptions: {
        sortBy: SortTermOptions.Created,
        sortDirection: SortDirectionOptions.Ascending
      } as SortOptions
    } as BaseQueryParams

    const latestOrFeaturedQuery = generateBaseQuery(baseParams)

    setQueryLatest(latestOrFeaturedQuery)
  }, [chainIds])

  return (
    <Permission eventType="browse">
      <>
        {showOnboarding && (
          <section className={styles.content}>
            <OnboardingSection />
          </section>
        )}
        <Container>
          {queryLatest && (
            <SectionQueryResult
              title={
                hasFeaturedAssets() ? 'Featured Assets' : 'Recently Published'
              }
              query={queryLatest}
              action={
                <Button style="text" to="/search?sort=created&sortOrder=desc">
                  All data sets and algorithms →
                </Button>
              }
            />
          )}
        </Container>
        <section className={styles.intro}>
          <HomeIntro />
        </section>
        <section className={styles.content}>
          <HomeContent />´
        </section>
        <Container>
          <div>
            {banners?.map((banner, i) => (
              <PromotionBanner {...banner} key={i} />
            ))}
          </div>
        </Container>
      </>
    </Permission>
  )
}
