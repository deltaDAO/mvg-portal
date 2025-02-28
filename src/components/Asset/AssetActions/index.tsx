import { ReactElement, useState, useEffect } from 'react'
import Compute from './Compute'
import Download from './Download'
import { FileInfo, LoggerInstance, Datatoken } from '@oceanprotocol/lib'
import { compareAsBN } from '@utils/numbers'
import { useAsset } from '@context/Asset'
import { getFileDidInfo, getFileInfo } from '@utils/provider'
import { getOceanConfig } from '@utils/ocean'
import { useCancelToken } from '@hooks/useCancelToken'
import { useIsMounted } from '@hooks/useIsMounted'
import styles from './index.module.css'
import { useFormikContext } from 'formik'
import { FormPublishData } from '@components/Publish/_types'
import { getTokenBalanceFromSymbol } from '@utils/wallet'
import AssetStats from './AssetStats'
import { isAddressWhitelisted } from '@utils/ddo'
import { useAccount, useProvider, useNetwork, useSigner } from 'wagmi'
import useBalance from '@hooks/useBalance'
import Button from '@components/@shared/atoms/Button'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'

export default function AssetActions({
  asset,
  service,
  accessDetails,
  serviceIndex,
  handleBack
}: {
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  serviceIndex: number
  handleBack: () => void
}): ReactElement {
  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const { balance } = useBalance()
  const { chain } = useNetwork()
  const web3Provider = useProvider()
  const { isAssetNetwork } = useAsset()
  const newCancelToken = useCancelToken()
  const isMounted = useIsMounted()

  // TODO: using this for the publish preview works fine, but produces a console warning
  // on asset details page as there is no formik context there:
  // Warning: Formik context is undefined, please verify you are calling useFormikContext()
  // as child of a <Formik> component.
  const formikState = useFormikContext<FormPublishData>()

  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>()
  const [dtBalance, setDtBalance] = useState<string>()
  const [fileMetadata, setFileMetadata] = useState<FileInfo>()
  const [fileIsLoading, setFileIsLoading] = useState<boolean>(false)
  const [isAccountIdWhitelisted, setIsAccountIdWhitelisted] =
    useState<boolean>()

  const isCompute = service.type === 'compute'

  // Get and set file info
  useEffect(() => {
    const oceanConfig = getOceanConfig(asset.credentialSubject?.chainId)
    if (!oceanConfig) return

    async function initFileInfo() {
      setFileIsLoading(true)
      const providerUrl =
        formikState?.values?.services[serviceIndex].providerUrl.url ||
        service.serviceEndpoint

      const storageType = formikState?.values?.services
        ? formikState?.values?.services[serviceIndex].files[0].type
        : null

      // TODO: replace 'any' with correct typing
      const file = formikState?.values?.services[serviceIndex].files[0] as any
      const query = file?.query || undefined
      const abi = file?.abi || undefined
      const headers = file?.headers || undefined
      const method = file?.method || undefined

      try {
        const fileInfoResponse = formikState?.values?.services?.[serviceIndex]
          .files?.[0].url
          ? await getFileInfo(
              formikState?.values?.services?.[serviceIndex].files?.[0].url,
              providerUrl,
              storageType,
              query,
              headers,
              abi,
              chain?.id,
              method
            )
          : await getFileDidInfo(asset.id, service.id, providerUrl)

        fileInfoResponse && setFileMetadata(fileInfoResponse[0])

        // set the content type in the Dataset Schema
        const datasetSchema = document.scripts?.namedItem('datasetSchema')
        if (datasetSchema) {
          const datasetSchemaJSON = JSON.parse(datasetSchema.innerText)
          if (datasetSchemaJSON?.distribution[0]['@type'] === 'DataDownload') {
            const contentType = fileInfoResponse[0]?.contentType
            datasetSchemaJSON.distribution[0].encodingFormat = contentType
            datasetSchema.innerText = JSON.stringify(datasetSchemaJSON)
          }
        }

        setFileIsLoading(false)
      } catch (error) {
        setFileIsLoading(false)
        LoggerInstance.error(error.message)
      }
    }
    initFileInfo()
  }, [
    asset,
    isMounted,
    newCancelToken,
    formikState?.values?.services,
    serviceIndex,
    chain?.id,
    service.serviceEndpoint,
    service.id
  ])

  // Get and set user DT balance
  useEffect(() => {
    if (!web3Provider || !accountId || !isAssetNetwork) return

    async function init() {
      try {
        const datatokenInstance = new Datatoken(web3Provider as any)
        const dtBalance = await datatokenInstance.balance(
          service.datatokenAddress,
          accountId
        )
        setDtBalance(dtBalance)
      } catch (e) {
        LoggerInstance.error(e.message)
      }
    }
    init()
  }, [web3Provider, accountId, isAssetNetwork, service.datatokenAddress])

  // Check user balance against price
  useEffect(() => {
    if (accessDetails.type === 'free') setIsBalanceSufficient(true)
    if (
      !accessDetails.price ||
      !accessDetails.baseToken?.symbol ||
      !accountId ||
      !balance ||
      !dtBalance
    )
      return

    const baseTokenBalance = getTokenBalanceFromSymbol(
      balance,
      accessDetails.baseToken?.symbol
    )

    setIsBalanceSufficient(
      compareAsBN(baseTokenBalance, `${accessDetails.price}`) ||
        Number(dtBalance) >= 1
    )

    return () => {
      setIsBalanceSufficient(false)
    }
  }, [balance, accountId, dtBalance, accessDetails])

  // check for if user is whitelisted or blacklisted
  useEffect(() => {
    if (!asset || !accountId) return

    setIsAccountIdWhitelisted(isAddressWhitelisted(asset, accountId, service))
  }, [accountId, asset])

  return (
    <>
      <Button style="text" size="small" onClick={handleBack}>
        Back
      </Button>
      <div className={styles.actions}>
        {isCompute ? (
          <Compute
            accountId={accountId}
            signer={signer}
            asset={asset}
            service={service}
            accessDetails={accessDetails}
            dtBalance={dtBalance}
            isAccountIdWhitelisted={isAccountIdWhitelisted}
            file={fileMetadata}
            fileIsLoading={fileIsLoading}
          />
        ) : (
          <Download
            accountId={accountId}
            signer={signer}
            asset={asset}
            service={service}
            accessDetails={accessDetails}
            serviceIndex={serviceIndex}
            dtBalance={dtBalance}
            isBalanceSufficient={isBalanceSufficient}
            isAccountIdWhitelisted={isAccountIdWhitelisted}
            file={fileMetadata}
            fileIsLoading={fileIsLoading}
          />
        )}
        <AssetStats />
      </div>
    </>
  )
}
