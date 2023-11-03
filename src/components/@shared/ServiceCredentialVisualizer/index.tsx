import { ReactElement, useState } from 'react'
import Copy from '../atoms/Copy'
import Markdown from '../Markdown'
import VerifiedBadge from '../VerifiedBadge'
import styles from './index.module.css'
import Button from '../atoms/Button'
import Caret from '@images/caret.svg'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export default function ServiceCredentialVisualizer({
  text,
  title,
  collapsible,
  defaultExpanded = false,
  displayBadge,
  isValid,
  idMatch,
  apiVersion,
  copyText
}: {
  text: string
  title: string
  collapsible?: boolean
  defaultExpanded?: boolean
  displayBadge?: boolean
  isValid?: boolean
  idMatch?: boolean
  apiVersion?: string
  copyText?: string
}): ReactElement {
  const [open, setOpen] = useState(!!defaultExpanded)

  async function handleClick() {
    setOpen(!open)
  }

  return (
    <div className={cx({ container: true, open })}>
      <div className={styles.header}>
        <h5 className={styles.title}>
          <span>{title}</span>
          {collapsible && (
            <Button
              style="text"
              size="small"
              onClick={handleClick}
              className={styles.toggle}
            >
              <Caret />
            </Button>
          )}
        </h5>
        {displayBadge && (
          <VerifiedBadge
            isValid={isValid}
            idMatch={idMatch}
            apiVersion={apiVersion}
            timestamp
          />
        )}
      </div>
      <div className={styles.markdownContainer}>
        <Markdown text={text} />
        {copyText && (
          <div className={styles.copyContainer}>
            <Copy text={copyText} />
          </div>
        )}
      </div>
    </div>
  )
}
