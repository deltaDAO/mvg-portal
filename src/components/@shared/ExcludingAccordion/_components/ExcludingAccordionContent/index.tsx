import { useExcludingAccordion } from '@context/ExcludingAccordion'
import { forwardRef, type ReactNode } from 'react'

interface ExcludingAccordionContentProps {
  children: ReactNode
  index: number
}

export const ExcludingAccordionContent = forwardRef<
  HTMLDivElement,
  ExcludingAccordionContentProps
>(({ children, index }, ref) => {
  const { openIndex } = useExcludingAccordion()
  const isOpen = openIndex === index

  return <div ref={ref}>{isOpen && <>{children}</>}</div>
})
ExcludingAccordionContent.displayName = 'ExcludingAccordionContent'
