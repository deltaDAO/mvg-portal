import { ReactElement, useEffect, useRef, ReactNode } from 'react'
import styles from './index.module.css'

interface StickySidebarLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export default function StickySidebarLayout({
  sidebar,
  children
}: StickySidebarLayoutProps): ReactElement {
  const sidebarRef = useRef<HTMLElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateSidebarLimit = () => {
      if (sidebarRef.current && mainContentRef.current) {
        const mainContentRect = mainContentRef.current.getBoundingClientRect()
        const mainContentBottom = mainContentRect.bottom + window.scrollY
        const sidebarHeight = sidebarRef.current.offsetHeight
        const topOffset = 20
        const currentScroll = window.scrollY

        const contentBottom = mainContentBottom
        const sidebarBottomWhenSticky =
          currentScroll + topOffset + sidebarHeight

        if (sidebarBottomWhenSticky > contentBottom) {
          const maxTop = contentBottom - sidebarHeight
          const adjustedTop = Math.max(topOffset, maxTop - currentScroll)
          sidebarRef.current.style.top = `${adjustedTop}px`
        } else {
          sidebarRef.current.style.top = '20px'
        }
      }
    }

    const timeoutId = setTimeout(updateSidebarLimit, 500)

    let ticking = false
    const handleUpdate = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateSidebarLimit()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleUpdate, { passive: true })
    window.addEventListener('resize', handleUpdate, { passive: true })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', handleUpdate)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [children])

  return (
    <div className={styles.layout}>
      <aside ref={sidebarRef} className={styles.sidebar}>
        {sidebar}
      </aside>
      <div ref={mainContentRef} className={styles.mainContent}>
        {children}
      </div>
    </div>
  )
}
