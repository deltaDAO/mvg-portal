import {
  ReactElement,
  useCallback,
  useEffect,
  useState,
  ChangeEvent
} from 'react'
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
import { isAddress } from 'ethers/lib/utils'
import styles from './index.module.css'

const ALLOW_ANY_PUBLISHED_ALGORITHMS = 'Allow any published algorithms'
const ALLOW_SELECTED_ALGORITHMS = 'Allow selected algorithms'
const ALLOW_SPECIFIC_TRUSTED_ALGORITHM_PUBLISHERS =
  'Allow specific trusted algorithm publishers'
const ALLOW_ALL_TRUSTED_ALGORITHM_PUBLISHERS =
  'Allow all trusted algorithm publishers'

const isAllowAnyPublishedAlgorithms = (value: string) =>
  value === ALLOW_ANY_PUBLISHED_ALGORITHMS

const coerceAllowAllToString = (value: string | boolean): string =>
  typeof value === 'string'
    ? value
    : value
    ? ALLOW_ANY_PUBLISHED_ALGORITHMS
    : ALLOW_SELECTED_ALGORITHMS

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
  const { values, setFieldValue, setFieldTouched } =
    useFormikContext<Record<string, any>>()
  const [allAlgorithms, setAllAlgorithms] = useState<AssetSelectionAsset[]>()
  const [addressInputValue, setAddressInputValue] = useState('')
  const [addressList, setAddressList] = useState<string[]>([])
  const [addressError, setAddressError] = useState('')

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

  const allowAllPublishedAlgorithmsStr = coerceAllowAllToString(
    allowAllPublishedAlgorithms
  )

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
    setFieldValue,
    publisherTrustedAlgorithmPublishers
  ])

  useEffect(() => {
    if (typeof allowAllPublishedAlgorithms !== 'string') {
      setFieldValue(
        'allowAllPublishedAlgorithms',
        coerceAllowAllToString(allowAllPublishedAlgorithms)
      )
    }
  }, [allowAllPublishedAlgorithms, setFieldValue])

  const handleAllowAlgorithmsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    setFieldValue('allowAllPublishedAlgorithms', value)
    if (isAllowAnyPublishedAlgorithms(value)) {
      setFieldValue(
        'publisherTrustedAlgorithmPublishers',
        ALLOW_ALL_TRUSTED_ALGORITHM_PUBLISHERS
      )
      if (publisherTrustedAlgorithmPublishersAddresses) {
        setFieldValue('publisherTrustedAlgorithmPublishersAddresses', '')
        setAddressList([])
      }
    } else {
      setFieldValue(
        'publisherTrustedAlgorithmPublishers',
        ALLOW_SPECIFIC_TRUSTED_ALGORITHM_PUBLISHERS
      )
    }
  }

  const handlePublishersChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    setFieldValue('publisherTrustedAlgorithmPublishers', value)
    if (value === ALLOW_ALL_TRUSTED_ALGORITHM_PUBLISHERS) {
      setFieldValue(
        'allowAllPublishedAlgorithms',
        ALLOW_ANY_PUBLISHED_ALGORITHMS
      )
      if (publisherTrustedAlgorithmPublishersAddresses) {
        setFieldValue('publisherTrustedAlgorithmPublishersAddresses', '')
        setAddressList([])
      }
    } else if (value === ALLOW_SPECIFIC_TRUSTED_ALGORITHM_PUBLISHERS) {
      setFieldValue('allowAllPublishedAlgorithms', ALLOW_SELECTED_ALGORITHMS)
    }
  }

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
    setAddressError('')

    if (!addressInputValue.trim()) {
      setAddressError('Please enter an address')
      return
    }

    const newAddress = addressInputValue.trim()

    if (!(newAddress === '*' || isAddress(newAddress))) {
      setAddressError('Wallet address is invalid')
      return
    }

    if (addressList.includes(newAddress.toLowerCase())) {
      setAddressError('Wallet address already added to the list')
      return
    }

    const updatedAddresses = [...addressList, newAddress.toLowerCase()]
    setAddressList(updatedAddresses)
    setFieldValue(
      'publisherTrustedAlgorithmPublishersAddresses',
      updatedAddresses.join(',')
    )
    setAddressInputValue('')
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
    setFieldTouched('publisherTrustedAlgorithmPublishersAddresses', true)
  }

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
          onChange={handleAllowAlgorithmsChange}
        />

        <Field
          {...getFieldContent('publisherTrustedAlgorithms', content.form.data)}
          component={Input}
          name="publisherTrustedAlgorithms"
          options={allAlgorithms}
          disabled={isAllowAnyPublishedAlgorithms(
            allowAllPublishedAlgorithmsStr
          )}
        />
      </SectionContainer>

      <SectionContainer
        border
        className={styles.publisherTrustedAlgorithmPublishersContainer}
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
          disabled={isAllowAnyPublishedAlgorithms(
            allowAllPublishedAlgorithmsStr
          )}
          onChange={handlePublishersChange}
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
                  onChange={(e) => {
                    setAddressInputValue(e.target.value)
                    if (addressError) setAddressError('')
                  }}
                  disabled={isAllowAnyPublishedAlgorithms(
                    allowAllPublishedAlgorithmsStr
                  )}
                  className={styles.addressInput}
                />
              </div>
              <Button
                type="button"
                style="gradient"
                onClick={handleAddAddress}
                disabled={isAllowAnyPublishedAlgorithms(
                  allowAllPublishedAlgorithmsStr
                )}
                className={styles.addAddressButton}
              >
                <AddAddress /> Add
              </Button>
            </div>
            {addressError && (
              <div className={styles.errorMessage}>{addressError}</div>
            )}

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
                        allowAllPublishedAlgorithmsStr
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
