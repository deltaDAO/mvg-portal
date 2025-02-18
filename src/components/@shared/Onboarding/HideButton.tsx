import { ReactElement } from 'react'
import Button from '../atoms/Button'
import styles from './HideButton.module.css'
import Tooltip from '../atoms/Tooltip'
import Markdown from '../Markdown'
import Cross from '@images/x-cross.svg'
import { useUserPreferences } from '@context/UserPreferences'
import content from '../../../../content/onboarding/index.json'

export default function HideButton(): ReactElement {
  const { setShowOnboardingModule } = useUserPreferences()

  return (
    <Tooltip content={<Markdown text={content.hideHint} />} placement="top">
      <Button
        className={styles.hideButton}
        style="text"
        onClick={() => setShowOnboardingModule(false)}
      >
        <Cross />
      </Button>
    </Tooltip>
  )
}
