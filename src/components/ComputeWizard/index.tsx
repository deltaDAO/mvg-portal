import { ReactElement, useState, useEffect, useRef } from 'react'
import { Form, Formik } from 'formik'
import { useAsset } from '@context/Asset'
import { useAccount } from 'wagmi'
import { useCancelToken } from '@hooks/useCancelToken'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import {
  getAlgorithmsForAsset,
  getAlgorithmAssetSelectionList
} from '@utils/compute'
import { getComputeEnvironments } from '@utils/provider'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import PageHeader from '@shared/Page/PageHeader'
import Title from './Title'
import styles from './index.module.css'
import Actions from './Actions'
import WizardActions from '@shared/WizardActions'
import Navigation from './Navigation'
import Steps from './Steps'
import { useUserPreferences } from '@context/UserPreferences'
import { validationSchema } from './_validation'
import ContainerForm from '../@shared/atoms/ContainerForm'
import { initialValues } from './_constants'

export default function ComputeWizard({
  content
}: {
  content: { title: string; description: string; warning: string }
}): ReactElement {
  const { debug } = useUserPreferences()
  const { asset } = useAsset()
  const { address: accountId } = useAccount()
  const newCancelToken = useCancelToken()

  const [algorithms, setAlgorithms] = useState<AssetSelectionAsset[]>([])
  const [computeEnvs, setComputeEnvs] = useState<ComputeEnvironment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  console.log('asset - testing ', asset)

  useEffect(() => {
    if (!asset || !accountId) return

    async function fetchData() {
      try {
        setIsLoading(true)
        setError(undefined)

        const computeService = asset.credentialSubject?.services?.find(
          (service) => service.type === 'compute'
        ) as any

        if (!computeService) {
          setError('No compute service found for this asset')
          setIsLoading(false)
          return
        }

        const algorithmsAssets = await getAlgorithmsForAsset(
          asset,
          computeService,
          newCancelToken()
        )

        const algorithmSelectionList = await getAlgorithmAssetSelectionList(
          computeService,
          algorithmsAssets,
          accountId
        )

        const environments = await getComputeEnvironments(
          computeService.serviceEndpoint,
          asset.credentialSubject?.chainId
        )

        setAlgorithms(algorithmSelectionList)
        setComputeEnvs(environments)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load compute data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [asset, accountId, newCancelToken])

  if (!asset) {
    return null
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2>Loading compute wizard...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2>Error</h2>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={async (values) => {
        console.log('Form submitted:', values)
      }}
    >
      {(formikContext) => (
        <>
          <PageHeader title={<Title asset={asset} />} isExtended />
          <Form className={styles.form}>
            <Navigation />
            <ContainerForm style="publish">
              <Steps algorithms={algorithms} computeEnvs={computeEnvs} />
              <WizardActions
                navigationType="path"
                basePath={`/asset/${asset?.id}/compute`}
                totalSteps={4}
                submitButtonText="Buy Dataset"
                showSuccessConfetti={false}
                formikContext={formikContext}
                rightAlignFirstStep={false}
              />
            </ContainerForm>
          </Form>
          {debug && (
            <div>Debug: {JSON.stringify(formikContext.values, null, 2)}</div>
          )}
        </>
      )}
    </Formik>
  )
}
