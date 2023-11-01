import { useUserPreferences } from '@context/UserPreferences'
import { ReactElement } from 'react'
import Alert from '../atoms/Alert'
import styles from './index.module.css'

export default function ExternalContentWarning(): ReactElement {
  const { setAllowExternalContent } = useUserPreferences()

  return (
    <Alert
      state="warning"
      title="External content not allowed"
      text="The asset description may include content from external sources. Do you want to allow it?"
      action={{
        name: 'Allow',
        style: 'primary',
        handleAction: () => setAllowExternalContent(true)
      }}
      className={styles.externalContentAlert}
    />
  )
}
