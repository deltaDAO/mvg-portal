import { ReactElement, useCallback, useEffect, useState } from 'react'
import { Field, FormikContextType, useFormikContext } from 'formik'
import Input from '@shared/FormInput'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import stylesIndex from './index.module.css'
import {
  generateBaseQuery,
  getFilterTerm,
  queryMetadata
} from '@utils/aquarius'
import { useCancelToken } from '@hooks/useCancelToken'
import { SortTermOptions } from '../../../@types/aquarius/SearchQuery'
import { transformAssetToAssetSelection } from '@utils/assetConverter'
import { ServiceEditForm } from './_types'
import content from '../../../../content/pages/editComputeDataset.json'
import { getFieldContent } from '@utils/form'
import { useAccount } from 'wagmi'
import { Compute, PublisherTrustedAlgorithms } from 'src/@types/ddo/Service'

export default function FormEditComputeService({
  chainId,
  serviceEndpoint,
  serviceCompute
}: {
  chainId: number
  serviceEndpoint: string
  serviceCompute: Compute
}): ReactElement {
  const { address: accountId } = useAccount()
  const { values }: FormikContextType<ServiceEditForm> = useFormikContext()
  const newCancelToken = useCancelToken()

  const [allAlgorithms, setAllAlgorithms] = useState<AssetSelectionAsset[]>()

  const getAlgorithmList = useCallback(
    async (
      publisherTrustedAlgorithms: PublisherTrustedAlgorithms[]
    ): Promise<AssetSelectionAsset[]> => {
      const baseParams = {
        chainIds: [chainId],
        sort: { sortBy: SortTermOptions.Created },
        filters: [getFilterTerm('credentialSubject.metadata.type', 'algorithm')]
      } as BaseQueryParams

      const query = generateBaseQuery(baseParams)
      const queryResult = await queryMetadata(query, newCancelToken())
      const algorithmSelectionList = await transformAssetToAssetSelection(
        serviceEndpoint,
        queryResult?.results || [],
        accountId,
        publisherTrustedAlgorithms
      )
      return algorithmSelectionList
    },
    [accountId, chainId, newCancelToken, serviceEndpoint]
  )

  useEffect(() => {
    const { publisherTrustedAlgorithms } = serviceCompute

    getAlgorithmList(publisherTrustedAlgorithms).then((algorithms) => {
      setAllAlgorithms(algorithms)
    })
  }, [serviceCompute, getAlgorithmList])

  return (
    <>
      <header className={stylesIndex.headerForm}>
        <h3 className={stylesIndex.titleForm}>{content.form.title}</h3>
        <p className={stylesIndex.descriptionForm}>
          {content.form.description}
        </p>
      </header>

      <Field
        {...getFieldContent('publisherTrustedAlgorithms', content.form.data)}
        component={Input}
        name="publisherTrustedAlgorithms"
        options={allAlgorithms}
        disabled={values.allowAllPublishedAlgorithms}
      />

      <Field
        {...getFieldContent('allowAllPublishedAlgorithms', content.form.data)}
        component={Input}
        name="allowAllPublishedAlgorithms"
        options={
          getFieldContent('allowAllPublishedAlgorithms', content.form.data)
            .options
        }
      />

      <Field
        {...getFieldContent(
          'publisherTrustedAlgorithmPublishers',
          content.form.data
        )}
        component={Input}
        name="publisherTrustedAlgorithmPublishers"
        options={
          getFieldContent(
            'publisherTrustedAlgorithmPublishers',
            content.form.data
          ).options
        }
      />
    </>
  )
}
