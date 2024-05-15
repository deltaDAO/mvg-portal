import {
  generateCredentials,
  transformConsumerParameters
} from '@components/Publish/_utils'
import { useAsset } from '@context/Asset'
import { useUserPreferences } from '@context/UserPreferences'
import { useAbortController } from '@hooks/useAbortController'
import {
  Asset,
  Datatoken,
  FixedRateExchange,
  LoggerInstance,
  Metadata,
  Nft,
  Service
} from '@oceanprotocol/lib'
import Web3Feedback from '@shared/Web3Feedback'
import { assetStateToNumber } from '@utils/assetState'
import { mapTimeoutStringToSeconds, normalizeFile } from '@utils/ddo'
import { setMinterToDispenser, setMinterToPublisher } from '@utils/dispenser'
import { decodeTokenURI, setNFTMetadataAndTokenURI } from '@utils/nft'
import { getOceanConfig, getPaymentCollector } from '@utils/ocean'
import { getEncryptedFiles } from '@utils/provider'
import { sanitizeUrl } from '@utils/url'
import { Formik } from 'formik'
import { ReactElement, useEffect, useState } from 'react'
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi'
import content from '../../../../content/pages/editMetadata.json'
import { useAutomation } from '../../../@context/Automation/AutomationProvider'
import DebugEditMetadata from './DebugEditMetadata'
import EditFeedback from './EditFeedback'
import FormEditMetadata from './FormEditMetadata'
import { getInitialValues } from './_constants'
import { MetadataEditForm } from './_types'
import { validationSchema } from './_validation'
import styles from './index.module.css'

export default function Edit({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { debug } = useUserPreferences()
  const { fetchAsset, isAssetNetwork, assetState } = useAsset()
  const { address: accountId } = useAccount()
  const { chain } = useNetwork()
  const provider = useProvider()
  const { data: signer, refetch: refetchSigner } = useSigner()
  const newAbortController = useAbortController()

  const [success, setSuccess] = useState<string>()
  const [paymentCollector, setPaymentCollector] = useState<string>()
  const [error, setError] = useState<string>()
  const isComputeType = asset?.services[0]?.type === 'compute'
  const hasFeedback = error || success

  const { autoWallet, isAutomationEnabled } = useAutomation()
  const [signerToUse, setSignerToUse] = useState(signer)
  const [accountIdToUse, setAccountIdToUse] = useState<string>(accountId)

  useEffect(() => {
    if (isAutomationEnabled && autoWallet?.address) {
      setAccountIdToUse(autoWallet.address)
      setSignerToUse(autoWallet)
      LoggerInstance.log('[edit] using autoWallet to sign')
    } else if (accountId && signer) {
      setAccountIdToUse(accountId)
      setSignerToUse(signer)
      LoggerInstance.log('[edit] using web3 account to sign')
    } else {
      refetchSigner()
      LoggerInstance.log('[edit] refetching signer')
    }
  }, [isAutomationEnabled, signer, autoWallet, accountId])

  useEffect(() => {
    if (!asset || !provider) return

    async function getInitialPaymentCollector() {
      try {
        const paymentCollector = await getPaymentCollector(
          asset.datatokens[0].address,
          provider
        )
        setPaymentCollector(paymentCollector)
      } catch (error) {
        LoggerInstance.error(
          '[EditMetadata: getInitialPaymentCollector]',
          error
        )
      }
    }
    getInitialPaymentCollector()
  }, [asset, provider])

  async function updateFixedPrice(newPrice: string) {
    const config = getOceanConfig(asset.chainId)

    const fixedRateInstance = new FixedRateExchange(
      config.fixedRateExchangeAddress,
      signerToUse
    )

    const setPriceResp = await fixedRateInstance.setRate(
      asset.accessDetails.addressOrId,
      newPrice.toString()
    )
    LoggerInstance.log('[edit] setFixedRate result', setPriceResp)
    if (!setPriceResp) {
      setError(content.form.error)
      LoggerInstance.error(content.form.error)
    }
  }

  async function handleSubmit(
    values: Partial<MetadataEditForm>,
    resetForm: () => void
  ) {
    try {
      let updatedFiles = asset.services[0].files
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
          ...asset.metadata?.additionalInformation,
          gaiaXInformation: values.gaiaXInformation
        }
      }

      if (asset.metadata.type === 'algorithm') {
        updatedMetadata.algorithm.consumerParameters =
          !values.usesConsumerParameters
            ? undefined
            : transformConsumerParameters(values.consumerParameters)
      }

      asset?.accessDetails?.type === 'fixed' &&
        values.price !== asset.accessDetails.price &&
        (await updateFixedPrice(values.price))

      if (values.paymentCollector !== paymentCollector) {
        const datatoken = new Datatoken(signerToUse)
        await datatoken.setPaymentCollector(
          asset?.datatokens[0].address,
          accountIdToUse,
          values.paymentCollector
        )
      }

      if (values.files[0]?.url) {
        const file = {
          nftAddress: asset.nftAddress,
          datatokenAddress: asset.services[0].datatokenAddress,
          files: [
            normalizeFile(values.files[0].type, values.files[0], chain?.id)
          ]
        }

        const filesEncrypted = await getEncryptedFiles(
          file,
          asset.chainId,
          asset.services[0].serviceEndpoint
        )
        updatedFiles = filesEncrypted
      }
      const updatedService: Service = {
        ...asset.services[0],
        timeout: mapTimeoutStringToSeconds(values.timeout),
        files: updatedFiles
      }
      if (values?.service?.consumerParameters) {
        updatedService.consumerParameters = transformConsumerParameters(
          values.service.consumerParameters
        )
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
        services: [updatedService],
        credentials: updatedCredentials
      }

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

      // delete custom helper properties injected in the market so we don't write them on chain
      delete (updatedAsset as AssetExtended).accessDetails
      delete (updatedAsset as AssetExtended).datatokens
      delete (updatedAsset as AssetExtended).stats
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
      //   accountIdToUse,
      //   signerToUse,
      //   newAbortController()
      // )

      if (!setMetadataTx) {
        setError(content.form.error)
        LoggerInstance.error(content.form.error)
        return
      }
      await setMetadataTx.wait()

      LoggerInstance.log('[edit] asset states', {
        state: values.assetState,
        assetState
      })
      if (values.assetState !== assetState) {
        const nft = new Nft(signerToUse)

        const setMetadataStateTx = await nft.setMetadataState(
          asset?.nftAddress,
          accountIdToUse,
          assetStateToNumber(values.assetState)
        )
        if (!setMetadataStateTx) {
          setError(content.form.stateError)
          LoggerInstance.error(content.form.stateError)
          return
        }
        await setMetadataStateTx.wait()
      }

      LoggerInstance.log('[edit] setMetadata result', setMetadataTx)

      if (asset.accessDetails.type === 'free') {
        const tx = await setMinterToDispenser(
          signerToUse,
          asset?.accessDetails?.datatoken?.address,
          accountIdToUse,
          setError
        )
        if (!tx) return
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
        asset?.services[0],
        asset?.credentials,
        asset?.accessDetails?.price || '0',
        paymentCollector,
        assetState
      )}
      validationSchema={validationSchema}
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
            <FormEditMetadata
              data={content.form.data}
              showPrice={asset?.accessDetails?.type === 'fixed'}
              isComputeDataset={isComputeType}
            />

            <Web3Feedback
              networkId={asset?.chainId}
              accountId={accountIdToUse}
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
