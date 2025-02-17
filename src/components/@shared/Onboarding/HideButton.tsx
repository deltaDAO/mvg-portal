import { ReactElement } from 'react'
import Button from '../atoms/Button'
import styles from './HideButton.module.css'
import Tooltip from '../atoms/Tooltip'
import Markdown from '../Markdown'
import Cross from '@images/x-cross.svg'

export default function HideButton({
  setShowOnboardingModule,
  hintText
}: {
  setShowOnboardingModule: (value: boolean) => void
  hintText: string
}): ReactElement {
  return (
    <Tooltip content={<Markdown text={hintText} />} placement="top">
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
