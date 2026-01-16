import { ReactElement } from 'react'
import styles from './Ready.module.css'
import content from '../../../../../content/onboarding/steps/ready.json'
import SuccessConfetti from '@components/@shared/SuccessConfetti'
import Button from '@components/@shared/atoms/Button'

interface ReadyStep {
  learnMore: {
    text: string
    link: string
    linkLabel: string
  }
  title: string
  body: string
  image: string
}

export default function Ready(): ReactElement {
  const { learnMore, title, body, image }: ReadyStep = content

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <SuccessConfetti success={body} className={styles.body} />
        <div className={styles.learnMore}>
          <span>{learnMore.text}</span>
          <Button
            style="primary"
            href={learnMore.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {learnMore.linkLabel}
          </Button>
        </div>
      </div>
      <img src={image} className={styles.image} />
      <div className={styles.footer}>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </div>
  )
}
