import React, { ReactElement, useState, useRef, useEffect } from 'react'
import slugify from 'slugify'
import Progressbar from '../atoms/Progressbar'
import Markdown from '../atoms/Markdown'
import classNames from 'classnames/bind'
import styles from './TutorialChapter.module.css'
import VideoPlayer from './VideoPlayer'

export interface TutorialChapterProps {
  id: string
  title: string
  chapter?: number
  markdown: string
  titlePrefix?: string
  videoUrl?: string
  interactiveComponent?: ReactElement
}

const cx = classNames.bind(styles)

export default function TutorialChapter({
  chapter,
  pageProgress
}: {
  chapter: TutorialChapterProps
  pageProgress: number
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
        {chapter.videoUrl && <VideoPlayer videoUrl={chapter.videoUrl} />}
        {chapter.interactiveComponent && (
          <div className={styles.interactive}>
            {chapter.interactiveComponent}
          </div>
        )}
      </section>
    </>
  )
}
