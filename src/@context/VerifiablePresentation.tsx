import { useVerifiablePresentations } from '@hooks/useVerifiablePresentations'
import { GaiaXVerifiablePresentationArray } from '@utils/verifiablePresentations/types'
import { type ReactNode, createContext, useContext } from 'react'
import { Address } from 'wagmi'

interface VerifiablePresentationContextProps {
  address: Address
  credentials: GaiaXVerifiablePresentationArray
  error: unknown
}

const VerifiablePresentationContext = createContext(
  {} as VerifiablePresentationContextProps
)

interface VerifiablePresentationProps {
  address: Address
  children?: ReactNode
}

const VerifiablePresentationProvider = ({
  address,
  children
}: Readonly<VerifiablePresentationProps>) => {
  const { data: credentials, error } = useVerifiablePresentations(address)

  return (
    <VerifiablePresentationContext.Provider
      value={{
        address,
        credentials,
        error
      }}
    >
      {children}
    </VerifiablePresentationContext.Provider>
  )
}

const useVerifiablePresentationContext = () => {
  const ctx = useContext(VerifiablePresentationContext)
  if (!ctx)
    throw new Error(
      'useVerifiablePresentationContext used outside of VerifiablePresentationContext'
    )
  return ctx
}

export default VerifiablePresentationProvider
export { useVerifiablePresentationContext }
