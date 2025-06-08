export interface ResourceCard {
  id: string
  category: string
  tag: string
  title: string
  description: string
  image: string
  link: string
  // Optional content for search functionality
  content?: string
  tags?: string[]
}

export interface Tab {
  id: string
  label: string
}
