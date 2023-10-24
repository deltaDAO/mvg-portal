import { ReactNode, FormEvent, ReactElement } from 'react'
import Link from 'next/link'
import classNames from 'classnames/bind'
import styles from './index.module.css'

const cx = classNames.bind(styles)

export interface ButtonProps {
  children: ReactNode
  className?: string
  href?: string
  onClick?: (e: FormEvent) => void
  disabled?: boolean
  to?: string
  name?: string
  size?: 'small'
  style?: 'primary' | 'ghost' | 'text'
  type?: 'submit'
  download?: boolean
  target?: string
  rel?: string
  title?: string
  arrow?: boolean
}

export default function Button({
  href,
  children,
  className,
  to,
  size,
  style,
  arrow,
  ...props
}: ButtonProps): ReactElement {
  const styleClasses = cx({
    button: true,
    primary: style === 'primary',
    ghost: style === 'ghost',
    text: style === 'text',
    small: size === 'small',
    [className]: className
  })

  return to ? (
    <Link href={to} className={styleClasses} {...props}>
      {children}
      {arrow && <>&nbsp;&#8594;</>}
    </Link>
  ) : href ? (
    <a
      href={href}
      className={styleClasses}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
      &nbsp;&#8599;
    </a>
  ) : (
    <button className={styleClasses} {...props}>
      {children}
    </button>
  )
}
