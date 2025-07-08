import { ReactElement } from 'react'
import styles from './index.module.css'

export default function DebugOutput({
  title,
  output
}: {
  title?: string
  output: any
}): ReactElement {
  return (
    <div className={styles.debugOutput}>
      {title && <h5>{title}</h5>}
      <pre>
        <code>{JSON.stringify(output, null, 2)}</code>
      </pre>
    </div>
  )
}
