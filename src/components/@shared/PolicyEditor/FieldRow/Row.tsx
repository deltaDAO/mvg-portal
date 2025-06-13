import { ReactElement, ReactNode } from 'react'
import styles from './Row.module.css'

interface FieldRowProps {
  children: ReactNode
}

export default function FieldRow({ children }: FieldRowProps): ReactElement {
  return <div className={styles.row}>{children}</div>
}
