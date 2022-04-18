import React, { ReactElement } from 'react'
import styles from './Stepper.module.css'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export default function Stepper({
  stepLabels,
  currentStep
}: {
  stepLabels: string[]
  currentStep: number
}): ReactElement {
  return (
    <div>
      <ol className={styles.stepper}>
        {stepLabels.map((label, i) => (
          <li
            key={i}
            className={cx({
              step: true,
              active: i <= currentStep
            })}
          >
            <h4 className={styles.title}>{label}</h4>
          </li>
        ))}
      </ol>
    </div>
  )
}
