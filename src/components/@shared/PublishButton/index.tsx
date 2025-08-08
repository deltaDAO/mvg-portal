import { ReactElement, ButtonHTMLAttributes } from 'react'
import styles from './index.module.css'
import AddParamIcon from '@images/add_param.svg'
import ValidateIcon from '@images/validate.svg'
import Button from '@shared/atoms/Button'

export type IconType = 'add' | 'validate' | 'none'
export type StyleType = 'gradient' | 'primary'

export interface PublishButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'type'> {
  icon?: IconType
  text: string
  buttonStyle: StyleType
  className?: string
  type?: 'submit' | 'button'
}

export default function PublishButton({
  icon = 'none',
  text,
  buttonStyle,
  className,
  ...props
}: PublishButtonProps): ReactElement {
  const getIcon = () => {
    switch (icon) {
      case 'add':
        return <AddParamIcon className={styles.icon} />
      case 'validate':
        return <ValidateIcon className={styles.icon} />
      default:
        return null
    }
  }

  const mappedButtonStyle = buttonStyle === 'gradient' ? 'gradient' : 'publish'

  return (
    <Button
      style={mappedButtonStyle}
      className={`${styles.publishButton} ${className || ''}`}
      {...props}
    >
      {getIcon()}
      <span className={styles.text}>{text}</span>
    </Button>
  )
}
