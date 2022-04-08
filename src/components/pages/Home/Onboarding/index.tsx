import React, { ReactElement } from 'react'
import styles from './index.module.css'
import Header from './Header'
import Main from './Main'

export default function OnboardingSection(): ReactElement {
  return (
    <div className={styles.wrapper}>
      <Header />
      <Main />
    </div>
  )
}
