import React from 'react'
import { ReactElement } from 'react-markdown'
import Bookmarks from '../molecules/Bookmarks'
import Permission from '../organisms/Permission'

export default function PageBookmarks(): ReactElement {
  return (
    <Permission eventType="browse">
      <Bookmarks />
    </Permission>
  )
}
