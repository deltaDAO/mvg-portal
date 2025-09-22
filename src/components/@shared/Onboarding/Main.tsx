import { ReactElement, useEffect } from 'react'
import { animated, useSpringRef, useTransition } from 'react-spring'
import styles from './Main.module.css'

const translateMovements = {
  fromTranslateLeft: 'translate3d(-100%,-50%,0)',
  fromTranslateRight: 'translate3d(100%,-50%,0)',
  leaveTranslateLeft: 'translate3d(50%,-50%,0)',
  leaveTranslateRight: 'translate3d(-50%,-50%,0)',
  startPosition: 'translate3d(0%,-50%,0)'
}

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
  const {
    fromTranslateLeft,
    fromTranslateRight,
    leaveTranslateLeft,
    leaveTranslateRight,
    startPosition
  } = translateMovements

  const transRef = useSpringRef()
  const moveAndFadeDiv = useTransition(currentStep, {
    ref: transRef,
    keys: null,
    initial: { opacity: 1, transform: startPosition },
    from: {
      opacity: 0,
      transform:
        navigationDirection === 'prev' ? fromTranslateLeft : fromTranslateRight
    },
    enter: { opacity: 1, transform: startPosition },
    leave: {
      opacity: 0,
      transform:
        navigationDirection === 'prev'
          ? leaveTranslateLeft
          : leaveTranslateRight
    },
    config: { mass: 1, tension: 140, friction: 18 }
  })
  useEffect(() => {
    transRef.start()
  }, [currentStep])

  return (
    <div className={styles.container}>
      {moveAndFadeDiv((style, i) => (
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
