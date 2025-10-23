import { PropsWithChildren, ReactNode } from 'react'
import { Icon } from '../Icon'
import styles from './index.module.css'

function Sections({ children }: PropsWithChildren) {
  return <div className={styles.sections}>{children}</div>
}

function Section({
  icon,
  title,
  description,
  children
}: PropsWithChildren<{
  icon?: ReactNode
  title?: string
  description?: ReactNode
}>) {
  return (
    <section className={styles.section}>
      {title && (
        <span className={styles.sectionHeader}>
          {icon && <Icon isDark={false}>{icon}</Icon>}
          <span className={styles.sectionHeaderText}>
            <span className={styles.title}>{title}</span>
            <span className={styles.description}>{description}</span>
          </span>
        </span>
      )}
      <div className={styles.sectionContent}>{children}</div>
    </section>
  )
}

const Column = ({
  className,
  children
}: PropsWithChildren<{ className?: string }>) => (
  <div className={`${styles.column} ${className}`}>{children}</div>
)

Sections.Section = Section
Sections.Column = Column

export default Sections
