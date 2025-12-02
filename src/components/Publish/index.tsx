import { ReactElement, useState, useRef } from 'react'
import { Form, Formik } from 'formik'
import { initialPublishFeedback, initialValues } from './_constants'
import { useAccountPurgatory } from '@hooks/useAccountPurgatory'
import {
  createTokensAndPricing,
  signAssetAndUploadToIpfs,
  IpfsUpload,
  transformPublishFormToDdo
} from './_utils'
import PageHeader from '@shared/Page/PageHeader'
import Title from './Title'
import styles from './index.module.css'
import Actions from './Actions'
import Debug from './Debug'
import Navigation from './Navigation'
import { Steps } from './Steps'
import { FormPublishData } from './_types'
import { useUserPreferences } from '@context/UserPreferences'
import useNftFactory from '@hooks/useNftFactory'
import { LoggerInstance, Nft } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'
import { validationSchema } from './_validation'
import appConfig, { customProviderUrl } from '../../../app.config.cjs'
import { useAccount, useChainId } from 'wagmi'
import { Asset } from 'src/@types/Asset'
import { Signer, toBeHex } from 'ethers'
import { useSsiWallet } from '@context/SsiWallet'
import ContainerForm from '../@shared/atoms/ContainerForm'
import { useEthersSigner } from '@hooks/useEthersSigner'

