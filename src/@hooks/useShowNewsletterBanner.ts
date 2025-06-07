import { useEffect } from 'react'
import { useNewsletterBanner } from '../@context/NewsletterBanner'

export function useShowNewsletterBanner(): void {
  const { setShowNewsletterBanner } = useNewsletterBanner()

  useEffect(() => {
    setShowNewsletterBanner(true)

    return () => {
      setShowNewsletterBanner(false)
    }
  }, [setShowNewsletterBanner])
}
