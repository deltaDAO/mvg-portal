import { ReactElement } from 'react'
import styles from './Ready.module.css'
import content from '../../../../../content/onboarding/steps/ready.json'
import SuccessConfetti from '@components/@shared/SuccessConfetti'

interface ReadyStep {
  title: string
  body: string
  image: string
}

export default function Ready(): ReactElement {
  const { title, body, image }: ReadyStep = content

  return (
    <div className={styles.container}>
      <SuccessConfetti success={body} className={styles.body} />
      <img src={image} className={styles.image} />
      <div className={styles.footer}>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </div>
  )
}
