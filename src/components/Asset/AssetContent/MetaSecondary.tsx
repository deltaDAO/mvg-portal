import { ReactElement } from 'react'
import MetaItem from './MetaItem'
import styles from './MetaSecondary.module.css'
import Tags from '@shared/atoms/Tags'
import Button from '@shared/atoms/Button'
import { Asset } from 'src/@types/Asset'

const SampleButton = ({ url }: { url: string }) => (
  <Button
    href={url}
    target="_blank"
    rel="noreferrer"
    download
    style="text"
    size="small"
  >
    Download Sample
  </Button>
)

export default function MetaSecondary({ ddo }: { ddo: Asset }): ReactElement {
  return (
    <aside className={styles.metaSecondary}>
      {ddo?.credentialSubject?.metadata?.links &&
        Object.values(ddo?.credentialSubject?.metadata?.links).length > 0 && (
          <div className={styles.samples}>
            <MetaItem
              title="Sample Data"
              content={
                <SampleButton
                  url={
                    Object.values(ddo?.credentialSubject?.metadata?.links)[0]
                  }
                />
              }
            />
          </div>
        )}
      {ddo?.credentialSubject?.metadata?.tags?.length > 0 && (
        <Tags items={ddo?.credentialSubject?.metadata?.tags} />
      )}
    </aside>
  )
}
