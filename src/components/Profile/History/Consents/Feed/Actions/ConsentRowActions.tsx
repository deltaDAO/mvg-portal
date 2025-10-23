import QueryBoundary from '@components/@shared/QueryBoundary'
import { Consent } from '@utils/consents/types'
import { ReactNode, createContext, useContext } from 'react'
import DeleteConsent from './Buttons/DeleteConsent'
import InspectButton from './Buttons/InspectConsent'

interface ConsentRowActionsValue {
  consent: Consent
}

const ConsentRowActionsContext = createContext({} as ConsentRowActionsValue)

interface Props {
  consent: Consent
  children?: ReactNode
}

export default function ConsentRowActions({ consent, children }: Props) {
  return (
    <ConsentRowActionsContext.Provider value={{ consent }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'calc(var(--spacer) / 2)'
        }}
      >
        <QueryBoundary>{children}</QueryBoundary>
      </div>
    </ConsentRowActionsContext.Provider>
  )
}

export const useConsentRowActions = () => {
  const context = useContext(ConsentRowActionsContext)
  if (!context) {
    throw new Error(
      'ConsentRowActions components must be used inside ConsentRowActions'
    )
  }
  return context
}

ConsentRowActions.Inspect = InspectButton
ConsentRowActions.DeleteConsent = DeleteConsent
