import { ReactElement, useState, useEffect } from 'react'
import MetaItem from './MetaItem'
import styles from './MetaFull.module.css'
import Publisher from '@shared/Publisher'
import { useAsset } from '@context/Asset'
import { LoggerInstance, Datatoken } from '@oceanprotocol/lib'
import { getDummySigner } from '@utils/wallet'
import { Asset } from 'src/@types/Asset'
import { IpfsRemoteSource } from '@components/@shared/IpfsRemoteSource'
import Label from '@components/@shared/FormInput/Label'

export default function MetaFull({ ddo }: { ddo: Asset }): ReactElement {
  const { isInPurgatory, assetState } = useAsset()

  const [paymentCollector, setPaymentCollector] = useState<string>()

  useEffect(() => {
    if (!ddo) return

    async function getInitialPaymentCollector() {
      try {
        const signer = await getDummySigner(ddo.credentialSubject?.chainId)
        const datatoken = new Datatoken(signer, ddo.credentialSubject?.chainId)
        setPaymentCollector(
          await datatoken.getPaymentCollector(
            ddo.credentialSubject.datatokens[0].address
          )
        )
      } catch (error) {
        LoggerInstance.error(
          '[MetaFull: getInitialPaymentCollector]',
          error.message
        )
      }
    }
    getInitialPaymentCollector()
  }, [ddo])

  function DockerImage() {
    const containerInfo = ddo?.credentialSubject.metadata?.algorithm?.container
    const { image, tag } = containerInfo
    return <span>{`${image}:${tag}`}</span>
  }

  return ddo ? (
    <div className={styles.metaFull}>
      {!isInPurgatory && (
        <MetaItem
          title="Data Author"
          content={ddo?.credentialSubject.metadata?.author}
        />
      )}
      <MetaItem
        title="Owner"
        content={<Publisher account={ddo?.credentialSubject.nft?.owner} />}
      />
      {assetState !== 'Active' && (
        <MetaItem title="Asset State" content={assetState} />
      )}
      {paymentCollector &&
        paymentCollector !== ddo?.credentialSubject.nft?.owner && (
          <MetaItem
            title="Revenue Sent To"
            content={<Publisher account={paymentCollector} />}
          />
        )}

      {ddo?.credentialSubject.metadata?.type === 'algorithm' &&
        ddo?.credentialSubject.metadata?.algorithm && (
          <MetaItem title="Docker Image" content={<DockerImage />} />
        )}
      <MetaItem title="DID" content={<code>{ddo?.id}</code>} />
      <div>
        <Label htmlFor="license">
          <strong>License</strong>
        </Label>
        {ddo.credentialSubject.metadata.license?.licenseDocuments?.[0]
          ?.mirrors?.[0]?.type === 'url' ? (
          <a
            target="_blank"
            href={
              ddo.credentialSubject.metadata.license.licenseDocuments[0]
                .mirrors[0].url
            }
            rel="noreferrer"
          >
            {ddo.credentialSubject.metadata.license.licenseDocuments[0].name}
          </a>
        ) : (
          <IpfsRemoteSource
            noDocumentLabel="No license document available"
            remoteSource={ddo.credentialSubject?.metadata?.license?.licenseDocuments
              ?.at(0)
              ?.mirrors?.at(0)}
          ></IpfsRemoteSource>
        )}
      </div>
    </div>
  ) : null
}
