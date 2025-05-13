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
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <h1 className="text-6xl font-bold text-[#4169E1] mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
          <p className="text-lg text-gray-600 max-w-md mb-8">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
          <Link
            href="/"
            className="bg-[#4169E1] text-white px-6 py-3 rounded-md hover:bg-[#3451b2] transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </Page>
    </>
  )
}
