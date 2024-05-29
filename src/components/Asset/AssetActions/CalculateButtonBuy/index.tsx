import { FormEvent, ReactElement } from 'react'
import Button from '../../../@shared/atoms/Button'
import styles from './index.module.css'
import Loader from '../../../@shared/atoms/Loader'

export interface CalculateButtonBuyProps {
  isLoading?: boolean
  onClick?: (e: FormEvent<HTMLButtonElement>) => void
  stepText?: string
  type?: 'submit'
}

export default function CalculateButtonBuy({
  onClick,
  stepText,
  isLoading,
  type
}: CalculateButtonBuyProps): ReactElement {
  return (
    <div className={styles.actions}>
      {isLoading ? (
        <Loader message={stepText} />
      ) : (
        <Button style="primary" type={type} onClick={onClick}>
          Calculate Total Price
        </Button>
      )}
    </div>
  )
}
