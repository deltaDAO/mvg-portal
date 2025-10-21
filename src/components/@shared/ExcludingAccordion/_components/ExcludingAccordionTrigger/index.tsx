import { useExcludingAccordion } from '@context/ExcludingAccordion'
import Caret from '@images/caret.svg'
import { forwardRef, type ReactNode } from 'react'
import styles from './index.module.css'

interface ExcludingAccordionTriggerProps {
  children: ReactNode
  index: number
  openCallback?: () => void
}

export const ExcludingAccordionTrigger = forwardRef<
  HTMLElement,
  ExcludingAccordionTriggerProps
>(({ children, index, openCallback }, ref) => {
  const { openIndex, triggerCallback } = useExcludingAccordion()
  const isOpen = openIndex === index

  const clickCallback = () => {
    triggerCallback(index)

    !isOpen && openCallback && openCallback()
  }

  return (
    <span ref={ref} className={styles.trigger} onClick={clickCallback}>
      <Caret className={isOpen ? styles.openCaret : styles.closedCaret} />
      <div>{children}</div>
    </span>
  )
})

ExcludingAccordionTrigger.displayName = 'ExcludingAccordionTrigger'
