import React, { ReactElement } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import styles from './HomeIntro.module.css'
import Markdown from '../atoms/Markdown'
import {
  SortDirectionOptions,
  SortTermOptions
} from '../../models/SortAndFilters'

const query = graphql`
{
    file(absolutePath: {regex: "/intro\\.json/"}) {
      childIndexJson {
        intro {
          teaser {
            pre
            title
            text
            ctaTo
          }
        }
      }
    }
  }
`
export const queryDemonstrators = {
  from: 0,
  size: 9,
  query: {
    query_string: {
      query:
        'id:did\\:op\\:b3F2d84acEfb6aB4e850cb66dA2D9008E3f1A643 id:did\\:op\\:87152E582e3B05Cc6940E9763b9e0c22eA812448'
    }
  },
  sort: { [SortTermOptions.Created]: SortDirectionOptions.Descending }
}

interface HomeIntroData {
  file: {
    childIndexJson: {
      intro: {
        teaser: {
          pre: string
          title: string
          text: string
          ctaTo: string
        }
      }
    }
  }
}

export default function HomeIntro(): ReactElement {
  const data: HomeIntroData = useStaticQuery(query)
  const { teaser, ctaTo } = data.file.childIndexJson.intro

  return (
    <div className={styles.introWrapper}>
      <div className={styles.intro}>
        <div className={styles.playButtonWrapper}>
          <div className={styles.playButton}>
            <div className={styles.circle}>
              <a
                href={ctaTo}
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className={styles.circleText}>start now</h2>
              </a>
            </div>
          </div>
        </div>
        <div className={styles.education}>
          <h4>{teaser.pre}</h4>
          <h2>{teaser.title}</h2>
          <Markdown text={teaser.text} />
        </div>
      </div>
    </div>
  )
}
