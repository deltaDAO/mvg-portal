import { ReactElement, ReactNode, useState } from 'react'
import Button from '@shared/atoms/Button'
import styles from './History.module.css'
import EyeOpen from '@images/eye.svg'
import EyeClosed from '@images/eye-disabled.svg'

export default function ComputeHistory({
  title,
  children,
  refetchJobs
}: {
  title: string
  children: ReactNode
  refetchJobs?: React.Dispatch<React.SetStateAction<boolean>>
}): ReactElement {
  const [open, setOpen] = useState(false)

  async function handleClick() {
    await refetchJobs(true)
    setOpen(!open)
  }

  return (
    <div className={`${styles.actions} ${open === true ? styles.open : ''}`}>
      {/* TODO: onClick on h3 is nasty but we're in a hurry */}
      <h3 className={styles.title} onClick={handleClick}>
        {`${title} `}
        <Button
          style="text"
          size="small"
          onClick={handleClick}
          className={styles.toggle}
        >
          {open ? (
            <>
              <EyeClosed /> Hide
            </>
          ) : (
            <>
              <EyeOpen /> Show
            </>
          )}
        </Button>
      </h3>
      {open === true && children}
    </div>
  )
}
