import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useState
} from 'react'

interface NewsletterBannerContextValue {
  showNewsletterBanner: boolean
  setShowNewsletterBanner: (show: boolean) => void
}

const NewsletterBannerContext = createContext<
  NewsletterBannerContextValue | undefined
>(undefined)

interface NewsletterBannerProviderProps {
  children: ReactNode
}

export function NewsletterBannerProvider({
  children
}: NewsletterBannerProviderProps): ReactElement {
  const [showNewsletterBanner, setShowNewsletterBanner] = useState(false)

  return (
    <NewsletterBannerContext.Provider
      value={{ showNewsletterBanner, setShowNewsletterBanner }}
    >
      {children}
    </NewsletterBannerContext.Provider>
  )
}

export function useNewsletterBanner(): NewsletterBannerContextValue {
  const context = useContext(NewsletterBannerContext)
  if (context === undefined) {
    throw new Error(
      'useNewsletterBanner must be used within a NewsletterBannerProvider'
    )
  }
  return context
}
