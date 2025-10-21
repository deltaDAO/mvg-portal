import { Address } from 'wagmi'

export const CredentialRoutes = {
  GetPresentation: (address: Address) => `credentials/${address}`
}
