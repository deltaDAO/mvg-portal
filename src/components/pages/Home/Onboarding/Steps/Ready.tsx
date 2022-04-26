import React, { ReactElement } from 'react'
import styles from './Ready.module.css'
import SuccessConfetti from '../../../../atoms/SuccessConfetti'
import { graphql, useStaticQuery } from 'gatsby'

const query = graphql`
  query ReadyQuery {
    file(relativePath: { eq: "pages/index/onboarding/steps/ready.json" }) {
      childStepsJson {
        title
        body
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
  image: {
    childImageSharp: { original: { src: string } }
  }
}

export default function Ready(): ReactElement {
  const data = useStaticQuery(query)
  const { title, body, image }: ReadyStep = data.file.childStepsJson

  return (
    <div className={styles.container}>
      <SuccessConfetti success={body} className={styles.body} />
      <img src={image.childImageSharp.original.src} className={styles.image} />
      <div className={styles.footer}>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </div>
  )
}
