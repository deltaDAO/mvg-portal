import React, { ReactElement } from 'react'
import { TutorialChapterProps } from '../../molecules/TutorialChapter'
import TableOfContentLinkIcon from './TableOfContentLinkIcon'
import TableOfContents from './TableOfContents'

export default function TableOfContentLink({
  chapter,
  onClick
}: {
  chapter: TutorialChapterProps
  onClick?: () => void
}): ReactElement {
  return (
    <a href={`#${chapter.id}`} onClick={onClick}>
      {chapter.videoUrl && (
        <TableOfContentLinkIcon tooltip="Video" before>
          📺
        </TableOfContentLinkIcon>
      )}
      {chapter.title}
      {chapter.interactiveComponent && (
        <TableOfContentLinkIcon tooltip="Interactive Component">
          ✍️
        </TableOfContentLinkIcon>
      )}
    </a>
  )
}