export default function PublishPage({
  content
}: {
  content: { title: string; description: string; warning: string }
}): ReactElement {
  const { debug } = useUserPreferences()
  const { address: accountId } = useAccount()
  const walletClient = useEthersSigner()
  const chainId = useChainId()
  const { isInPurgatory, purgatoryData } = useAccountPurgatory(accountId)
  const scrollToRef = useRef()
  const nftFactory = useNftFactory()

  const signer = walletClient as unknown as Signer

  // This `feedback` state is auto-synced into Formik context under `values.feedback`
  // for use in other components. Syncing defined in ./Steps.tsx child component.
  const [feedback, setFeedback] = useState(initialPublishFeedback)

  // Collecting output of each publish step, enabling retry of failed steps
  const [erc721Address, setErc721Address] = useState<string>()
  const [datatokenAddress, setDatatokenAddress] = useState<string>()
  const [ddo, setDdo] = useState<Asset>()
  const [ipfsUpload, setIpdsUpload] = useState<IpfsUpload>()
  const [did, setDid] = useState<string>()
  const ssiWalletContext = useSsiWallet()

  // --------------------------------------------------
  // 1. Create NFT & datatokens & create pricing schema
  // --------------------------------------------------
  async function create(values: FormPublishData): Promise<{
    erc721Address: string
    datatokenAddress: string
  }> {
    setFeedback((prevState) => ({
      ...prevState,
      '1': {
        ...prevState['1'],
        status: 'active',
        errorMessage: null
      }
    }))

    try {
      if (!chainId) throw new Error('No chain ID detected.')
      const config = getOceanConfig(chainId)
      LoggerInstance.log('[publish] using config: ', config)

      const { erc721Address, datatokenAddress, txHash } =
        await createTokensAndPricing(values, accountId, config, nftFactory)

      const isSuccess = Boolean(erc721Address && datatokenAddress && txHash)
      if (!isSuccess) throw new Error('No Token created. Please try again.')

      LoggerInstance.log('[publish] createTokensAndPricing tx', txHash)
      LoggerInstance.log('[publish] erc721Address', erc721Address)
      LoggerInstance.log('[publish] datatokenAddress', datatokenAddress)

      setFeedback((prevState) => ({
        ...prevState,
        '1': {
          ...prevState['1'],
          status: 'success',
          txHash
        }
      }))

      return { erc721Address, datatokenAddress }
    } catch (error) {
      LoggerInstance.error('[publish] error', error.message)
      if (error.message.length > 65) {
        error.message = 'No Token created. Please try again.'
      }

      setFeedback((prevState) => ({
        ...prevState,
        '1': {
          ...prevState['1'],
          status: 'error',
          errorMessage: error.message
        }
      }))
    }
  }

  // --------------------------------------------------
  // 2. Construct and encrypt DDO
  // --------------------------------------------------
  async function encrypt(
    values: FormPublishData,
    erc721Address: string,
    datatokenAddress: string
  ): Promise<{ ddo: Asset; ipfsUpload: IpfsUpload }> {
    setFeedback((prevState) => ({
      ...prevState,
      '2': {
        ...prevState['2'],
        status: 'active',
        errorMessage: null
      }
    }))

    try {
      if (!datatokenAddress || !erc721Address)
        throw new Error('No NFT or Datatoken received. Please try again.')

      const ddo: Asset = await transformPublishFormToDdo(
        values,
        datatokenAddress,
        erc721Address
      )

      if (!ddo) throw new Error('No DDO received. Please try again.')

      setDdo(ddo)
      LoggerInstance.log('[publish] Got new DDO', ddo)

      const ipfsUpload: IpfsUpload = await signAssetAndUploadToIpfs(
        ddo,
        signer,
        appConfig.encryptAsset,
        customProviderUrl || values.services[0].providerUrl.url,
        ssiWalletContext
      )

      if (!ipfsUpload)
        throw new Error('No encrypted DDO received. Please try again.')

      setIpdsUpload(ipfsUpload)
      LoggerInstance.log('[publish] Got encrypted DDO', ipfsUpload.metadataIPFS)

      setFeedback((prevState) => ({
        ...prevState,
        '2': {
          ...prevState['2'],
          status: 'success'
        }
      }))

      return { ddo, ipfsUpload }
    } catch (error) {
      LoggerInstance.error('[publish] error', error.message)
      setFeedback((prevState) => ({
        ...prevState,
        '2': {
          ...prevState['2'],
          status: 'error',
          errorMessage: error.message
        }
      }))
    }
  }

  // --------------------------------------------------
  // 3. Write DDO into NFT metadata
  // --------------------------------------------------
  async function publish(
    values: FormPublishData,
    ddo: Asset,
    ipfsUpload: IpfsUpload,
    erc721Address: string
  ): Promise<{ did: string }> {
    console.log('Publishing to blockchain...')
    setFeedback((prevState) => ({
      ...prevState,
      '3': {
        ...prevState['3'],
        status: 'active',
        errorMessage: null
      }
    }))

    try {
      if (!ddo || !ipfsUpload)
        throw new Error('No DDO received. Please try again.')

      if (!signer)
        throw new Error('Wallet signer is required for blockchain transaction.')

      const userAddress = await signer.getAddress()
      console.log('User address:', userAddress)
      let attempts = 0
      const maxAttempts = 60

      while (attempts < maxAttempts) {
        try {
          const nftTemp = new Nft(signer, ddo.credentialSubject.chainId)
          console.log('Checking NFT permissions...')
          await nftTemp.getNftPermissions(erc721Address, userAddress)
          break
        } catch (e) {
          attempts++
          if (attempts >= maxAttempts) {
            throw new Error('Timeout waiting for permissions to be set')
          }
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      // Set metadata for the NFT
      const nft = new Nft(signer, ddo.credentialSubject.chainId)
      await nft.setMetadata(
        erc721Address,
        userAddress,
        0,
        customProviderUrl || values.services[0].providerUrl.url,
        '',
        toBeHex(ipfsUpload.flags),
        ipfsUpload.metadataIPFS,
        ipfsUpload.metadataIPFSHash
      )

      LoggerInstance.log('Version 5.0.0 Asset published. ID:', ddo.id)

      setFeedback((prevState) => ({
        ...prevState,
        '3': {
          ...prevState['3'],
          status: 'success'
        }
      }))

      return { did: ddo.id }
    } catch (error) {
      LoggerInstance.error('[publish] error', error.message)
      setFeedback((prevState) => ({
        ...prevState,
        '3': {
          ...prevState['3'],
          status: 'error',
          errorMessage: error.message
        }
      }))
    }
  }

  // --------------------------------------------------
  // Orchestrate publishing
  // --------------------------------------------------
  async function handleSubmit(values: FormPublishData) {
    // Syncing variables with state, enabling retry of failed steps
    let _erc721Address = erc721Address
    let _datatokenAddress = datatokenAddress
    let _ddo = ddo
    let _ipfsUpload = ipfsUpload
    let _did = did

    if (!_erc721Address || !_datatokenAddress) {
      const result = await create(values)
      if (result) {
        _erc721Address = result.erc721Address
        _datatokenAddress = result.datatokenAddress
        setErc721Address(result.erc721Address)
        setDatatokenAddress(result.datatokenAddress)
      } else {
        return
      }
    }

    if (!_ddo || !_ipfsUpload) {
      const result = await encrypt(values, _erc721Address, _datatokenAddress)
      if (result) {
        _ddo = result.ddo
        _ipfsUpload = result.ipfsUpload
        setDdo(result.ddo)
        setIpdsUpload(result.ipfsUpload)
      } else {
        return
      }
    }

    if (!_did) {
      const result = await publish(values, _ddo, _ipfsUpload, _erc721Address)
      if (result) {
        _did = result.did
        setDid(result.did)
      } else {
        // Stop if publishing failed
      }
    }
  }

  return isInPurgatory && purgatoryData ? null : (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={async (values) => {
        // kick off publishing
        await handleSubmit(values)
      }}
    >
      {(formikContext) => (
        <>
          <PageHeader
            title={<Title networkId={formikContext.values.user.chainId} />}
            description={content.description}
            isExtended
          />
          <Form className={styles.form} ref={scrollToRef}>
            <Navigation />
            <ContainerForm style="publish">
              <Steps feedback={feedback} />
              <Actions scrollToRef={scrollToRef} did={did} />
            </ContainerForm>
          </Form>
          {debug && <Debug />}
        </>
      )}
    </Formik>
  )
}
