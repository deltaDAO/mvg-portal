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
import {
  isAddress,
  JsonRpcProvider,
  parseEther,
  ethers,
  Signer,
  toBeHex
} from 'ethers'
import EditFeedback from './EditFeedback'
import { useAsset } from '@context/Asset'
import { getEncryptedFiles } from '@utils/provider'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
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
import FormAddService from './FormAddService'
import { transformComputeFormToServiceComputeOptions } from '@utils/compute'
import { useCancelToken } from '@hooks/useCancelToken'
import { newServiceValidationSchema } from './_validation'
import DebugEditService from './DebugEditService'
import styles from './index.module.css'
import { useUserPreferences } from '@context/UserPreferences'
import { getOceanConfig } from '@utils/ocean'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { State } from 'src/@types/ddo/State'
import { useSsiWallet } from '@context/SsiWallet'
import { getTokenInfo } from '@utils/wallet'
import { useEthersSigner } from '@hooks/useEthersSigner'

export default function AddService({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { debug } = useUserPreferences()
  const { fetchAsset, isAssetNetwork } = useAsset()
  const { address: accountId } = useAccount()
  const chainId = useChainId()
  const walletClient = useEthersSigner()
  const publicClient = usePublicClient()
  const newCancelToken = useCancelToken()
  const config = getOceanConfig(asset?.credentialSubject?.chainId)
  const ssiWalletContext = useSsiWallet()

  const rpcUrl = getOceanConfig(chainId)?.nodeUri

  const ethersProvider =
    publicClient && rpcUrl ? new JsonRpcProvider(rpcUrl) : undefined

  const signer = walletClient as unknown as Signer

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

      if (!signer) {
        setError('Wallet not connected or signer unavailable.')
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

      // Wait until the datatoken contract is live and callable
      const dtContract = new ethers.Contract(
        datatokenAddress,
        ['function isERC20Deployer(address user) view returns (bool)'],
        signer
      )

      let deployerReady = false
      for (let retries = 0; retries < 20; retries++) {
        try {
          const ok = await dtContract.isERC20Deployer(accountId)
          if (ok) {
            deployerReady = true
            break
          }
        } catch (err) {
          console.log(
            `[AddService] isERC20Deployer call reverted (retry ${retries})...`
          )
        }
        await new Promise((resolve) => setTimeout(resolve, 1500)) // wait 1.5s
      }

      if (!deployerReady) {
        console.error('[AddService] Deployer not ready after waiting.')
        throw new Error('Deployer permission not confirmed on chain.')
      }

      // --------------------------------------------------
      // 2. Create Pricing
      // --------------------------------------------------
      const datatoken = new Datatoken(signer)

      let pricingTransactionReceipt
      if (values.price > 0) {
        LoggerInstance.log(
          `Creating fixed rate exchange with price ${values.price} for datatoken ${datatokenAddress}`
        )

        const tokenInfo = await getTokenInfo(
          config.oceanTokenAddress,
          ethersProvider
        )

        const freParams: FreCreationParams = {
          fixedRateAddress: config.fixedRateExchangeAddress,
          baseTokenAddress: config.oceanTokenAddress,
          owner: accountId,
          marketFeeCollector: marketFeeAddress,
          baseTokenDecimals: tokenInfo?.decimals || 18,
          datatokenDecimals: 18,
          fixedRate: values.price.toString(),
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
          maxTokens: parseEther('1').toString(),
          maxBalance: parseEther('1').toString(),
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
      // 3. Update DDO
      // --------------------------------------------------
      let newFiles = asset.credentialSubject?.services[0].files
      if (values.files[0]?.url) {
        const file = {
          nftAddress: asset.credentialSubject.nftAddress,
          datatokenAddress,
          files: [normalizeFile(values.files[0].type, values.files[0], chainId)]
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

      const updatedAsset = { ...asset }
      updatedAsset.credentialSubject.services.push(newService)

      stringifyCredentialPolicies(updatedAsset.credentialSubject.credentials)
      updatedAsset.credentialSubject.services.forEach((service) => {
        stringifyCredentialPolicies(service.credentials)
      })

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

      if (ipfsUpload) {
        const nft = new Nft(signer, updatedAsset.credentialSubject.chainId)

        await nft.setMetadata(
          updatedAsset.credentialSubject.nftAddress,
          await signer.getAddress(),
          0,
          customProviderUrl ||
            updatedAsset.credentialSubject.services[0]?.serviceEndpoint,
          '',
          toBeHex(ipfsUpload.flags),
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
      console.error('[AddService] Error caught:', error)
    }
  }

  return (
    <Formik
      enableReinitialize
      initialValues={getNewServiceInitialValues(
        accountId,
        asset.credentialSubject?.services[0]
      )}
      validationSchema={newServiceValidationSchema}
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
