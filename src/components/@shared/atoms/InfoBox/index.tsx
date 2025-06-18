import { ReactElement, ReactNode } from 'react'
import classNames from 'classnames/bind'
import styles from './index.module.css'

const cx = classNames.bind(styles)

export interface InfoBoxProps {
  children?: ReactNode
  title?: string
  subtitle?: string
  description?: string
  variant?: 'warning' | 'info'
  className?: string
}

export default function InfoBox({
  children,
  title,
  subtitle,
  description,
  variant = 'info',
  className
}: InfoBoxProps): ReactElement {
  const styleClasses = cx({
    infoBox: true,
    [variant]: true,
    [className]: className
  })

  return (
    <div className={styleClasses}>
      {title && subtitle && (
        <div className={styles.header}>
          <strong>{title}</strong> — <strong>{subtitle}</strong>
          {description && (
            <>
              <br />
              {description}
            </>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
