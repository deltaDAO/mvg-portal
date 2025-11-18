import { ReactElement, useEffect } from 'react'
import { useRouter } from 'next/router'

interface HashScrollHandlerProps {
  delay?: number
}

export default function HashScrollHandler({
  delay = 100
}: HashScrollHandlerProps): ReactElement {
  const router = useRouter()

  useEffect(() => {
    if (router.asPath.includes('#')) {
      const hash = router.asPath.split('#')[1]
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, delay)
    }
  }, [router.asPath, delay])

  return <></>
}
