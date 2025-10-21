import { useVerifiablePresentationContext } from '@context/VerifiablePresentation'
import Info from '@images/info.svg'
import Cross from '@images/x-cross.svg'
import classNames from 'classnames/bind'
import { type ReactNode } from 'react'
import styles from './index.module.css'

const cx = classNames.bind(styles)

type Variants = 'info' | 'warn'
interface VerifiablePresentationMessageProps {
  variant: Variants
  children?: ReactNode
}

export const VerifiablePresentationMessage = ({
  variant,
  children
}: Readonly<VerifiablePresentationMessageProps>) => {
  useVerifiablePresentationContext()

  const styleClasses = cx({
    base: true,
    info: variant === 'info',
    warn: variant === 'warn'
  })

  return (
    <div className={styleClasses}>
      {variant === 'info' ? <Info /> : <Cross />}
      <div className={styles.contents}>{children}</div>
    </div>
  )
}
