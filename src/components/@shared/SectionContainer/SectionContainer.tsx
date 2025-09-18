import { ReactElement, ReactNode } from 'react'
import styles from './SectionContainer.module.css'
import Tooltip from '@shared/atoms/Tooltip'
import Markdown from '@shared/Markdown'

interface SectionContainerProps {
  title?: string
  children: ReactNode
  className?: string
  required?: boolean
  gap?: string
  help?: string
  variant?: 'default' | 'large' | 'publish'
  border?: boolean
  padding?: string
}

export default function SectionContainer({
  title,
  children,
  className,
  required = false,
  gap,
  help,
  variant = 'default',
  border = false,
  padding
}: SectionContainerProps): ReactElement {
  const containerClass = [
    styles.container,
    variant && styles[variant],
    border && styles.border,
    title && styles.borderNavy
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClass}>
      {title && (
        <div className={styles.label}>
          {title}
          {required && <span className={styles.required}>*</span>}
          {help && <Tooltip content={<Markdown text={help} />} />}
        </div>
      )}
      <div
        className={`${styles.content} ${className}`}
        style={{
          gap: gap || undefined,
          padding: padding || undefined
        }}
      >
        {children}
      </div>
    </div>
  )
}
