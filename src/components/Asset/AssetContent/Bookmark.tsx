import { useUserPreferences } from '@context/UserPreferences'
import { ReactElement } from 'react'
import styles from './Bookmark.module.css'
import BookmarkIcon from '@images/bookmark.svg'

export default function Bookmark({ did }: { did: string }): ReactElement {
  const { bookmarks, addBookmark, removeBookmark } = useUserPreferences()
  const isBookmarked = bookmarks && bookmarks?.includes(did)

  function handleBookmark() {
    isBookmarked ? removeBookmark(did) : addBookmark(did)
  }

  return (
    <button
      onClick={handleBookmark}
      className={`${styles.bookmark} ${isBookmarked ? styles.active : ''} `}
      data-tooltip={
        isBookmarked
          ? 'Asset is Bookmarked, Click to Remove'
          : 'Click to Add in Bookmarks'
      }
    >
      <BookmarkIcon />
    </button>
  )
}
