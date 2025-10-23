import { ReactElement, useState } from 'react'
import { Formik } from 'formik'
import { LoggerInstance, Nft } from '@oceanprotocol/lib'
import { metadataValidationSchema } from './_validation'
import { getInitialValues } from './_constants'
import { MetadataEditForm } from './_types'
import { useUserPreferences } from '@context/UserPreferences'
import Web3Feedback from '@shared/Web3Feedback'
import FormEditMetadata from './FormEditMetadata'
import styles from './index.module.css'
import content from '../../../../content/pages/editMetadata.json'
import DebugEditMetadata from './DebugEditMetadata'
import EditFeedback from './EditFeedback'
import { useAsset } from '@context/Asset'
import { sanitizeUrl } from '@utils/url'
import { useAccount, useSigner } from 'wagmi'
import {
  transformConsumerParameters,
  generateCredentials,
  signAssetAndUploadToIpfs,
  IpfsUpload,
  stringifyCredentialPolicies
} from '@components/Publish/_utils'
import { Metadata } from 'src/@types/ddo/Metadata'
import { Asset, AssetNft } from 'src/@types/Asset'
import { AssetExtended } from 'src/@types/AssetExtended'
import { customProviderUrl, encryptAsset } from '../../../../app.config.cjs'
import { ethers } from 'ethers'
import { isAddress } from 'ethers/lib/utils.js'
import { convertLinks } from '@utils/links'
import { License } from 'src/@types/ddo/License'
import { AdditionalVerifiableCredentials } from 'src/@types/ddo/AdditionalVerifiableCredentials'
import { useSsiWallet } from '@context/SsiWallet'
import { State } from 'src/@types/ddo/State'

export default function Edit({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { debug } = useUserPreferences()
  const { fetchAsset, isAssetNetwork, assetState } = useAsset()
  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const ssiWalletContext = useSsiWallet()

  const [success, setSuccess] = useState<string>()
  const [error, setError] = useState<string>()
  const hasFeedback = error || success

  async function handleSubmit(values: MetadataEditForm, resetForm: () => void) {
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

      const linksTransformed = values.links?.length &&
        values.links[0].valid && [sanitizeUrl(values.links[0].url)]

      let license: License
      if (!values.useRemoteLicense && values.licenseUrl[0]) {
        license = {
          name: values.licenseUrl[0].url,
          licenseDocuments: [
            {
              name: values.licenseUrl[0].url,
              fileType: values.licenseUrl[0].contentType,
              sha256: values.licenseUrl[0].checksum,
              mirrors: [
                {
                  type: values.licenseUrl[0].type,
                  method: values.licenseUrl[0].method,
                  url: values.licenseUrl[0].url
                }
              ]
            }
          ]
        }
      }

      const updatedMetadata: Metadata = {
        ...asset.credentialSubject?.metadata,
        name: values.name,
        description: {
          '@value': values.description,
          '@direction': '',
          '@language': ''
        },
        links: convertLinks(linksTransformed),
        author: values.author,
        tags: values.tags,
        license: values.useRemoteLicense ? values.uploadedLicense : license,
        additionalInformation: {
          ...asset.credentialSubject?.metadata?.additionalInformation
        }
      }

      if (asset.credentialSubject?.metadata.type === 'algorithm') {
        updatedMetadata.algorithm.consumerParameters =
          !values.usesConsumerParameters
            ? undefined
            : transformConsumerParameters(values.consumerParameters)
      }

      const updatedCredentials = generateCredentials(values?.credentials)
      const updatedNft: AssetNft = {
        ...asset.indexedMetadata.nft,
        state: State[values.assetState as unknown as keyof typeof State]
      }

      const updatedAsset: Asset = {
        ...(asset as Asset),
        credentialSubject: {
          ...(asset as Asset).credentialSubject,
          metadata: updatedMetadata,
          credentials: updatedCredentials
        },
        indexedMetadata: {
          ...asset?.indexedMetadata,
          nft: updatedNft
        },
        additionalDdos:
          (values?.additionalDdos as AdditionalVerifiableCredentials[]) || []
      }

      updatedAsset.credentialSubject.services =
        updatedAsset.credentialSubject.services.map((svc) => ({
          ...svc,
          credentials: generateCredentials(values?.credentials, true)
        }))

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
          updatedNft.state,
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
      initialValues={getInitialValues(
        asset?.credentialSubject?.metadata,
        asset?.credentialSubject?.credentials,
        asset?.additionalDdos,
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
              networkId={asset?.credentialSubject?.chainId}
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
