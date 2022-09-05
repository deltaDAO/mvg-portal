import React, { ReactElement } from 'react'
import styles from './Ready.module.css'
import SuccessConfetti from '../../../../atoms/SuccessConfetti'
import { graphql, useStaticQuery } from 'gatsby'
import Button from '../../../../atoms/Button'
import { useUserPreferences } from '../../../../../providers/UserPreferences'

const query = graphql`
  query ReadyQuery {
    file(relativePath: { eq: "pages/index/onboarding/steps/ready.json" }) {
      childStepsJson {
        title
        body
        hideTutorial
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
`

interface ReadyStep {
  title: string
  body: string
  hideTutorial: string
  image: {
    childImageSharp: { original: { src: string } }
  }
}

export default function Ready(): ReactElement {
  const data = useStaticQuery(query)
  const { title, body, hideTutorial, image }: ReadyStep =
    data.file.childStepsJson
  const { setShowOnboardingModule } = useUserPreferences()

  return (
    <div className={styles.container}>
      <SuccessConfetti success={body} className={styles.body} />
      <img src={image.childImageSharp.original.src} className={styles.image} />
      <div className={styles.footer}>
        <h3 className={styles.title}>{title}</h3>
        <Button style="text" onClick={() => setShowOnboardingModule(false)}>
          {hideTutorial}
        </Button>
      </div>
    </div>
  )
}
