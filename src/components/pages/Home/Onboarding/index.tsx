import React, { ReactElement, useState } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import styles from './index.module.css'
import Header from './Header'
import Main from './Main'
import Navigation from './Navigation'
import Container from '../../../atoms/Container'

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

export interface OnboardingStep {
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

export default function OnboardingSection(): ReactElement {
  const data = useStaticQuery(onboardingMainQuery)
  const {
    steps
  }: {
    steps: OnboardingStep[]
  } = data.content.edges[0].node.childIndexJson

  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className={styles.wrapper}>
      <Header />
      {steps.length > 0 && (
        <Container className={styles.cardWrapper}>
          <div className={styles.cardContainer}>
            <Main currentStep={currentStep} steps={steps} />
            <Navigation
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              totalStepCount={steps?.length}
            />
          </div>
        </Container>
      )}
    </div>
  )
}
