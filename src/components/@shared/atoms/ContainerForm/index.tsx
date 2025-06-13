import { ReactElement, ReactNode } from 'react'
import classNames from 'classnames/bind'
import styles from './index.module.css'

const cx = classNames.bind(styles)

export interface ContainerFormProps {
  children: ReactNode
  title?: string
  className?: string
  style?: 'default' | 'large' | 'publish'
  border?: boolean
  gap?: string
}

export default function ContainerForm({
  children,
  title,
  className,
  style = 'default',
  border = false,
  gap
}: ContainerFormProps): ReactElement {
  const styleClasses = cx({
    container: true,
    large: style === 'large',
    publish: style === 'publish',
    border,
    [className]: className
  })

  return (
    <div className={styleClasses} style={gap ? { gap } : undefined}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </div>
  )
}
