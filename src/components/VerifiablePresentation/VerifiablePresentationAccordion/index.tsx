import { VerifiablePresentationMessage } from '@components/VerifiablePresentation/VerifiablePresentationMessage'
import ExcludingAccordion from '@context/ExcludingAccordion'
import { useVerifiablePresentationContext } from '@context/VerifiablePresentation'
import { useRef } from 'react'
import { VerifiablePresentationTitle } from '../VerifiablePresentationTitle/index'
import { VerifiablePresentation } from '..'
import styles from './index.module.css'

export const VerifiablePresentationAccordion = () => {
  const { credentials, error } = useVerifiablePresentationContext()
  const refs = useRef<(HTMLElement | null)[]>([])

  const openCallback = (index: number) => {
    setTimeout(() => {
      refs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 0)
  }

  if (credentials.length === 0)
    return (
      <VerifiablePresentationMessage variant="info">
        No verifiable credentials found.
      </VerifiablePresentationMessage>
    )

  return (
    <ExcludingAccordion className={styles.accordion}>
      {credentials.map((cred, index) => (
        <>
          {error ? (
            <VerifiablePresentationMessage variant="warn">
              There was an error fetching the verifiable presentation:{' '}
              {String(error)}
            </VerifiablePresentationMessage>
          ) : (
            <>
              <ExcludingAccordion.Trigger
                index={index}
                ref={(el) => (refs.current[index] = el)}
                openCallback={() => openCallback(index)}
              >
                <VerifiablePresentationTitle verifiablePresentation={cred} />
              </ExcludingAccordion.Trigger>
              <ExcludingAccordion.Content index={index}>
                <VerifiablePresentation
                  verifiablePresentation={cred}
                  index={index}
                />
              </ExcludingAccordion.Content>
            </>
          )}
        </>
      ))}
    </ExcludingAccordion>
  )
}
