import { ReactElement, useState } from 'react'
import { Formik } from 'formik'
import {
  LoggerInstance,
  Datatoken,
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
import { isAddress } from 'ethers/lib/utils.js'
import EditFeedback from './EditFeedback'
import { useAsset } from '@context/Asset'
import { getEncryptedFiles } from '@utils/provider'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import {
  generateCredentials,
  IpfsUpload,
  signAssetAndUploadToIpfs,
  stringifyCredentialPolicies,
  transformConsumerParameters
} from '@components/Publish/_utils'
import {
  customProviderUrl,
  defaultDatatokenCap,
  defaultDatatokenTemplateIndex,
  encryptAsset,
  marketFeeAddress,
  publisherMarketFixedSwapFee
} from 'app.config.cjs'
import { ethers } from 'ethers'
import FormAddService from './FormAddService'
import { transformComputeFormToServiceComputeOptions } from '@utils/compute'
import { useCancelToken } from '@hooks/useCancelToken'
import { serviceValidationSchema } from './_validation'
import DebugEditService from './DebugEditService'
import styles from './index.module.css'
import { useUserPreferences } from '@context/UserPreferences'
import { getOceanConfig } from '@utils/ocean'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { State } from 'src/@types/ddo/State'
import { useSsiWallet } from '@context/SsiWallet'

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
  const newCancelToken = useCancelToken()
  const config = getOceanConfig(asset?.credentialSubject?.chainId)
  const ssiWalletContext = useSsiWallet()

  const [success, setSuccess] = useState<string>()
  const [error, setError] = useState<string>()
  const hasFeedback = error || success

  // add new service
  async function handleSubmit(values: ServiceEditForm, resetForm: () => void) {
    try {
      const processAddress = (
        inputValue: string,
        fieldName: 'allow' | 'deny'
      ) => {
        const trimmedValue = inputValue?.trim()
        if (
          !trimmedValue ||
          trimmedValue.length < 40 ||
          !trimmedValue.startsWith('0x')
        ) {
          return
        }

        try {
          if (isAddress(trimmedValue)) {
            const lowerCaseAddress = trimmedValue.toLowerCase()
            const currentList = values.credentials[fieldName] || []

            if (!currentList.includes(lowerCaseAddress)) {
              const newList = [...currentList, lowerCaseAddress]
              values.credentials[fieldName] = newList
            }
          }
        } catch (error) {}
      }

      if (values.credentials.allowInputValue) {
        processAddress(values.credentials.allowInputValue, 'allow')
      }
      if (values.credentials.denyInputValue) {
        processAddress(values.credentials.denyInputValue, 'deny')
      }

      if (!isAssetNetwork) {
        setError('Please switch to the correct network.')
        return
      }

      // --------------------------------------------------
      // 1. Create Datatoken
      // --------------------------------------------------
      const nft = new Nft(signer)

      const datatokenAddress = await nft.createDatatoken(
        asset.credentialSubject.nftAddress,
        accountId,
        accountId,
        values.paymentCollector,
        marketFeeAddress,
        config.oceanTokenAddress,
        publisherMarketFixedSwapFee,
        defaultDatatokenCap,
        'Access Token',
        'OEAT',
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
      let newFiles = asset.credentialSubject?.services[0].files // by default it could be the same file as in other services
      if (values.files[0]?.url) {
        const file = {
          nftAddress: asset.credentialSubject.nftAddress,
          datatokenAddress,
          files: [
            normalizeFile(values.files[0].type, values.files[0], chain?.id)
          ]
        }

        const filesEncrypted = await getEncryptedFiles(
          file,
          asset.credentialSubject?.chainId,
          values.providerUrl.url
        )
        newFiles = filesEncrypted
      }

      const credentials = generateCredentials(values.credentials)

      const newService: Service = {
        id: getHash(datatokenAddress + newFiles),
        type: values.access,
        name: values.name,
        description: {
          '@value': values.description,
          '@direction': values.direction,
          '@language': values.language
        },
        files: newFiles || '',
        datatokenAddress,
        serviceEndpoint: values.providerUrl.url,
        timeout: mapTimeoutStringToSeconds(values.timeout),
        credentials,
        ...(values.access === 'compute' &&
          asset.credentialSubject?.metadata?.type === 'dataset' && {
            compute: await transformComputeFormToServiceComputeOptions(
              values,
              defaultServiceComputeOptions,
              asset.credentialSubject?.chainId,
              newCancelToken()
            )
          }),
        consumerParameters: transformConsumerParameters(
          values.consumerParameters
        ),
        state: State.Active
      }

      // update asset with new service
      const updatedAsset = { ...asset }
      updatedAsset.credentialSubject.services.push(newService)

      stringifyCredentialPolicies(updatedAsset.credentialSubject.credentials)
      updatedAsset.credentialSubject.services.forEach((service) => {
        stringifyCredentialPolicies(service.credentials)
      })

      // delete custom helper properties injected in the market so we don't write them on chain
      delete (updatedAsset as AssetExtended).accessDetails
      delete (updatedAsset as AssetExtended).views
      delete (updatedAsset as AssetExtended).offchain
      delete (updatedAsset as any).credentialSubject.stats

      const ipfsUpload: IpfsUpload = await signAssetAndUploadToIpfs(
        updatedAsset,
        signer,
        encryptAsset,
        customProviderUrl ||
          updatedAsset.credentialSubject.services[0]?.serviceEndpoint,
        ssiWalletContext
      )

      if (ipfsUpload /* && values.assetState !== assetState */) {
        const nft = new Nft(signer, updatedAsset.credentialSubject.chainId)

        await nft.setMetadata(
          updatedAsset.credentialSubject.nftAddress,
          await signer.getAddress(),
          0,
          customProviderUrl ||
            updatedAsset.credentialSubject.services[0]?.serviceEndpoint,
          '',
          ethers.utils.hexlify(ipfsUpload.flags),
          ipfsUpload.metadataIPFS,
          ipfsUpload.metadataIPFSHash
        )

        LoggerInstance.log('Version 5.0.0 Asset updated. ID:', updatedAsset.id)
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
      initialValues={getNewServiceInitialValues(
        accountId,
        asset.credentialSubject?.services[0]
      )}
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
            <FormAddService
              data={content.form.data}
              chainId={asset.credentialSubject?.chainId}
              assetType={asset.credentialSubject?.metadata?.type}
            />

            <Web3Feedback
              networkId={asset?.credentialSubject?.chainId}
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
                    description: {
                      '@value': '',
                      '@direction': '',
                      '@language': ''
                    },
                    files: asset.credentialSubject?.services[0].files,
                    serviceEndpoint:
                      asset.credentialSubject?.services[0].serviceEndpoint,
                    timeout: 0,
                    consumerParameters: [],
                    credentials: {
                      match_deny: 'any',
                      allow: [],
                      deny: []
                    },
                    state: State.Active
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
