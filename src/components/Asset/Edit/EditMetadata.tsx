import { ReactElement, useState } from 'react'
import { Formik } from 'formik'
import { LoggerInstance, Asset, Nft, Metadata } from '@oceanprotocol/lib'
import { metadataValidationSchema } from './_validation'
import { getInitialValues } from './_constants'
import { MetadataEditForm } from './_types'
import { useUserPreferences } from '@context/UserPreferences'
import Web3Feedback from '@shared/Web3Feedback'
import FormEditMetadata from './FormEditMetadata'
import styles from './index.module.css'
import content from '../../../../content/pages/editMetadata.json'
import { useAbortController } from '@hooks/useAbortController'
import DebugEditMetadata from './DebugEditMetadata'
import EditFeedback from './EditFeedback'
import { useAsset } from '@context/Asset'
import { setNftMetadata } from '@utils/nft'
import { sanitizeUrl } from '@utils/url'
import { assetStateToNumber } from '@utils/assetState'
import { useAccount, useSigner } from 'wagmi'
import {
  transformConsumerParameters,
  generateCredentials
} from '@components/Publish/_utils'

export default function Edit({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { debug } = useUserPreferences()
  const { fetchAsset, isAssetNetwork, assetState } = useAsset()
  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const newAbortController = useAbortController()

  const [success, setSuccess] = useState<string>()
  const [error, setError] = useState<string>()
  const hasFeedback = error || success

  async function handleSubmit(values: MetadataEditForm, resetForm: () => void) {
    try {
      const linksTransformed = values.links?.length &&
        values.links[0].valid && [sanitizeUrl(values.links[0].url)]
      const updatedMetadata: Metadata = {
        ...asset.metadata,
        name: values.name,
        description: values.description,
        links: linksTransformed,
        author: values.author,
        tags: values.tags,
        license: values.license,
        additionalInformation: {
          ...asset.metadata?.additionalInformation
        }
      }

      if (asset.metadata.type === 'algorithm') {
        updatedMetadata.algorithm.consumerParameters =
          !values.usesConsumerParameters
            ? undefined
            : transformConsumerParameters(values.consumerParameters)
      }

      const updatedCredentials = generateCredentials(
        asset?.credentials,
        values?.allow,
        values?.deny
      )

      // TODO: remove version update at a later time
      const updatedAsset: Asset = {
        ...(asset as Asset),
        version: '4.1.0',
        metadata: updatedMetadata,
        credentials: updatedCredentials
      }

      // delete custom helper properties injected in the market so we don't write them on chain
      delete (updatedAsset as AssetExtended).accessDetails
      delete (updatedAsset as AssetExtended).datatokens
      delete (updatedAsset as AssetExtended).stats
      delete (updatedAsset as AssetExtended).offchain

      const setMetadataTx = await setNftMetadata(
        updatedAsset,
        accountId,
        signer,
        newAbortController()
      )

      if (values.assetState !== assetState) {
        const nft = new Nft(signer)

        await nft.setMetadataState(
          asset?.nftAddress,
          accountId,
          assetStateToNumber(values.assetState)
        )
      }

      LoggerInstance.log('[edit] setMetadata result', setMetadataTx)

      if (!setMetadataTx) {
        setError(content.form.error)
        LoggerInstance.error(content.form.error)
        return
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
      enableReinitialize
      initialValues={getInitialValues(
        asset?.metadata,
        asset?.credentials,
        assetState
      )}
      validationSchema={metadataValidationSchema}
      onSubmit={async (values, { resetForm }) => {
        // move user's focus to top of screen
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        // kick off editing
        await handleSubmit(values, resetForm)
      }}
    >
      {({ isSubmitting, values }) =>
        isSubmitting || hasFeedback ? (
          <EditFeedback
            loading="Updating asset with new metadata..."
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
            <FormEditMetadata />

            <Web3Feedback
              networkId={asset?.chainId}
              accountId={accountId}
              isAssetNetwork={isAssetNetwork}
            />

            {debug === true && (
              <div className={styles.grid}>
                <DebugEditMetadata values={values} asset={asset} />
              </div>
            )}
          </>
        )
      }
    </Formik>
  )
}
