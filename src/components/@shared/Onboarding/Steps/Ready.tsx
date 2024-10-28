import { ReactElement } from 'react'
import styles from './Ready.module.css'
import content from '../../../../../content/onboarding/steps/ready.json'
import SuccessConfetti from '@components/@shared/SuccessConfetti'
import Button from '@shared/atoms/Button'
import { useUserPreferences } from '@context/UserPreferences'

interface ReadyStep {
  title: string
  body: string
  image: string
}

export default function Ready(): ReactElement {
  const { title, body, image }: ReadyStep = content
  const { showOnboardingModule, setShowOnboardingModule } = useUserPreferences()

  return (
    <div className={styles.container}>
      <SuccessConfetti success={body} className={styles.body} />
      <img src={image} className={styles.image} />
      <div className={styles.footer}>
        <h5 className={styles.title}>{title}</h5>
      </div>
      <Button
        style="primary"
        className={styles.body}
        onClick={() => setShowOnboardingModule(!showOnboardingModule)}
      >
        {'Hide Onboarding Guide'}
      </Button>
      <p className={styles.footer}>
        You can show again this onboarding tutorial using the configuration menu
        in the upper-right corner.
      </p>
    </div>
  )
}
