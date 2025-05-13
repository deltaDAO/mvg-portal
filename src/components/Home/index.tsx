import { ReactElement } from 'react'
import Hero from './Hero'
import ChooseRole from './ChooseRole'
import WhatWeDo from './WhatWeDo'
import Pillars from './Pillars'
import ContactAndOnboarding from './Contact'
import FAQ from './FAQ'
import styles from './home.module.css'

export default function Home(): ReactElement {
  return (
    <main className={styles.home}>
      <Hero />
      <ChooseRole />
      <WhatWeDo />
      <Pillars />
      <FAQ />
      <ContactAndOnboarding />
    </main>
  )
}
