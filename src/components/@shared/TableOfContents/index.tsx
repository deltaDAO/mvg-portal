import { ReactElement, useEffect, useState } from 'react'
import { Heading } from '@utils/extractHeadings'
import styles from './index.module.css'

interface TableOfContentsProps {
  headings: Heading[]
}

export default function TableOfContents({
  headings
}: TableOfContentsProps): ReactElement {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let scrollHandler: (() => void) | null = null
    let resizeHandler: (() => void) | null = null
    let lastActiveId = ''

    const initObserver = () => {
      const headingElements = headings
        .map((heading) => {
          const element = document.getElementById(heading.id)
          return element ? { id: heading.id, element } : null
        })
        .filter(
          (item): item is { id: string; element: HTMLElement } => item !== null
        )

      if (headingElements.length === 0) {
        timeoutId = setTimeout(initObserver, 100)
        return
      }

      const updateActiveHeading = () => {
        const scrollOffset = 150
        const scrollPosition = window.scrollY + scrollOffset

        let activeHeading = headingElements[0]?.id || ''

        for (let i = headingElements.length - 1; i >= 0; i--) {
          const { element } = headingElements[i]
          if (!element) continue

          const rect = element.getBoundingClientRect()
          const elementTop = window.scrollY + rect.top

          if (elementTop <= scrollPosition) {
            activeHeading = headingElements[i].id
            break
          }
        }

        if (activeHeading && activeHeading !== lastActiveId) {
          lastActiveId = activeHeading
          setActiveId(activeHeading)
        }
      }

      setTimeout(() => {
        updateActiveHeading()
      }, 300)

      let lastScrollTime = 0
      scrollHandler = () => {
        const now = Date.now()
        if (now - lastScrollTime >= 100) {
          lastScrollTime = now
          updateActiveHeading()
        }
      }

      resizeHandler = () => {
        updateActiveHeading()
      }

      window.addEventListener('scroll', scrollHandler, { passive: true })
      window.addEventListener('resize', resizeHandler, { passive: true })
    }

    initObserver()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler)
      }
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler)
      }
    }
  }, [headings])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (headings.length === 0) {
    return <></>
  }

  return (
    <nav className={styles.container}>
      <div className={styles.sticky}>
        <h3 className={styles.title}>Contents</h3>
        <ul className={styles.list}>
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`${styles.item} ${styles[`level${heading.level}`]} ${
                activeId === heading.id ? styles.active : ''
              }`}
            >
              <a
                href={`#${heading.id}`}
                className={styles.link}
                onClick={(e) => {
                  e.preventDefault()
                  handleClick(heading.id)
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
