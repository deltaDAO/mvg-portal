import React, { ReactElement, useEffect } from 'react'
import { animated, useSpringRef, useTransition } from 'react-spring'
import styles from './Main.module.css'

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
    initial: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    from: {
      opacity: 0,
      transform: `translate3d(${
        navigationDirection === 'prev' ? '-100%' : '100%'
      },0,0)`
    },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: {
      opacity: 0,
      transform: `translate3d(${
        navigationDirection === 'prev' ? '50%' : '-50%'
      },0,0)`
    },
    config: { mass: 1, tension: 140, friction: 18 }
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
          className={styles.step}
        >
          {steps[i].component}
        </animated.div>
      ))}
    </div>
  )
}
