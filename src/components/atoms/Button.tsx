import React, { ReactNode, FormEvent, ReactElement } from 'react'
import { Link } from 'gatsby'
import classNames from 'classnames/bind'
import styles from './Button.module.css'
import { ReactComponent as Arrow } from '../../images/arrow.svg'

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
  style?: 'primary' | 'ghost' | 'outline' | 'text'
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
    outline: style === 'outline',
    text: style === 'text',
    small: size === 'small',
    arrow,
    [className]: className
  })

  return to ? (
    <Link to={to} className={styleClasses} {...props}>
      {children}
      {arrow && (
        <>
          &nbsp; <Arrow fill="currentColor" />
        </>
      )}
    </Link>
  ) : href ? (
    <a href={href} className={styleClasses} {...props}>
      {children}
      {arrow && (
        <>
          &nbsp; <Arrow fill="currentColor" />{' '}
        </>
      )}
    </a>
  ) : (
    <button className={styleClasses} {...props}>
      {children}
    </button>
  )
}
