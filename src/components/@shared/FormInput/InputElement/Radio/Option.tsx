import React from 'react'
import Button from '@components/@shared/atoms/Button'
import styles from './Option.module.css'

export default function Option({
  option,
  prefix,
  postfix,
  action
}: {
  option: string
  prefix?: string
  postfix?: string
  action?: string
}) {
  return (
    <>
      {prefix && `${prefix} `}
      {action ? (
        <Button
          to={action.startsWith('/') && action}
          href={!action.startsWith('/') && action}
          target="_blank"
          rel="noopener noreferrer"
          style="text"
          className={styles.actionButton}
        >
          {option}
        </Button>
      ) : (
        <>{option}</>
      )}
      {postfix && ` ${postfix}`}
    </>
  )
}
