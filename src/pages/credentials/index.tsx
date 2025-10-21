import Loader from '@components/@shared/atoms/Loader'
import Page from '@components/@shared/Page'
import { VerifiablePresentationAccordion } from '@components/VerifiablePresentation/VerifiablePresentationAccordion'
import { VerifiablePresentationMessage } from '@components/VerifiablePresentation/VerifiablePresentationMessage'
import VerifiablePresentationProvider from '@context/VerifiablePresentation'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { isAddress } from 'ethers/lib/utils.js'
import { useRouter } from 'next/router'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Address, useAccount } from 'wagmi'

function CredentialsPage() {
  const router = useRouter()
  const { address: accountAddress } = useAccount()
  const { credential } = router.query
  const cred = Array.isArray(credential) ? credential[0] : credential

  let address: Address | null = null
  let isUnknown = false

  if (cred && isAddress(cred)) {
    address = cred as Address
  } else if (accountAddress) {
    address = accountAddress
    if (cred) isUnknown = true
  }

  return (
    <Page
      uri={`/credentials/${address ?? ''}`}
      title="Verifiable Presentations"
    >
      {isUnknown && (
        <VerifiablePresentationMessage variant="info">
          The input address did not match any known address. Falling back to
          your account.
        </VerifiablePresentationMessage>
      )}

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallback={<p>There was an error fetching the VPs</p>}
          >
            <Suspense fallback={<Loader />}>
              <VerifiablePresentationProvider address={address}>
                <VerifiablePresentationAccordion />
              </VerifiablePresentationProvider>
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </Page>
  )
}

export default CredentialsPage
