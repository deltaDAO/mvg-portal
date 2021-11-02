import { useStaticQuery, graphql } from 'gatsby'

import React, { ReactElement } from 'react'
import Button from '../atoms/Button'
import Container from '../atoms/Container'
import styles from './HomeIntro.module.css'
import { ReactComponent as Globe } from '../../images/network-globe.svg'
import Permission from '../organisms/Permission'
import { SectionQueryResult } from '../pages/Home'
import Markdown from '../atoms/Markdown'

const query = graphql`
{
    file(absolutePath: {regex: "/intro\\.json/"}) {
      childIndexJson {
        intro {
          teaser {
            title
            text
            cta
            ctaTo
          }
          paragraphs {
            title
            body
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
  }
  // TODO : find correct syntax for sorting
  // sort: { created: 'desc' }
}

interface HomeIntroData {
  file: {
    childIndexJson: {
      intro: {
        teaser: {
          title: string
          text: string
          cta: string
          ctaTo: string
        }
        paragraphs: {
          title: string
          body: string
        }[]
      }
    }
  }
}

export default function HomeIntro(): ReactElement {
  const data: HomeIntroData = useStaticQuery(query)
  const { paragraphs, teaser } = data.file.childIndexJson.intro

  return (
    <div className={styles.introWrapper}>
      <Container>
        <div className={styles.intro}>
          <div className={styles.left}>
            {paragraphs.map((paragraph) => (
              <div key={paragraph.title} className={styles.paragraph}>
                <h2>{paragraph.title}</h2>
                <Markdown text={paragraph.body} />
              </div>
            ))}
          </div>
          <div className={styles.spacer} />
          <div className={styles.right}>
            <Globe className={styles.globe} />
            <Permission eventType="browse">
              <SectionQueryResult
                className="demonstrators"
                title=""
                query={queryDemonstrators}
                assetListClassName={styles.demonstrators}
              />
            </Permission>
            <h2>{teaser.title}</h2>
            <Markdown text={teaser.text} />
            <Button style="primary" className={styles.button} to={teaser.ctaTo}>
              {teaser.cta}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
