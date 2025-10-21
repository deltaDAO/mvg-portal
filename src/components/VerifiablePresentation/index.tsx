import { GaiaXVerifiablePresentation } from '@utils/verifiablePresentations/types'
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import styles from './index.module.css'
import { VerifiablePresentationVerification } from './VerifiablePresentationVerification'

interface VerifiablePresentationProperties {
  verifiablePresentation: GaiaXVerifiablePresentation
  index: number
}

export const VerifiablePresentation = ({
  verifiablePresentation,
  index
}: Readonly<VerifiablePresentationProperties>): JSX.Element => {
  return (
    <div className={styles.container}>
      <VerifiablePresentationVerification
        verifiablePresentation={verifiablePresentation}
        index={index}
        className={styles.credentials}
      />
      <JsonView src={verifiablePresentation} className={styles.contents} />
    </div>
  )
}
