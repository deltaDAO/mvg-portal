import { ReactElement } from 'react'
import Page from '@shared/Page'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function ComingSoon(): ReactElement {
  const router = useRouter()

  return (
    <>
      <Head>
        <style type="text/css">{`
          main {
            text-align: center;
          }
        `}</style>
      </Head>
      <Page
        title="Coming Soon"
        description="This feature is currently under development and will be available soon."
        uri={router.route}
        headerCenter
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <h1 className="text-5xl font-bold text-[var(--brand-clay)] mb-4">
            Coming Soon
          </h1>
          <h2 className="text-3xl font-semibold text-[var(--font-color-heading)] mb-6">
            Under Development
          </h2>
          <p className="text-lg text-[var(--font-color-text)] max-w-md mb-8">
            This feature is currently being developed and will be available in
            the near future. We appreciate your patience as we work to improve
            your experience.
          </p>
          <Link
            href="/"
            className="bg-[var(--brand-clay)] text-white px-6 py-3 rounded-md hover:bg-[var(--color-highlight)] transition-all duration-200 ease-in-out hover:scale-[1.01] font-bold"
          >
            Return to Homepage
          </Link>
        </div>
      </Page>
    </>
  )
}
