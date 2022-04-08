import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement } from 'react'
import Button from '../../../atoms/Button'
import Container from '../../../atoms/Container'
import Markdown from '../../../atoms/Markdown'
import styles from './Main.module.css'

const onboardingMainQuery = graphql`
  query onboardingMainQuery {
    content: allFile(
      filter: { relativePath: { eq: "pages/index/onboarding.json" } }
    ) {
      edges {
        node {
          childIndexJson {
            steps {
              shortLabel
              title
              subtitle
              body
              image {
                childImageSharp {
                  original {
                    src
                  }
                }
              }
              cta {
                ctaLabel
                ctaAction
              }
            }
          }
        }
      }
    }
  }
`

interface OnboardingStep {
  shortLabel: string
  title: string
  subtitle: string
  body: string
  image?: {
    childImageSharp: { original: { src: string } }
  }
  cta?: {
    ctaLabel: string
    ctaAction: string
  }[]
}

export default function Main(): ReactElement {
  const data = useStaticQuery(onboardingMainQuery)
  const {
    steps
  }: {
    steps: OnboardingStep[]
  } = data.content.edges[0].node.childIndexJson

  console.log(steps)
  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{steps?.[0].title}</h3>
        <h5 className={styles.subtitle}>{steps?.[0].subtitle}</h5>
      </div>
      <div className={styles.content}>
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <Markdown text={steps?.[0].body} className={styles.paragraph} />
            <div className={styles.actions}>
              {steps && [0] &&
                steps[0].cta.map((e, i) => (
                  <Button key={i} style="primary">
                    {e.ctaLabel}
                  </Button>
                ))}
            </div>
          </div>
        </div>
        <img
          src={steps?.[0].image.childImageSharp.original.src}
          className={styles.image}
        />
      </div>
    </Container>
  )
}
