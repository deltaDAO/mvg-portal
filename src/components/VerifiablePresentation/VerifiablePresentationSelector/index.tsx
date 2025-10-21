import Caret from '@images/caret.svg'
import { Dispatch, SetStateAction, useCallback } from 'react'
import styles from './index.module.css'

interface VerifiablePresentationSelectorProps {
  selected: number
  setSelected: Dispatch<SetStateAction<number>>
  max: number
}

export const VerifiablePresentationSelector = ({
  selected,
  setSelected,
  max
}: Readonly<VerifiablePresentationSelectorProps>) => {
  const isLeftDisabled = selected === 0
  const isRightDisabled = selected === max - 1

  const changeVP = useCallback(
    (amount: number) => {
      if (amount > 0 && isRightDisabled) return
      if (amount < 0 && isLeftDisabled) return
      setSelected((prev) => prev + amount)
    },
    [isLeftDisabled, isRightDisabled, setSelected]
  )

  const handleLeft = useCallback(() => changeVP(-1), [changeVP])
  const handleRight = useCallback(() => changeVP(1), [changeVP])

  const renderButton = useCallback(
    (onClick: () => void, actionClass: string, isDisabled: boolean) => (
      <button
        onClick={onClick}
        className={`${styles.action} ${actionClass} ${
          isDisabled ? styles.disabled : ''
        }`}
      >
        <Caret />
      </button>
    ),
    []
  )

  return (
    <span className={styles.actions}>
      {renderButton(handleLeft, styles.leftAction, isLeftDisabled)}
      {selected + 1} / {max}
      {renderButton(handleRight, styles.rightAction, isRightDisabled)}
    </span>
  )
}
