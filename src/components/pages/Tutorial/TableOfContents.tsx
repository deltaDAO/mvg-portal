import React, { ReactElement, useState } from 'react'
import Hamburger from 'hamburger-react'
import { TutorialChapterProps } from '../../molecules/TutorialChapter'
import styles from './TableOfContents.module.css'
import TableOfContentLink from './TableOfContentLink'

export default function TableOfContents({
  chapters
}: {
  chapters: TutorialChapterProps[]
}): ReactElement {
  const [isOpen, setOpen] = useState(false)
  const handleBurgerClose = () => {
    if (isOpen) setOpen(false)
  }
  return (
    <>
      <div className={styles.hamburger}>
        <Hamburger toggled={isOpen} toggle={setOpen} />
        <div className={`${styles.toc} ${isOpen && styles.open}`}>
          {isOpen && (
            <>
              <h3>Table of contents</h3>
              <ul>
                {chapters.map((chapter, i) => (
                  <li key={i}>
                    <TableOfContentLink
                      chapter={chapter}
                      onClick={handleBurgerClose}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      <div className={styles.tocDesktop}>
        <h3>Table of contents</h3>
        <ul>
          {chapters.map((chapter, i) => (
            <li key={i}>
              <TableOfContentLink chapter={chapter} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
