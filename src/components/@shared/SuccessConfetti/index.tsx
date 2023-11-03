import { ReactElement, ReactNode, useEffect } from 'react'
import { confetti } from 'dom-confetti'
import Alert from '@shared/atoms/Alert'
import styles from './index.module.css'

const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: '10px',
  height: '10px',
  perspective: '500px',
  colors: [
    'var(--confetti-color-one)',
    'var(--confetti-color-two)',
    'var(--confetti-color-three)',
    'var(--confetti-color-four)',
    'var(--confetti-color-five)'
  ]
}

export default function SuccessConfetti({
  success,
  action,
  className
}: {
  success: string
  action?: ReactNode
  className?: string
}): ReactElement {
  // Have some confetti upon success
  useEffect(() => {
    if (!success || typeof window === 'undefined') return

    const startElement: HTMLElement = document.querySelector(
      'span[data-confetti]'
    )
    confetti(startElement, confettiConfig)
  }, [success])

  return (
    <div className={className || null}>
      <Alert text={success} state="success" />
      <span className={styles.action} data-confetti>
        {action}
      </span>
    </div>
  )
}
