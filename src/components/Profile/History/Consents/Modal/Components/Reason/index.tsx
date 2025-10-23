import { PropsWithChildren } from 'react'
import styles from './index.module.css'

function Reason({ children }: PropsWithChildren) {
  if (!children) return <></>

  return <span className={styles.reason}>{children}</span>
}

export default Reason
