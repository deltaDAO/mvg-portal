import { ReactElement } from 'react'
import styles from './index.module.css'

export default function DebugOutput({
  title,
  output,
  large
}: {
  title?: string
  output: any
  large?: boolean
}): ReactElement {
  return (
    <div className={styles.debugOutput}>
      {title && <h5>{title}</h5>}
      <pre className={large ? styles.large : ''}>
        <code>{JSON.stringify(output, null, 2)}</code>
      </pre>
    </div>
  )
}
