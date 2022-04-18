import React, { ReactElement, useEffect } from 'react'
import classNames from 'classnames/bind'
import { animated, useSpringRef, useTransition } from 'react-spring'
import styles from './Main.module.css'

const cx = classNames.bind(styles)

export default function Main({
  currentStep,
  navigationDirection,
  steps
}: {
  currentStep: number
  navigationDirection: 'prev' | 'next'
  steps: {
    shortLabel: string
    component: ReactElement
  }[]
}): ReactElement {
  const transRef = useSpringRef()
  const transitions = useTransition(currentStep, {
    ref: transRef,
    keys: null,
    initial: { opacity: 1, transform: 'translate3d(0%,-50%,0)' },
    from: {
      opacity: 0,
      transform: `translate3d(${
        navigationDirection === 'prev' ? '-100%' : '100%'
      },-50%,0)`
    },
    enter: { opacity: 1, transform: 'translate3d(0%,-50%,0)' },
    leave: {
      opacity: 0,
      transform: `translate3d(${
        navigationDirection === 'prev' ? '50%' : '-50%'
      },-50%,0)`
    }
  })
  useEffect(() => {
    transRef.start()
  }, [currentStep])

  return (
    <div className={styles.container}>
      {transitions((style, i) => (
        <animated.div
          key={steps[i].shortLabel}
          style={style}
          className={cx({ step: true, active: currentStep === i })}
        >
          {steps[i].component}
        </animated.div>
      ))}
    </div>
  )
}
