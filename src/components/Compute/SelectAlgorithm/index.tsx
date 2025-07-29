import { ReactElement, useEffect, useState } from 'react'
import { useFormikContext, Field } from 'formik'
import { useAsset } from '@context/Asset'
import { useAccount } from 'wagmi'
import { useCancelToken } from '@hooks/useCancelToken'
import { FormComputeData } from '../_types'
import { AssetExtended } from 'src/@types/AssetExtended'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import {
  getAlgorithmsForAsset,
  getAlgorithmAssetSelectionList
} from '@utils/compute'
import { Service } from 'src/@types/ddo/Service'
import Input from '@shared/FormInput'
import styles from './index.module.css'
import PageHeader from '../../@shared/Page/PageHeader'

export default function SelectAlgorithm(): ReactElement {
  const { values } = useFormikContext<FormComputeData>()
  const { asset } = useAsset()
  const { address: accountId } = useAccount()
  const newCancelToken = useCancelToken()

  const [algorithms, setAlgorithms] = useState<AssetSelectionAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!asset || !accountId) return

    async function fetchAlgorithms() {
      try {
        setIsLoading(true)
        setError(undefined)

        // Get the compute service
        const computeService = asset.credentialSubject?.services?.find(
          (service) => service.type === 'compute'
        ) as Service

        if (!computeService) {
          setError('No compute service found for this asset')
          setIsLoading(false)
          return
        }

        // Fetch algorithms using the existing utility
        const algorithmsAssets = await getAlgorithmsForAsset(
          asset,
          computeService,
          newCancelToken()
        )

        // Transform to asset selection format
        const algorithmSelectionList = await getAlgorithmAssetSelectionList(
          computeService,
          algorithmsAssets,
          accountId
        )

        setAlgorithms(algorithmSelectionList)
      } catch (err) {
        console.error('Error fetching algorithms:', err)
        setError('Failed to load algorithms')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlgorithms()
  }, [asset, accountId, newCancelToken])

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2>Select Algorithm</h2>
        <p>Loading available algorithms...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2>Select Algorithm</h2>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  if (algorithms.length === 0) {
    return (
      <div className={styles.container}>
        <h2>Select Algorithm</h2>
        <p>No algorithms are available for this dataset.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <PageHeader title="Select Algorithm" />

      <div className={styles.algorithmSelection}>
        <Field
          component={Input}
          name="algorithm"
          type="assetSelection"
          options={algorithms}
          accountId={accountId}
          selected={values.algorithm}
          disabled={false}
          help="Select an algorithm to run on the dataset"
        />
      </div>
    </div>
  )
}
