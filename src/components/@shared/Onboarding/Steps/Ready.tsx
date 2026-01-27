import { ReactElement } from 'react'
import styles from './Ready.module.css'
import content from '../../../../../content/onboarding/steps/ready.json'
import SuccessConfetti from '@components/@shared/SuccessConfetti'
import Button from '@components/@shared/atoms/Button'

interface ReadyStep {
  buttons: {
    text: string
    link: string
    linkLabel: string
  }[]
  title: string
  body: string
  image: string
}

export default function Ready(): ReactElement {
  const { buttons, title, body, image }: ReadyStep = content

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <SuccessConfetti success={body} className={styles.body} />
        <div className={styles.learnMore}>
          {buttons.map((button, index) => (
            <div key={index}>
              <span>{button.text}</span>
              <Button
                style="primary"
                href={button.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {button.linkLabel}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <img src={image} className={styles.image} />
      <div className={styles.footer}>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </div>
  )
}
