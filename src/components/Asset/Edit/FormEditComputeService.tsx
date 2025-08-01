import { ReactElement, useCallback, useEffect, useState, useRef } from 'react'
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
import Button from '@shared/atoms/Button'
import AddAddress from '@images/add_param.svg'
import styles from './index.module.css'

const ALLOW_ANY_PUBLISHED_ALGORITHMS = 'Allow any published algorithms'
const ALLOW_SELECTED_ALGORITHMS = 'Allow selected algorithms'
const ALLOW_ALL_TRUSTED_ALGORITHM_PUBLISHERS =
  'Allow all trusted algorithm publishers'
const ALLOW_SPECIFIC_TRUSTED_ALGORITHM_PUBLISHERS =
  'Allow specific trusted algorithm publishers'

const isAllowAnyPublishedAlgorithms = (value: string) =>
  value === ALLOW_ANY_PUBLISHED_ALGORITHMS
const isAllowAllTrustedAlgorithmPublishers = (value: string) =>
  value === ALLOW_ALL_TRUSTED_ALGORITHM_PUBLISHERS

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
  const { values, setFieldValue } = useFormikContext<Record<string, any>>()
  const [allAlgorithms, setAllAlgorithms] = useState<AssetSelectionAsset[]>()
  const [addressInputValue, setAddressInputValue] = useState('')
  const [addressList, setAddressList] = useState<string[]>([])
  const isUpdatingRef = useRef(false)

  const isPublishFormContext = values.services && Array.isArray(values.services)

  const allowAllPublishedAlgorithms = isPublishFormContext
    ? (values as any).allowAllPublishedAlgorithms
    : (values as ServiceEditForm).allowAllPublishedAlgorithms
  const publisherTrustedAlgorithmPublishers = isPublishFormContext
    ? (values as any).publisherTrustedAlgorithmPublishers
    : (values as ServiceEditForm).publisherTrustedAlgorithmPublishers
  const publisherTrustedAlgorithmPublishersAddresses = isPublishFormContext
    ? (values as any).publisherTrustedAlgorithmPublishersAddresses
    : (values as ServiceEditForm).publisherTrustedAlgorithmPublishersAddresses

  useEffect(() => {
    if (allowAllPublishedAlgorithms === undefined) {
      setFieldValue('allowAllPublishedAlgorithms', ALLOW_SELECTED_ALGORITHMS)
    }
    if (publisherTrustedAlgorithmPublishers === undefined) {
      setFieldValue(
        'publisherTrustedAlgorithmPublishers',
        ALLOW_SPECIFIC_TRUSTED_ALGORITHM_PUBLISHERS
      )
    }
  }, [
    allowAllPublishedAlgorithms,
    publisherTrustedAlgorithmPublishers,
    setFieldValue
  ])

  useEffect(() => {
    const currentAddresses = publisherTrustedAlgorithmPublishersAddresses || ''
    const addresses = currentAddresses
      .split(',')
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0)
    setAddressList(addresses)
  }, [publisherTrustedAlgorithmPublishersAddresses])

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()

    if (!addressInputValue.trim()) {
      return
    }

    const newAddress = addressInputValue.trim()
    if (!addressList.includes(newAddress)) {
      const updatedAddresses = [...addressList, newAddress]
      setAddressList(updatedAddresses)
      setFieldValue(
        'publisherTrustedAlgorithmPublishersAddresses',
        updatedAddresses.join(',')
      )
      setAddressInputValue('')
    }
  }

  const handleDeleteAddress = (addressToDelete: string) => {
    const updatedAddresses = addressList.filter(
      (address) => address !== addressToDelete
    )
    setAddressList(updatedAddresses)
    setFieldValue(
      'publisherTrustedAlgorithmPublishersAddresses',
      updatedAddresses.join(',')
    )
  }

  useEffect(() => {
    if (isUpdatingRef.current) return

    if (isAllowAnyPublishedAlgorithms(allowAllPublishedAlgorithms)) {
      if (
        !isAllowAllTrustedAlgorithmPublishers(
          publisherTrustedAlgorithmPublishers
        )
      ) {
        isUpdatingRef.current = true
        setFieldValue(
          'publisherTrustedAlgorithmPublishers',
          ALLOW_ALL_TRUSTED_ALGORITHM_PUBLISHERS
        )
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 0)
      }
    } else if (allowAllPublishedAlgorithms === ALLOW_SELECTED_ALGORITHMS) {
      if (
        publisherTrustedAlgorithmPublishers !==
        ALLOW_SPECIFIC_TRUSTED_ALGORITHM_PUBLISHERS
      ) {
        isUpdatingRef.current = true
        setFieldValue(
          'publisherTrustedAlgorithmPublishers',
          ALLOW_SPECIFIC_TRUSTED_ALGORITHM_PUBLISHERS
        )
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 0)
      }
    }
  }, [allowAllPublishedAlgorithms, setFieldValue])

  useEffect(() => {
    if (isUpdatingRef.current) return

    if (
      isAllowAllTrustedAlgorithmPublishers(publisherTrustedAlgorithmPublishers)
    ) {
      if (!isAllowAnyPublishedAlgorithms(allowAllPublishedAlgorithms)) {
        isUpdatingRef.current = true
        setFieldValue(
          'allowAllPublishedAlgorithms',
          ALLOW_ANY_PUBLISHED_ALGORITHMS
        )
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 0)
      }
    } else if (
      publisherTrustedAlgorithmPublishers ===
      ALLOW_SPECIFIC_TRUSTED_ALGORITHM_PUBLISHERS
    ) {
      if (allowAllPublishedAlgorithms !== ALLOW_SELECTED_ALGORITHMS) {
        isUpdatingRef.current = true
        setFieldValue('allowAllPublishedAlgorithms', ALLOW_SELECTED_ALGORITHMS)
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 0)
      }
    }
  }, [publisherTrustedAlgorithmPublishers, setFieldValue])

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
    const algorithms = isPublishFormContext
      ? values.publisherTrustedAlgorithms
      : serviceCompute.publisherTrustedAlgorithms

    let parsedAlgorithms = algorithms
    if (isPublishFormContext && Array.isArray(algorithms)) {
      parsedAlgorithms = algorithms
        .map((algo) => {
          try {
            const parsed = JSON.parse(algo)
            return {
              did: parsed.algoDid,
              serviceId: parsed.serviceId,
              containerSectionChecksum: '*',
              filesChecksum: '*'
            } as PublisherTrustedAlgorithms
          } catch (e) {
            return null
          }
        })
        .filter(Boolean) as PublisherTrustedAlgorithms[]
    }

    getAlgorithmList(parsedAlgorithms).then((algorithms) => {
      setAllAlgorithms(algorithms)
    })
  }, [
    serviceCompute,
    getAlgorithmList,
    isPublishFormContext,
    values.publisherTrustedAlgorithms
  ])

  return (
    <SectionContainer
      title="Set Allowed Algorithms"
      help="Only the algorithms selected here will be allowed to run on your dataset. Uncheck all to remove any access to your dataset."
    >
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
          disabled={isAllowAnyPublishedAlgorithms(allowAllPublishedAlgorithms)}
        />
      </SectionContainer>

      <SectionContainer
        border
        classNames={styles.publisherTrustedAlgorithmPublishersContainer}
      >
        <Field
          {...getFieldContent(
            'publisherTrustedAlgorithmPublishers',
            content.form.data
          )}
          component={Input}
          name="publisherTrustedAlgorithmPublishers"
          selectStyle="publish"
          className={styles.publisherTrustedAlgorithmPublishersInput}
          disabled={isAllowAnyPublishedAlgorithms(allowAllPublishedAlgorithms)}
        />

        {(publisherTrustedAlgorithmPublishers ===
          ALLOW_SPECIFIC_TRUSTED_ALGORITHM_PUBLISHERS ||
          publisherTrustedAlgorithmPublishers === undefined) && (
          <>
            <div className={styles.inputContainer}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  type="text"
                  placeholder="e.g. 0xea9889df0f0f9f7f4f6fsdffa3a5a6a7aa"
                  value={addressInputValue}
                  onChange={(e) => setAddressInputValue(e.target.value)}
                  disabled={isAllowAnyPublishedAlgorithms(
                    allowAllPublishedAlgorithms
                  )}
                  className={styles.addressInput}
                />
              </div>
              <Button
                type="button"
                style="gradient"
                onClick={handleAddAddress}
                disabled={isAllowAnyPublishedAlgorithms(
                  allowAllPublishedAlgorithms
                )}
                className={styles.addAddressButton}
              >
                <AddAddress /> Add
              </Button>
            </div>

            {addressList.length > 0 && (
              <div className={styles.addressListContainer}>
                {addressList.map((address, index) => (
                  <div key={index} className={styles.addressItem}>
                    <input
                      type="text"
                      value={address}
                      disabled
                      className={styles.addressDisplay}
                    />
                    <DeleteButton
                      onClick={() => handleDeleteAddress(address)}
                      disabled={isAllowAnyPublishedAlgorithms(
                        allowAllPublishedAlgorithms
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </SectionContainer>
    </SectionContainer>
  )
}
