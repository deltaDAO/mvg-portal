import { ReactElement, useState, useEffect } from 'react'
import Markdown from '@shared/Markdown'
import MetaFull from './MetaFull'
import MetaSecondary from './MetaSecondary'
import AssetActions from '../AssetActions'
import { useUserPreferences } from '@context/UserPreferences'
import Bookmark from './Bookmark'
import { useAsset } from '@context/Asset'
import Alert from '@shared/atoms/Alert'
import DebugOutput from '@shared/DebugOutput'
import MetaMain from './MetaMain'
import styles from './index.module.css'
import NetworkName from '@shared/NetworkName'
import content from '../../../../content/purgatory.json'
import Button from '@shared/atoms/Button'
import RelatedAssets from '../RelatedAssets'
import Web3Feedback from '@components/@shared/Web3Feedback'
import { useAccount } from 'wagmi'
import { decodePublish } from '@utils/invoice/publishInvoice'
import ServiceCard from './ServiceCard'
import { getPdf } from '@utils/invoice/createInvoice'
import { AssetExtended } from 'src/@types/AssetExtended'
import { LanguageValueObject } from 'src/@types/ddo/LanguageValueObject'

export default function AssetContent({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { isInPurgatory, purgatoryData, isOwner, isAssetNetwork } = useAsset()
  const { address: accountId } = useAccount()
  const { allowExternalContent, debug } = useUserPreferences()
  const [receipts, setReceipts] = useState([])
  const [nftPublisher, setNftPublisher] = useState<string>()
  const [selectedService, setSelectedService] = useState<number | undefined>()

  const [loadingInvoice, setLoadingInvoice] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [loadingInvoiceJson, setLoadingInvoiceJson] = useState(false)
  const [jsonInvoice, setJsonInvoice] = useState(null)

  async function handleGeneratePdf(id: string, tx: string) {
    try {
      setLoadingInvoice(true)
      let pdfUrlResponse: Blob[]
      if (!jsonInvoice) {
        const response = await decodePublish(
          id,
          tx,
          asset.credentialSubject.chainId
        )
        setJsonInvoice(jsonInvoice)
        pdfUrlResponse = await getPdf([response])
      } else {
        pdfUrlResponse = await getPdf([jsonInvoice])
      }
      if (pdfUrlResponse.length > 0) {
        setPdfUrl(pdfUrlResponse[0])
      }
    } catch (error) {
      // Handle error
      console.error('Error:', error)
    } finally {
      setLoadingInvoice(false)
    }
  }

  async function handleGenerateJson(id: string, tx: string) {
    try {
      setLoadingInvoiceJson(true)
      if (!jsonInvoice) {
        const response = await decodePublish(
          id,
          tx,
          asset.credentialSubject.chainId
        )
        setJsonInvoice(response)
      }
    } catch (error) {
      // Handle error
      console.error('Error:', error)
    } finally {
      setLoadingInvoiceJson(false)
    }
  }

  useEffect(() => {
    if (!receipts.length) return

    const publisher = receipts?.find((e) => e.type === 'METADATA_CREATED')
      ?.credentialSubject.nft?.owner
    setNftPublisher(publisher)
  }, [receipts])

  const isDescriptionIsString =
    typeof asset.credentialSubject?.metadata?.description === 'string'
  return (
    <>
      <div className={styles.networkWrap}>
        <NetworkName
          networkId={asset.credentialSubject?.chainId}
          className={styles.network}
        />
      </div>

      <article className={styles.grid}>
        <div>
          <div className={styles.content}>
            <MetaMain asset={asset} nftPublisher={nftPublisher} />
            <Bookmark did={asset.id} />
            {isInPurgatory === true ? (
              <Alert
                title={content.asset.title}
                badge={`Reason: ${purgatoryData?.reason}`}
                text={content.asset.description}
                state="error"
              />
            ) : isDescriptionIsString ? (
              <>
                <Markdown
                  className={styles.description}
                  text={
                    asset.credentialSubject?.metadata?.description['@value']
                  }
                  blockImages={!allowExternalContent}
                />
                <MetaSecondary ddo={asset} />
              </>
            ) : (
              <>
                <Markdown
                  className={styles.description}
                  text={
                    (
                      asset.credentialSubject?.metadata
                        ?.description as LanguageValueObject
                    )['@value'] || ''
                  }
                  blockImages={!allowExternalContent}
                />
                <MetaSecondary ddo={asset} />
              </>
            )}
            <MetaFull ddo={asset} />
            {debug === true && <DebugOutput title="DDO" output={asset} />}
          </div>
        </div>

        <div className={styles.actions}>
          {!asset.accessDetails ? (
            <p>Loading access details...</p>
          ) : (
            <>
              {selectedService === undefined ? (
                <>
                  <h3>Available services:</h3>
                  <h4>Please select one of the following:</h4>
                  <div className={styles.servicesGrid}>
                    {asset.credentialSubject?.services?.map(
                      (service, index) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          accessDetails={asset.accessDetails[index]}
                          onClick={() => setSelectedService(index)}
                        />
                      )
                    )}
                  </div>
                </>
              ) : (
                <AssetActions
                  asset={asset}
                  service={asset.credentialSubject?.services[selectedService]}
                  accessDetails={asset.accessDetails[selectedService]}
                  serviceIndex={selectedService}
                  handleBack={() => setSelectedService(undefined)}
                />
              )}
            </>
          )}
          {isOwner && isAssetNetwork && (
            <div className={styles.ownerActions}>
              <Button style="text" size="small" to={`/asset/${asset.id}/edit`}>
                Edit Asset
              </Button>
            </div>
          )}

          {isOwner && isAssetNetwork && (
            <div className={styles.ownerActions}>
              {pdfUrl ? (
                <a
                  href={URL.createObjectURL(pdfUrl)}
                  download={`${asset.id}.pdf`}
                >
                  Download Publish Invoice PDF
                </a>
              ) : (
                <Button
                  style="text"
                  size="small"
                  onClick={() =>
                    handleGeneratePdf(
                      asset.id,
                      asset.credentialSubject.event.txid
                    )
                  }
                  disabled={loadingInvoice}
                >
                  {loadingInvoice
                    ? 'Generating invoice PDF...'
                    : 'Generate Publish Invoice PDF'}
                </Button>
              )}
            </div>
          )}

          {isOwner && isAssetNetwork && (
            <div className={styles.ownerActions}>
              {jsonInvoice ? (
                <a
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(
                    JSON.stringify(jsonInvoice)
                  )}`}
                  download={`${asset.id}.json`}
                >
                  Download Publish Invoice JSON
                </a>
              ) : (
                <Button
                  style="text"
                  size="small"
                  onClick={() =>
                    handleGenerateJson(
                      asset.id,
                      asset.credentialSubject.event.txid
                    )
                  }
                  disabled={loadingInvoiceJson}
                >
                  {loadingInvoiceJson
                    ? 'Generating invoice JSON...'
                    : 'Generate Publish Invoice JSON'}
                </Button>
              )}
            </div>
          )}

          <Web3Feedback
            networkId={asset.credentialSubject?.chainId}
            accountId={accountId}
            isAssetNetwork={isAssetNetwork}
          />
          <RelatedAssets />
        </div>
      </article>
    </>
  )
}
