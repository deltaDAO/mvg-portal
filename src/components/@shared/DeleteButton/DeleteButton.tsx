import { ReactElement } from 'react'
import Button from '../atoms/Button'
import DeleteIcon from '@images/delete.svg'
import styles from './DeleteButton.module.css'

interface DeleteButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
}

export default function DeleteButton({
  onClick,
  disabled = false,
  className = ''
}: DeleteButtonProps): ReactElement {
  return (
    <Button
      type="button"
      style="ghost"
      onClick={onClick}
      disabled={disabled}
      className={`${styles.deleteButton} ${className}`}
    >
      <DeleteIcon />
      Delete
    </Button>
  )
}
