import { ReactElement, ReactNode } from 'react'
import classNames from 'classnames/bind'
import styles from './index.module.css'
import WarningSVG from '@images/warning.svg'

const cx = classNames.bind(styles)

export interface InfoBoxProps {
  children?: ReactNode
  title?: string
  subtitle?: string
  description?: string
  className?: string
}

export default function InfoBox({
  children,
  title,
  subtitle,
  description,
  className
}: InfoBoxProps): ReactElement {
  return (
    <div className={cx(styles.infoBox, className)}>
      <div className={styles.root}>
        <WarningSVG width={22} height={22} className={styles.warningIcon} />
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
    </div>
  )
}
