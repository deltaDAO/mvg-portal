import React, { ReactElement } from 'react'
import slugify from 'slugify'
import Markdown from '../atoms/Markdown'
import styles from './TutorialChapter.module.css'

export interface TutorialChapterProps {
  id: string
  title: string
  chapter?: number
  markdown: string
  titlePrefix?: string
  videoUrl?: string
  interactiveComponent?: ReactElement
}

export default function TutorialChapter({
  chapter
}: {
  chapter: TutorialChapterProps
}): ReactElement {
  return (
    <>
      <section
        id={slugify(chapter.title)}
        className={styles.chapter}
        key={chapter.id}
      >
        <h3 className={styles.chapter_title}>
          {chapter.titlePrefix && `${chapter.titlePrefix} `}
          {chapter.title}
        </h3>
        <Markdown text={chapter.markdown} />
        {chapter.interactiveComponent && (
          <div className={styles.interactive}>
            {chapter.interactiveComponent}
          </div>
        )}
      </section>
    </>
  )
}
