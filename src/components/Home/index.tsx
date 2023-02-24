import React, { ReactElement, useEffect, useState } from 'react'
import Button from '@shared/atoms/Button'
import Bookmarks from './Bookmarks'
import { generateBaseQuery } from '@utils/aquarius'
import { useUserPreferences } from '@context/UserPreferences'
import { SortTermOptions } from '../../@types/aquarius/SearchQuery'
import SectionQueryResult from './SectionQueryResult'
import styles from './index.module.css'
import SuccessConfetti from '@components/@shared/SuccessConfetti'

export default function HomePage(): ReactElement {
  const { chainIds } = useUserPreferences()

  const [queryLatest, setQueryLatest] = useState<SearchQuery>()

  useEffect(() => {
    const baseParams = {
      chainIds,
      esPaginationOptions: {
        size: 6
      },
      sortOptions: {
        sortBy: SortTermOptions.Created
      } as SortOptions
    } as BaseQueryParams
    setQueryLatest(generateBaseQuery(baseParams))
  }, [chainIds])

  return (
    <>
      <SuccessConfetti success="done" />
      <section className={styles.section}>
        <h3>Your Bookmarks</h3>
        <Bookmarks />
      </section>
      <SectionQueryResult
        title="Recently Published"
        query={queryLatest}
        action={
          <Button
            style="text"
            arrow
            to="/search?sort=nft.created&sortOrder=desc"
          >
            All datasets and algorithms
          </Button>
        }
      />
    </>
  )
}
