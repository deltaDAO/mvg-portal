import { ReactElement, useState } from 'react'
import { Formik } from 'formik'
import {
  LoggerInstance,
  Datatoken,
  Service,
  Nft,
  FreCreationParams,
  DispenserParams,
  getHash
} from '@oceanprotocol/lib'
import {
  defaultServiceComputeOptions,
  getNewServiceInitialValues
} from './_constants'
import { ServiceEditForm } from './_types'
import Web3Feedback from '@shared/Web3Feedback'
import { mapTimeoutStringToSeconds, normalizeFile } from '@utils/ddo'
import content from '../../../../content/pages/editService.json'
import { useAbortController } from '@hooks/useAbortController'
import EditFeedback from './EditFeedback'
import { useAsset } from '@context/Asset'
import { setNftMetadata } from '@utils/nft'
import { getEncryptedFiles } from '@utils/provider'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { transformConsumerParameters } from '@components/Publish/_utils'
import {
  defaultDatatokenCap,
  defaultDatatokenTemplateIndex,
  marketFeeAddress,
  publisherMarketFixedSwapFee
} from 'app.config'
import { ethers } from 'ethers'
import FormAddService from './FormAddService'
import { transformComputeFormToServiceComputeOptions } from '@utils/compute'
import { useCancelToken } from '@hooks/useCancelToken'
import { serviceValidationSchema } from './_validation'
import DebugEditService from './DebugEditService'
import styles from './index.module.css'
import { useUserPreferences } from '@context/UserPreferences'
import { getOceanConfig } from '@utils/ocean'

export default function AddService({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { debug } = useUserPreferences()
  const { fetchAsset, isAssetNetwork } = useAsset()
  const { address: accountId } = useAccount()
  const { chain } = useNetwork()
  const { data: signer } = useSigner()
  const newAbortController = useAbortController()
  const newCancelToken = useCancelToken()
  const config = getOceanConfig(asset?.chainId)

  const [success, setSuccess] = useState<string>()
  const [error, setError] = useState<string>()
  const hasFeedback = error || success

  // add new service
  async function handleSubmit(values: ServiceEditForm, resetForm: () => void) {
    try {
      if (!isAssetNetwork) {
        setError('Please switch to the correct network.')
        return
      }

      // --------------------------------------------------
      // 1. Create Datatoken
      // --------------------------------------------------
      const nft = new Nft(signer)

      const datatokenAddress = await nft.createDatatoken(
        asset.nftAddress,
        accountId,
        accountId,
        values.paymentCollector,
        marketFeeAddress,
        config.oceanTokenAddress,
        publisherMarketFixedSwapFee,
        defaultDatatokenCap,
        'DataToken',
        'DT',
        defaultDatatokenTemplateIndex
      )

      LoggerInstance.log('Datatoken created.', datatokenAddress)

      // --------------------------------------------------
      // 2. Create Pricing
      // --------------------------------------------------
      const datatoken = new Datatoken(signer)

      let pricingTransactionReceipt
      if (values.price > 0) {
        LoggerInstance.log(
          `Creating fixed rate exchange with price ${values.price} for datatoken ${datatokenAddress}`
        )

        const freParams: FreCreationParams = {
          fixedRateAddress: config.fixedRateExchangeAddress,
          baseTokenAddress: config.oceanTokenAddress,
          owner: accountId,
          marketFeeCollector: marketFeeAddress,
          baseTokenDecimals: 18,
          datatokenDecimals: 18,
          fixedRate: ethers.utils
            .parseEther(values.price.toString())
            .toString(),
          marketFee: publisherMarketFixedSwapFee,
          withMint: true
        }

        pricingTransactionReceipt = await datatoken.createFixedRate(
          datatokenAddress,
          accountId,
          freParams
        )
      } else {
        LoggerInstance.log(
          `Creating dispenser for datatoken ${datatokenAddress}`
        )

        const dispenserParams: DispenserParams = {
          maxTokens: ethers.utils.parseEther('1').toString(),
          maxBalance: ethers.utils.parseEther('1').toString(),
          withMint: true
        }

        pricingTransactionReceipt = await datatoken.createDispenser(
          datatokenAddress,
          accountId,
          config.dispenserAddress,
          dispenserParams
        )
      }

      await pricingTransactionReceipt.wait()
      LoggerInstance.log('Pricing scheme created.')

      // --------------------------------------------------
      // 2. Update DDO
      // --------------------------------------------------
      let newFiles = asset.services[0].files // by default it could be the same file as in other services
      if (values.files[0]?.url) {
        const file = {
          nftAddress: asset.nftAddress,
          datatokenAddress,
          files: [
            normalizeFile(values.files[0].type, values.files[0], chain?.id)
          ]
        }

        const filesEncrypted = await getEncryptedFiles(
          file,
          asset.chainId,
          values.providerUrl.url
        )
        newFiles = filesEncrypted
      }

      const newService: Service = {
        id: getHash(datatokenAddress + newFiles),
        type: values.access,
        name: values.name,
        description: values.description,
        files: newFiles || '',
        datatokenAddress,
        serviceEndpoint: values.providerUrl.url,
        timeout: mapTimeoutStringToSeconds(values.timeout),
        ...(values.access === 'compute' && {
          compute: await transformComputeFormToServiceComputeOptions(
            values,
            defaultServiceComputeOptions,
            asset.chainId,
            newCancelToken()
          )
        }),
        consumerParameters: transformConsumerParameters(
          values.consumerParameters
        )
      }

      // update asset with new service
      const updatedAsset = { ...asset }
      updatedAsset.services.push(newService)

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
      initialValues={getNewServiceInitialValues(accountId, asset.services[0])}
      validationSchema={serviceValidationSchema}
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
            loading="Adding a new service..."
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
            <FormAddService data={content.form.data} chainId={asset.chainId} />

            <Web3Feedback
              networkId={asset?.chainId}
              accountId={accountId}
              isAssetNetwork={isAssetNetwork}
            />

            {debug === true && (
              <div className={styles.grid}>
                <DebugEditService
                  values={values}
                  asset={asset}
                  service={{
                    id: 'WILL BE CALCULATED AFTER SUBMIT',
                    type: 'access',
                    datatokenAddress: 'WILL BE FILLED AFTER SUBMIT',
                    name: '',
                    description: '',
                    files: asset.services[0].files,
                    serviceEndpoint: asset.services[0].serviceEndpoint,
                    timeout: 0,
                    consumerParameters: []
                  }}
                />
              </div>
            )}
          </>
        )
      }
    </Formik>
  )
}
