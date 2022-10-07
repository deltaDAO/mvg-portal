import React, { ReactElement } from 'react'
import loadable from '@loadable/component'
import styles from './Copy.module.css'
import { ReactComponent as IconCopy } from '../../images/copy.svg'
import { toast } from 'react-toastify'

// lazy load when needed only, as library is a bit big
const Clipboard = loadable(() => import('react-clipboard.js'))

export default function Copy({ text }: { text: string }): ReactElement {
  return (
    <Clipboard
      data-clipboard-text={text}
      button-title="Copy to clipboard"
      onSuccess={() => toast.success('Copied to clipboard')}
      className={styles.button}
    >
      <IconCopy className={styles.icon} />
    </Clipboard>
  )
}
