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
import { useAccount, useSigner } from 'wagmi'
import { decodePublish } from '@utils/invoice/publishInvoice'
import ServiceCard from './ServiceCard'
import { getPdf } from '@utils/invoice/createInvoice'
import { AssetExtended } from 'src/@types/AssetExtended'
import { LanguageValueObject } from 'src/@types/ddo/LanguageValueObject'
import MetaInfo from './MetaMain/MetaInfo'
import EditIcon from '@images/edit.svg'
import { useRouter } from 'next/router'
import ComputeJobs from '@components/@shared/ComputeJobs'
import ComputeWizard from '@components/DatasetComputeWizard'

export default function AssetContent({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { isInPurgatory, purgatoryData, isOwner, isAssetNetwork } = useAsset()
  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const { allowExternalContent, debug } = useUserPreferences()
  const [receipts, setReceipts] = useState([])
  const [nftPublisher, setNftPublisher] = useState<string>()
  const [selectedService, setSelectedService] = useState<number | undefined>()

  const [loadingInvoice, setLoadingInvoice] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [loadingInvoiceJson, setLoadingInvoiceJson] = useState(false)
  const [jsonInvoice, setJsonInvoice] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showCompute, setShowCompute] = useState(false)
  const [showComputeWizard, setShowComputeWizard] = useState(false)
  const [dtBalance, setDtBalance] = useState<string>('0')
  const [fileMetadata, setFileMetadata] = useState<any>(null)
  const [isAccountIdWhitelisted, setIsAccountIdWhitelisted] =
    useState<boolean>(false)
  const [computeJobsRefetchTrigger, setComputeJobsRefetchTrigger] = useState(0)
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  const availableServices =
    asset.credentialSubject?.services?.filter(
      (service) => service.state === 0
    ) || []

  // Find compute service
  const computeServiceIndex = asset.credentialSubject?.services?.findIndex(
    (service) => service.type === 'compute'
  )

  function handleComputeClick() {
    if (computeServiceIndex !== undefined && computeServiceIndex >= 0) {
      setSelectedService(computeServiceIndex)
      setShowCompute(true)
    }
  }

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
      ?.indexedMetadata.nft?.owner
    setNftPublisher(publisher)
  }, [receipts])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        !(event.target as Element).closest(`.${styles.invoiceDropdown}`)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const isDescriptionIsString =
    typeof asset.credentialSubject?.metadata?.description === 'string'
  return (
    <>
      <article className={styles.grid}>
        <div>
          <div className={styles.metaMenu}>
            {' '}
            <MetaMain asset={asset} nftPublisher={nftPublisher} />
            <Bookmark did={asset.id} />
          </div>
          <div className={styles.content}>
            <div className={styles.publisherInfo}>
              <MetaInfo asset={asset} nftPublisher={nftPublisher} />
            </div>
            <span className={styles.assetName}>
              {asset.credentialSubject?.metadata?.name || ''}
            </span>
            {isInPurgatory === true ? (
              <Alert
                title={content.asset.title}
                badge={`Reason: ${purgatoryData?.reason}`}
                text={content.asset.description}
                state="error"
              />
            ) : isDescriptionIsString ? (
              <>
                <div className={styles.descriptionWrapper}>
                  <div
                    className={`${styles.description} ${
                      expanded ? styles.expanded : styles.collapsed
                    }`}
                  >
                    <Markdown
                      text={
                        asset.credentialSubject?.metadata?.description[
                          '@value'
                        ] || ''
                      }
                      blockImages={!allowExternalContent}
                    />
                  </div>

                  {asset.credentialSubject?.metadata?.description['@value']
                    ?.length > 80 && (
                    <span
                      className={styles.toggle}
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? 'Show less' : 'Show more'}
                    </span>
                  )}
                </div>
                <MetaSecondary ddo={asset} />
              </>
            ) : (
              <>
                <div className={styles.descriptionWrapper}>
                  <div
                    className={`${styles.description} ${
                      expanded ? styles.expanded : styles.collapsed
                    }`}
                  >
                    <Markdown
                      text={
                        (
                          asset.credentialSubject?.metadata
                            ?.description as LanguageValueObject
                        )['@value'] || ''
                      }
                      blockImages={!allowExternalContent}
                    />
                  </div>

                  {(
                    asset.credentialSubject?.metadata
                      ?.description as LanguageValueObject
                  )['@value']?.length > 80 && (
                    <span
                      className={styles.toggle}
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? 'Show less' : 'Show more'}
                    </span>
                  )}
                </div>
                <MetaSecondary ddo={asset} />
              </>
            )}
            <MetaFull ddo={asset} />
            {debug === true && <DebugOutput title="DDO" output={asset} />}
          </div>
          <ComputeJobs
            asset={asset}
            refetchTrigger={computeJobsRefetchTrigger}
          />
        </div>

        <div className={styles.actions}>
          <NetworkName
            networkId={asset.credentialSubject?.chainId}
            className={styles.network}
          />
          <Web3Feedback
            networkId={asset.credentialSubject?.chainId}
            accountId={accountId}
            isAssetNetwork={isAssetNetwork}
          />
          {!asset.accessDetails ? (
            <p>Loading access details...</p>
          ) : (
            <>
              {asset?.indexedMetadata?.nft?.state === 0 ? (
                selectedService === undefined ? (
                  <>
                    {/* <h3> Available Assets:</h3> */}
                    {availableServices.length > 0 ? (
                      <div className={styles.serviceDisplay}>
                        <h4>Choose service to see Price:</h4>
                        <div className={styles.servicesGrid}>
                          {availableServices.map((service, index) => (
                            <ServiceCard
                              key={service.id}
                              service={service}
                              accessDetails={asset.accessDetails[index]}
                              onClick={() => setSelectedService(index)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <h4>No services are currently available.</h4>
                    )}
                  </>
                ) : (
                  <AssetActions
                    asset={asset}
                    service={asset.credentialSubject?.services[selectedService]}
                    accessDetails={asset.accessDetails[selectedService]}
                    serviceIndex={selectedService}
                    handleBack={() => setSelectedService(undefined)}
                    onComputeJobCreated={() =>
                      setComputeJobsRefetchTrigger((prev) => prev + 1)
                    }
                  />
                )
              ) : (
                <h4>
                  {asset?.indexedMetadata?.nft?.owner === accountId
                    ? 'You are the asset owner.'
                    : 'Services cannot be ordered.'}
                </h4>
              )}
            </>
          )}
          {isOwner && isAssetNetwork && (
            <div className={styles.ownerButtonsContainer}>
              <a href={`/asset/${asset.id}/edit`} className={styles.editButton}>
                <EditIcon className={styles.editIcon} />
                Edit Asset
              </a>

              <div
                className={`${styles.invoiceDropdown} ${
                  isDropdownOpen ? styles.open : ''
                }`}
              >
                <button
                  className={styles.invoiceButton}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  Generate Publish Invoice
                  <div className={styles.dropdownArrow} />
                </button>

                <div className={styles.dropdownMenu}>
                  {pdfUrl ? (
                    <a
                      href={URL.createObjectURL(pdfUrl)}
                      download={`${asset.id}.pdf`}
                      className={styles.dropdownItem}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Download PDF
                    </a>
                  ) : (
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        handleGeneratePdf(
                          asset.id,
                          asset.indexedMetadata?.event.txid
                        )
                        setIsDropdownOpen(false)
                      }}
                      disabled={loadingInvoice}
                    >
                      {loadingInvoice ? (
                        <span className={styles.loadingText}>
                          Generating PDF...
                        </span>
                      ) : (
                        'Generate PDF'
                      )}
                    </button>
                  )}

                  {jsonInvoice ? (
                    <a
                      href={`data:text/json;charset=utf-8,${encodeURIComponent(
                        JSON.stringify(jsonInvoice)
                      )}`}
                      download={`${asset.id}.json`}
                      className={styles.dropdownItem}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Download JSON
                    </a>
                  ) : (
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        handleGenerateJson(
                          asset.id,
                          asset.indexedMetadata?.event.txid
                        )
                        setIsDropdownOpen(false)
                      }}
                      disabled={loadingInvoiceJson}
                    >
                      {loadingInvoiceJson ? (
                        <span className={styles.loadingText}>
                          Generating JSON...
                        </span>
                      ) : (
                        'Generate JSON'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </article>
      <RelatedAssets />

      {/* ComputeWizard Full-Page Overlay */}
      {/* {showComputeWizard && selectedService !== undefined && (
        <div className={styles.computeWizardOverlay}>
          <div className={styles.computeWizardContainer}>
            <div className={styles.computeWizardHeader}>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowComputeWizard(false)
                  setSelectedService(undefined)
                }}
              >
                ✕ Close
              </button>
            </div>
            <ComputeWizard
              asset={asset}
              service={asset.credentialSubject?.services[selectedService]}
              accessDetails={asset.accessDetails[selectedService]}
              accountId={accountId}
              signer={signer}
              dtBalance={dtBalance || '0'}
              file={fileMetadata}
              isAccountIdWhitelisted={isAccountIdWhitelisted || false}
            />
          </div>
        </div>
      )} */}
    </>
  )
}
