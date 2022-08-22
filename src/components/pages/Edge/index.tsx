import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import Permission from '../../organisms/Permission'
import AssetList from '../../organisms/AssetList'
import styles from './index.module.css'
import {
  SortDirectionOptions,
  SortOptions,
  SortTermOptions
} from '../../../models/SortAndFilters'
import { BaseQueryParams } from '../../../models/aquarius/BaseQueryParams'
import {
  generateBaseQuery,
  getFilterTerm,
  queryMetadata
} from '../../../utils/aquarius'
import { PagedAssets } from '../../../models/PagedAssets'
import { useCancelToken } from '../../../hooks/useCancelToken'
import { useUserPreferences } from '../../../providers/UserPreferences'
import Loader from '../../atoms/Loader'
import { updateQueryStringParameter } from '../../../utils'
import { graphql, navigate, useStaticQuery } from 'gatsby'
import queryString from 'query-string'
import Markdown from '../../atoms/Markdown'

const edgeContentQuery = graphql`
  query edgeContentQuery {
    content: allFile(
      filter: { relativePath: { eq: "pages/edge/content.json" } }
    ) {
      edges {
        node {
          childEdgeJson {
            content {
              paragraphs {
                title
                body
              }
            }
          }
        }
      }
    }
  }
`

interface EdgeContent {
  content: {
    edges: {
      node: {
        childEdgeJson: {
          content: {
            paragraphs: {
              title: string
              body: string
            }[]
          }
        }
      }
    }[]
  }
}

export default function EdgePage({
  location
}: {
  location: Location
}): ReactElement {
  const data: EdgeContent = useStaticQuery(edgeContentQuery)
  const { paragraphs } = data.content.edges[0].node.childEdgeJson.content

  const { chainIds } = useUserPreferences()
  const [parsed, setParsed] = useState<queryString.ParsedQuery<string>>()
  const [queryResult, setQueryResult] = useState<PagedAssets>()
  const [isLoading, setIsLoading] = useState(false)
  const newCancelToken = useCancelToken()

  useEffect(() => {
    const parsed = queryString.parse(location.search)
    setParsed(parsed)
  }, [location])

  const fetchAssets = useCallback(
    async (parsed: queryString.ParsedQuery<string>, chainIds: number[]) => {
      setIsLoading(true)

      const size = 21
      const baseParams = {
        chainIds,
        esPaginationOptions: {
          from:
            (Number(parsed?.page || 1) - 1) * Number(parsed?.offset || size),
          size: Number(parsed?.offset || size)
        },
        filters: [getFilterTerm('service.attributes.main.type', 'thing')],
        sortOptions: {
          sortBy: SortTermOptions.Created,
          sortDirection: SortDirectionOptions.Ascending
        } as SortOptions
      } as BaseQueryParams
      try {
        const query = generateBaseQuery(baseParams, { includeThings: true })
        const result = await queryMetadata(query, newCancelToken())
        setQueryResult(result)
      } catch (error) {
        console.error(error.message)
      } finally {
        setIsLoading(false)
      }
    },
    [newCancelToken]
  )

  const updatePage = useCallback(
    (page: number) => {
      const { pathname, search } = location
      const newUrl = updateQueryStringParameter(
        pathname + search,
        'page',
        `${page}`
      )
      return navigate(newUrl)
    },
    [location]
  )

  useEffect(() => {
    if (!parsed || !queryResult) return
    const { page } = parsed
    if (queryResult.totalPages < Number(page)) updatePage(1)
  }, [parsed, queryResult, updatePage])

  useEffect(() => {
    if (!parsed || !chainIds) return
    fetchAssets(parsed, chainIds)
  }, [parsed, chainIds, newCancelToken, fetchAssets])

  return (
    <div>
      {paragraphs.map((paragraph, i) => (
        <div key={i}>
          <h4>{paragraph.title}</h4>
          <Markdown text={paragraph.body} />
        </div>
      ))}
      <Permission eventType="browse">
        {isLoading ? (
          <Loader />
        ) : (
          <div className={styles.results}>
            <AssetList
              assets={queryResult?.results}
              showPagination
              isLoading={isLoading}
              page={queryResult?.page}
              totalPages={queryResult?.totalPages}
              onPageChange={updatePage}
            />
          </div>
        )}
      </Permission>
    </div>
  )
}
