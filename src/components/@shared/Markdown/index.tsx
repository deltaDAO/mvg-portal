import { markdownToHtml } from '@utils/markdown'
import React, { ReactElement } from 'react'
import styles from './index.module.css'

const Markdown = ({
  text,
  blockImages,
  className
}: {
  text: string
  blockImages?: boolean
  className?: string
}): ReactElement => {
  const content = !blockImages
    ? markdownToHtml(text)
    : markdownToHtml(text).replaceAll(
        /<img[\w\W]+?\/?>/g,
        // enclosing the img into a <span> element to target in css
        `<span><img src="/images/image_blocked_placeholder.png" alt="Blocked image placeholder" /></span>`
      )

  return (
    <div
      className={`${styles.markdown} ${className}`}
      // Note: We serialize and kill all embedded HTML over in markdownToHtml()
      // so the danger here is gone.
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

export default Markdown
