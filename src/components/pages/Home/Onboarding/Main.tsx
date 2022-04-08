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

export default function Main({
  currentStep = 0
}: {
  currentStep: number
}): ReactElement {
  const data = useStaticQuery(onboardingMainQuery)
  const {
    steps
  }: {
    steps: OnboardingStep[]
  } = data.content.edges[0].node.childIndexJson

  return (
    <Container className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{steps?.[currentStep].title}</h3>
          <h5 className={styles.subtitle}>{steps?.[currentStep].subtitle}</h5>
        </div>
        <div className={styles.content}>
          <div className={styles.cardContainer}>
            <div className={styles.card}>
              <Markdown
                text={steps?.[currentStep].body}
                className={styles.paragraph}
              />
              <div className={styles.actions}>
                {steps && [currentStep] &&
                  steps[currentStep].cta.map((e, i) => (
                    <Button key={i} style="primary">
                      {e.ctaLabel}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
          {steps?.[currentStep]?.image && (
            <img
              src={steps?.[currentStep].image.childImageSharp.original.src}
              className={styles.image}
            />
          )}
        </div>
      </div>
    </Container>
  )
}
