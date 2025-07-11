import { ReactElement, ReactNode, FormEvent } from 'react'
import classNames from 'classnames/bind'
import styles from './index.module.css'
import Button from '../Button'
import Markdown from '../../Markdown'
import WarningSVG from '@images/warning.svg'

const cx = classNames.bind(styles)

export interface AlertProps {
  children?: ReactNode
  title?: string
  subtitle?: string
  description?: string
  className?: string
  warning?: boolean
  state?: 'error' | 'warning' | 'info' | 'success'
  badge?: string
  text?: string
  action?: {
    name: string
    style?: 'text' | 'primary' | 'ghost'
    disabled?: boolean
    handleAction: (e: FormEvent<HTMLButtonElement>) => void
  }
  onDismiss?: () => void
}

export default function Alert({
  children,
  title,
  subtitle,
  description,
  className,
  warning = false,
  state = 'info',
  badge,
  text,
  action,
  onDismiss
}: AlertProps): ReactElement {
  const finalState = state

  return (
    <div className={cx(styles.infoBox, styles[finalState], className)}>
      <div className={styles.root}>
        {warning && (
          <WarningSVG width={22} height={22} className={styles.warningIcon} />
        )}

        <div>
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

          {title && !subtitle && (
            <>
              <div>
                <strong>{title}</strong>
                {badge && ` — ${badge}`}
              </div>
              {text && <Markdown text={text} />}
            </>
          )}

          {!title && text && <Markdown text={text} />}

          {children}
        </div>
      </div>

      {action && (
        <Button
          className={styles.action}
          size="small"
          style={action.style || 'primary'}
          onClick={action.handleAction}
          disabled={action.disabled}
        >
          {action.name}
        </Button>
      )}
      {onDismiss && (
        <button className={styles.close} onClick={onDismiss}>
          &times;
        </button>
      )}
    </div>
  )
}
