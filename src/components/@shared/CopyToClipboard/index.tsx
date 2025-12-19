import { ReactElement, useCallback, useEffect, useState } from 'react'
import styles from './index.module.css'

type CopyToClipboardProps = {
  value: string
  truncate?: number
  className?: string
  textClassName?: string
  showCopyButton?: boolean
  copyButtonLabel?: string
}

const truncateMiddle = (value: string, visible = 6) => {
  if (!value || value.length <= visible * 2) return value
  return `${value.slice(0, visible)}...${value.slice(-visible)}`
}

export function CopyToClipboard({
  value,
  truncate = 6,
  className,
  textClassName,
  showCopyButton = false,
  copyButtonLabel = 'Copy'
}: CopyToClipboardProps): ReactElement {
  const [copied, setCopied] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timer])

  const handleCopy = useCallback(async () => {
    if (!navigator?.clipboard?.writeText) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      const timeout = setTimeout(() => setCopied(false), 1500)
      setTimer(timeout)
    } catch (error) {
      console.warn('Copy to clipboard failed', error)
    }
  }, [value])

  const displayText = truncateMiddle(value, truncate)

  return (
    <div className={`${styles.root} ${className || ''}`}>
      <button
        type="button"
        className={`${styles.textButton} ${textClassName || ''}`}
        onClick={handleCopy}
        title="Copy"
      >
        <span className={styles.text}>{displayText}</span>
      </button>
      {showCopyButton && (
        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopy}
        >
          {copyButtonLabel}
        </button>
      )}
      {copied && (
        <span className={styles.badge}>
          <span>Copied!</span>
          <svg className={styles.spinner} viewBox="0 0 24 24">
            <circle className={styles.circle} cx="12" cy="12" r="10" />
          </svg>
        </span>
      )}
    </div>
  )
}
