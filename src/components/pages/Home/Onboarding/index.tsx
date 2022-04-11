import React, { ReactElement, useEffect, useState } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import styles from './index.module.css'
import Header from './Header'
import Main from './Main'
import Navigation from './Navigation'
import Container from '../../../atoms/Container'
import Stepper from './Stepper'

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

export interface CurrentStepStatus {
  [key: string]: {
    loading: boolean
    completed: boolean
  }
}

export default function OnboardingSection(): ReactElement {
  const data = useStaticQuery(onboardingMainQuery)
  const {
    steps
  }: {
    steps: OnboardingStep[]
  } = data.content.edges[0].node.childIndexJson
  const stepLabels = steps?.map((step) => step.shortLabel)

  const [currentStep, setCurrentStep] = useState(0)
  const [currentStepStatus, setCurrentStepStatus] =
    useState<CurrentStepStatus>()

  useEffect(() => {
    if (steps.length === 0) return
    const status: CurrentStepStatus = {}
    steps[currentStep].cta.forEach(
      (action) =>
        (status[action.ctaAction] = { loading: false, completed: false })
    )
    console.log(status)
  }, [steps, currentStep])

  return (
    <div className={styles.wrapper}>
      <Header />
      {steps.length > 0 && (
        <Container className={styles.cardWrapper}>
          <div className={styles.cardContainer}>
            <Stepper stepLabels={stepLabels} currentStep={currentStep} />
            <Main
              currentStep={currentStep}
              currentStepStatus={currentStepStatus}
              setCurrentStepStatus={setCurrentStepStatus}
              steps={steps}
            />
            <Navigation
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              totalStepsCount={steps?.length}
            />
          </div>
        </Container>
      )}
    </div>
  )
}
