import { ReactElement } from 'react'
import ComputeWizardController from './ComputeWizardController'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import { FileInfo } from '@oceanprotocol/lib'
import { Signer } from 'ethers'

type ComputeMode = 'dataset' | 'algorithm'

export interface ComputeWizardProps {
  accountId: string
  signer: Signer
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  dtBalance: string
  file: FileInfo
  isAccountIdWhitelisted: boolean
  consumableFeedback?: string
  onClose?: () => void
  onComputeJobCreated?: () => void
  mode?: ComputeMode
}

export default function ComputeWizard(props: ComputeWizardProps): ReactElement {
  const { asset, mode: explicitMode } = props
  const assetType = asset?.credentialSubject?.metadata?.type
  const mode: ComputeMode =
    explicitMode || (assetType === 'algorithm' ? 'algorithm' : 'dataset')

  return <ComputeWizardController {...props} mode={mode} />
}
