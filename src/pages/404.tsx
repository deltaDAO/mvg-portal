import { ReactElement } from 'react'
import Page from '@shared/Page'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Page404(): ReactElement {
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
        title="404 - Page Not Found"
        description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
        uri={router.route}
        headerCenter
        noPageHeader
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <h1 className="text-6xl font-bold text-[var(--brand-clay)] mb-4">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-[var(--font-color-heading)] mb-6">
            Page Not Found
          </h2>
          <p className="text-lg text-[var(--font-color-text)] max-w-md mb-8">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
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
