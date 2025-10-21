import VerifiedBadge from '@components/@shared/VerifiedBadge'
import { useVerifiablePresentationContext } from '@context/VerifiablePresentation'
import { useVerifiablePresentationVerification } from '@hooks/useVerifiablePresentationVerification'
import { GaiaXVerifiablePresentation } from '@utils/verifiablePresentations/types'

interface VerifiablePresentationVerificationProperties {
  verifiablePresentation: GaiaXVerifiablePresentation
  index: number
  className?: string
}

export const VerifiablePresentationVerification = ({
  verifiablePresentation,
  index,
  className
}: Readonly<VerifiablePresentationVerificationProperties>) => {
  const { address } = useVerifiablePresentationContext()
  const {
    data: { verified, idMatch, isIdMatchVerifiable, complianceApiVersion } = {},
    isLoading
  } = useVerifiablePresentationVerification(
    verifiablePresentation,
    address,
    index
  )

  return (
    <VerifiedBadge
      name="Presentation"
      idMatch={idMatch}
      isValid={verified}
      isIdMatchVerifiable={isIdMatchVerifiable}
      apiVersion={complianceApiVersion}
      isLoading={isLoading}
      timestamp
      className={className}
    />
  )
}
