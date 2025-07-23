import { ReactElement, useCallback, useEffect, useState } from 'react'
import { Field, useFormikContext } from 'formik'
import Input from '@shared/FormInput'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import {
  generateBaseQuery,
  getFilterTerm,
  queryMetadata
} from '@utils/aquarius'
import { useCancelToken } from '@hooks/useCancelToken'
import { SortTermOptions } from '../../../@types/aquarius/SearchQuery'
import { transformAssetToAssetSelectionEdit } from '@utils/assetConverter'
import { ServiceEditForm } from './_types'
import content from '../../../../content/pages/editComputeDataset.json'
import { getFieldContent } from '@utils/form'
import { useAccount } from 'wagmi'
import { Compute, PublisherTrustedAlgorithms } from 'src/@types/ddo/Service'
import SectionContainer from '@shared/SectionContainer/SectionContainer'
import DeleteButton from '@shared/DeleteButton/DeleteButton'

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
  const newCancelToken = useCancelToken()
  const { values, setFieldValue } = useFormikContext<ServiceEditForm>()
  const [prevTrustedPublishers, setPrevTrustedPublishers] = useState<string[]>()
  const [allAlgorithms, setAllAlgorithms] = useState<AssetSelectionAsset[]>()

  useEffect(() => {
    if (
      values.allowAllPublishedAlgorithms === 'Allow any published algorithms'
    ) {
      if (
        values.publisherTrustedAlgorithmPublishers !==
        'Allow all trusted algorithm publishers'
      ) {
        setPrevTrustedPublishers([values.publisherTrustedAlgorithmPublishers])
        setFieldValue(
          'publisherTrustedAlgorithmPublishers',
          'Allow all trusted algorithm publishers'
        )
      }
    } else if (
      values.publisherTrustedAlgorithmPublishers ===
        'Allow all trusted algorithm publishers' &&
      prevTrustedPublishers
    ) {
      setFieldValue(
        'publisherTrustedAlgorithmPublishers',
        prevTrustedPublishers[0] ||
          'Allow specific trusted algorithm publishers'
      )
    }
  }, [values.allowAllPublishedAlgorithms])

  useEffect(() => {
    if (
      values.publisherTrustedAlgorithmPublishers ===
        'Allow all trusted algorithm publishers' &&
      values.allowAllPublishedAlgorithms !== 'Allow any published algorithms'
    ) {
      setFieldValue(
        'allowAllPublishedAlgorithms',
        'Allow any published algorithms'
      )
    } else if (
      values.allowAllPublishedAlgorithms === 'Allow any published algorithms' &&
      values.publisherTrustedAlgorithmPublishers !==
        'Allow all trusted algorithm publishers'
    ) {
      setFieldValue('allowAllPublishedAlgorithms', 'Allow selected algorithms')
    }
  }, [values.publisherTrustedAlgorithmPublishers])

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
      const algorithmSelectionList = await transformAssetToAssetSelectionEdit(
        serviceEndpoint,
        queryResult?.results || [],
        accountId,
        publisherTrustedAlgorithms,
        true
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
    <SectionContainer
      title="Set Allowed Algorithms"
      help="Only the algorithms selected here will be allowed to run on your dataset. Uncheck all to remove any access to your dataset."
    >
      {/* Card 1: Allow Algorithms + Selected Algorithms */}
      <SectionContainer border>
        <Field
          {...getFieldContent('allowAllPublishedAlgorithms', content.form.data)}
          component={Input}
          name="allowAllPublishedAlgorithms"
          selectStyle="publish"
        />

        <Field
          {...getFieldContent('publisherTrustedAlgorithms', content.form.data)}
          component={Input}
          name="publisherTrustedAlgorithms"
          options={allAlgorithms}
          disabled={
            values.allowAllPublishedAlgorithms ===
            'Allow any published algorithms'
          }
        />
      </SectionContainer>

      {/* Card 2: Allow Trusted Algorithm Publishers */}
      <SectionContainer border>
        <Field
          {...getFieldContent(
            'publisherTrustedAlgorithmPublishers',
            content.form.data
          )}
          component={Input}
          name="publisherTrustedAlgorithmPublishers"
          selectStyle="publish"
        />

        {values.publisherTrustedAlgorithmPublishers ===
          'Allow specific trusted algorithm publishers' && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end',
              width: '100%'
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <Field
                {...getFieldContent(
                  'publisherTrustedAlgorithmPublishersAddresses',
                  content.form.data
                )}
                component={Input}
                name="publisherTrustedAlgorithmPublishersAddresses"
                type="text"
                style={{ width: '100%' }}
                disabled={
                  values.allowAllPublishedAlgorithms ===
                  'Allow any published algorithms'
                }
              />
            </div>
            <DeleteButton
              onClick={() =>
                setFieldValue(
                  'publisherTrustedAlgorithmPublishersAddresses',
                  ''
                )
              }
              disabled={
                values.allowAllPublishedAlgorithms ===
                'Allow any published algorithms'
              }
            />
          </div>
        )}
      </SectionContainer>
    </SectionContainer>
  )
}
