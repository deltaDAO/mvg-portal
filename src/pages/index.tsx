import { ReactElement, useEffect } from 'react'
// import Home from '../components/Home'
// import Page from '@shared/Page'
import { useRouter } from 'next/router'
// import { useMarketMetadata } from '@context/MarketMetadata'

export default function PageHome(): ReactElement {
  // const { siteContent } = useMarketMetadata()
  const router = useRouter()
  useEffect(() => {
    router.replace('/search?sort=nft.created&sortOrder=desc')
  }, [])

  return null

  // return (
  //   <Page
  //     title={siteContent?.siteTitle}
  //     description={siteContent?.siteTagline}
  //     uri={router.route}
  //     headerCenter
  //   >
  //     <Home />
  //   </Page>
  // )
}
