import Loader from '@components/@shared/atoms/Loader'
import { VerifiablePresentationCard } from '@components/VerifiablePresentation/VerifiablePresentationCard'
import { useAutomation } from '@context/Automation/AutomationProvider'
import { useUserPreferences } from '@context/UserPreferences'
import VerifiablePresentationProvider from '@context/VerifiablePresentation'
import { useAddressConfig } from '@hooks/useAddressConfig'
import Refresh from '@images/refresh.svg'
import Transaction from '@images/transaction.svg'
import Jellyfish from '@oceanprotocol/art/creatures/jellyfish/jellyfish-grid.svg'
import Avatar from '@shared/atoms/Avatar'
import Copy from '@shared/atoms/Copy'
import ExplorerLink from '@shared/ExplorerLink'
import NetworkName from '@shared/NetworkName'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { accountTruncate } from '@utils/wallet'
import { ReactElement, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Address } from 'wagmi'
import styles from './Account.module.css'
import { VerifiableCredential } from './VerifiableCredential'

export default function Account({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const { autoWalletAddress } = useAutomation()
  const { verifiedAddresses } = useAddressConfig()

  const renderName = () => {
    return (
      <h3 className={styles.name}>
        {verifiedAddresses?.[accountId]?.name ?? accountTruncate(accountId)}{' '}
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ resetErrorBoundary }) => (
                <div
                  onClick={resetErrorBoundary}
                  className={styles.retryButton}
                >
                  <Refresh />
                </div>
              )}
            >
              <Suspense fallback={<Loader />}>
                <VerifiableCredential address={accountId as Address} />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
        {autoWalletAddress === accountId && (
          <span className={styles.automation} title="Automation">
            <Transaction />
          </span>
        )}
      </h3>
    )
  }

  return (
    <div className={styles.account}>
      <figure className={styles.imageWrap}>
        {accountId ? (
          <Avatar accountId={accountId} className={styles.image} />
        ) : (
          <Jellyfish className={styles.image} />
        )}
      </figure>
      <div>
        {renderName()}
        {accountId && (
          <code className={styles.accountId}>
            {accountId} <Copy text={accountId} />
          </code>
        )}
        <p>
          {accountId &&
            chainIds.map((value) => (
              <ExplorerLink
                className={styles.explorer}
                networkId={value}
                path={`address/${accountId}`}
                key={value}
              >
                <NetworkName networkId={value} />
              </ExplorerLink>
            ))}
        </p>
      </div>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ resetErrorBoundary }) => (
              <div onClick={resetErrorBoundary} className={styles.retryButton}>
                <Refresh />
              </div>
            )}
          >
            <div className={styles.card}>
              <Suspense fallback={<Loader />}>
                <VerifiablePresentationProvider address={accountId as Address}>
                  <VerifiablePresentationCard address={accountId as Address} />
                </VerifiablePresentationProvider>
              </Suspense>
            </div>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}
