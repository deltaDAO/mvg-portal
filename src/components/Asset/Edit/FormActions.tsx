import { FormikContextType, useFormikContext } from 'formik'
import { ReactElement } from 'react'
import { useAsset } from '@context/Asset'
import Button from '@shared/atoms/Button'
import styles from './FormActions.module.css'
import Link from 'next/link'
import { MetadataEditForm, ServiceEditForm } from './_types'

export default function FormActions({
  handleClick
}: {
  handleClick?: () => void
}): ReactElement {
  const { isAssetNetwork, asset } = useAsset()
  const { isValid }: FormikContextType<MetadataEditForm | ServiceEditForm> =
    useFormikContext()

  const isSubmitDisabled = !isValid || !isAssetNetwork

  return (
    <footer className={styles.actions}>
      <Link href={`/asset/${asset?.id}`} key={asset?.id}>
        Cancel
      </Link>
      <Button style="publish" disabled={isSubmitDisabled} onClick={handleClick}>
        Submit
      </Button>
    </footer>
  )
}
