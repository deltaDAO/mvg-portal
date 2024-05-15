import { Formik } from 'formik'
import { ReactElement, useEffect, useState } from 'react'
import FormEditComputeDataset from './FormEditComputeDataset'
import {
  LoggerInstance,
  ServiceComputeOptions,
  Service,
  Asset
} from '@oceanprotocol/lib'
import { useUserPreferences } from '@context/UserPreferences'
import styles from './index.module.css'
import Web3Feedback from '@shared/Web3Feedback'
import { useCancelToken } from '@hooks/useCancelToken'
import { getComputeSettingsInitialValues } from './_constants'
import { computeSettingsValidationSchema } from './_validation'
import content from '../../../../content/pages/editComputeDataset.json'
import { getServiceByName } from '@utils/ddo'
import { setMinterToPublisher, setMinterToDispenser } from '@utils/dispenser'
import { transformComputeFormToServiceComputeOptions } from '@utils/compute'
import { useAbortController } from '@hooks/useAbortController'
import DebugEditCompute from './DebugEditCompute'
import { useAsset } from '@context/Asset'
import EditFeedback from './EditFeedback'
import {
  decodeTokenURI,
  setNFTMetadataAndTokenURI,
  setNftMetadata
} from '@utils/nft'
import { ComputeEditForm } from './_types'
import { useAccount, useSigner } from 'wagmi'
import { useAutomation } from '../../../@context/Automation/AutomationProvider'

export default function EditComputeDataset({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { debug } = useUserPreferences()
  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const { fetchAsset, isAssetNetwork } = useAsset()
  const { autoWallet, isAutomationEnabled } = useAutomation()
  const [signerToUse, setSignerToUse] = useState(signer)
  const [accountIdToUse, setAccountIdToUse] = useState<string>(accountId)

  useEffect(() => {
    setSignerToUse(isAutomationEnabled ? autoWallet : signer)
    setAccountIdToUse(isAutomationEnabled ? autoWallet?.address : accountId)
  }, [isAutomationEnabled, accountId, autoWallet, signer])

  const [success, setSuccess] = useState<string>()
  const [error, setError] = useState<string>()
  const newAbortController = useAbortController()
  const newCancelToken = useCancelToken()
  const hasFeedback = error || success

  async function handleSubmit(values: ComputeEditForm, resetForm: () => void) {
    try {
      if (
        asset?.accessDetails?.type === 'free' &&
        asset?.accessDetails?.isPurchasable
      ) {
        const tx = await setMinterToPublisher(
          signerToUse,
          asset?.accessDetails?.datatoken?.address,
          accountIdToUse,
          setError
        )
        if (!tx) return
      }
      const newComputeSettings: ServiceComputeOptions =
        await transformComputeFormToServiceComputeOptions(
          values,
          asset.services[0].compute,
          asset.chainId,
          newCancelToken()
        )

      LoggerInstance.log(
        '[edit compute settings]  newComputeSettings',
        newComputeSettings
      )

      const updatedService: Service = {
        ...asset.services[0],
        compute: newComputeSettings
      }

      LoggerInstance.log(
        '[edit compute settings]  updatedService',
        updatedService
      )

      const updatedAsset: Asset = {
        ...asset,
        services: [updatedService]
      }

      // TODO: revert to setMetadata function
      const setMetadataTx = await setNFTMetadataAndTokenURI(
        updatedAsset,
        accountIdToUse,
        signerToUse,
        decodeTokenURI(asset.nft.tokenURI),
        newAbortController()
      )
      // const setMetadataTx = await setNftMetadata(
      //   updatedAsset,
      //   accountId,
      //   web3,
      //   newAbortController()
      // )

      LoggerInstance.log('[edit] setMetadata result', setMetadataTx)

      if (!setMetadataTx) {
        setError(content.form.error)
        LoggerInstance.error(content.form.error)
        return
      } else {
        await setMetadataTx.wait()
        if (asset.accessDetails.type === 'free') {
          const tx = await setMinterToDispenser(
            signerToUse,
            asset?.accessDetails?.datatoken?.address,
            accountIdToUse,
            setError
          )
          if (!tx) return
        }
      }
      // Edit succeeded
      setSuccess(content.form.success)
      resetForm()
    } catch (error) {
      LoggerInstance.error(error.message)
      setError(error.message)
    }
  }

  return (
    <Formik
      initialValues={getComputeSettingsInitialValues(
        getServiceByName(asset, 'compute')?.compute
      )}
      validationSchema={computeSettingsValidationSchema}
      onSubmit={async (values, { resetForm }) => {
        // move user's focus to top of screen
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        // kick off editing
        await handleSubmit(values, resetForm)
      }}
      enableReinitialize
    >
      {({ values, isSubmitting }) =>
        isSubmitting || hasFeedback ? (
          <EditFeedback
            loading="Updating dataset with new compute settings..."
            error={error}
            success={success}
            setError={setError}
            successAction={{
              name: 'Back to Asset',
              onClick: async () => {
                await fetchAsset()
              },
              to: `/asset/${asset.id}`
            }}
          />
        ) : (
          <>
            <FormEditComputeDataset />
            <Web3Feedback
              networkId={asset?.chainId}
              accountId={accountIdToUse}
              isAssetNetwork={isAssetNetwork}
            />
            {debug === true && (
              <div className={styles.grid}>
                <DebugEditCompute values={values} asset={asset} />
              </div>
            )}
          </>
        )
      }
    </Formik>
  )
}
