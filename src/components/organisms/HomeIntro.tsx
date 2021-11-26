import React, { ReactElement } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Container from '../atoms/Container'
import styles from './HomeIntro.module.css'
import { ReactComponent as Play } from '../../images/play.svg'
import Markdown from '../atoms/Markdown'
import {
  SortDirectionOptions,
  SortTermOptions
} from '../../models/SortAndFilters'
import Img, { FluidObject } from 'gatsby-image'

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
    waves: file(relativePath: { eq: "waves_trans.png" }) {
      childImageSharp {
      fluid {
          ...GatsbyImageSharpFluid
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
  waves: { childImageSharp: { fluid: FluidObject } }
}

export default function HomeIntro(): ReactElement {
  const data: HomeIntroData = useStaticQuery(query)
  const { teaser } = data.file.childIndexJson.intro
  const waves = data.waves.childImageSharp.fluid

  return (
    <div className={styles.introWrapper}>
      <Container>
        <div className={styles.intro}>
          <div className={styles.playButtonWrapper}>
            <a
              href="https://academy.delta-dao.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.playButton}>
                <div className={styles.circle} />
              </div>
              <h2 className={styles.circleText}>start now</h2>
              <Play className={styles.play} />
            </a>
          </div>
          <div className={styles.waves}>
            <Img fluid={waves} />
          </div>
          <div className={styles.education}>
            <h4>{teaser.pre}</h4>
            <h2>{teaser.title}</h2>
            <Markdown text={teaser.text} />
          </div>
        </div>
      </Container>
    </div>
  )
}
