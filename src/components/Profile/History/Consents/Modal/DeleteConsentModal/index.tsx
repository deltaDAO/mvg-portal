import { useModalContext } from '@components/@shared/Modal'
import { useCurrentConsent } from '@hooks/useCurrentConsent'
import { useListConsent } from '@hooks/useListConsent'
import {
  useDeleteConsent,
  useDeleteConsentResponse
} from '@hooks/useUserConsents'
import IconCompute from '@images/compute.svg'
import Actions from '../Components/Actions'
import DetailedAsset from '../Components/DetailedAsset/index'
import Sections from '../Components/Sections/index'
import { toast } from 'react-toastify'
import { useCallback } from 'react'
import Reason from '../Components/Reason/index'
import ConsentResponse from '../Components/ConsentResponse'
import IconLock from '@images/lock.svg'
import styles from './index.module.css'
import Alert from '@components/@shared/atoms/Alert'

interface DeleteConsentModalProperties {
  isResponse?: boolean
}

export const DeleteConsentModal = ({
  isResponse
}: Readonly<DeleteConsentModalProperties>) => {
  const { closeModal } = useModalContext()
  const { currentConsent: consent } = useCurrentConsent()
  const {
    datasetQuery: { data: dataset },
    algorithmQuery: { data: algorithm }
  } = useListConsent(consent)

  const { mutateAsync: deleteConsent, isPending: isLoadingDeleteConsent } =
    useDeleteConsent()
  const {
    mutateAsync: deleteConsentResponse,
    isPending: isLoadingDeleteConsentResponse
  } = useDeleteConsentResponse()

  const isLoading = isLoadingDeleteConsent || isLoadingDeleteConsentResponse

  const successCallback = useCallback(() => {
    closeModal()
    toast.success('Succesfully deleted consent petition')
  }, [closeModal])

  const callback = useCallback(() => {
    const success = { onSuccess: successCallback }
    if (isResponse) {
      deleteConsentResponse({ consentId: consent.id }, success)
    } else {
      deleteConsent({ consent }, success)
    }
  }, [
    consent,
    deleteConsent,
    deleteConsentResponse,
    isResponse,
    successCallback
  ])

  return (
    <Sections>
      <Sections.Section
        icon={<IconCompute />}
        title="Assets"
        description="Assets involved in this consent, the requested dataset and the algorithm"
      >
        <DetailedAsset>
          <DetailedAsset.AssetInfo asset={dataset} />
        </DetailedAsset>
        <DetailedAsset>
          <DetailedAsset.AssetInfo asset={algorithm} />
        </DetailedAsset>
      </Sections.Section>
      {consent.response && (
        <Sections.Section
          title="Response"
          icon={<IconLock />}
          description={<ConsentResponse.Status status={consent.status} />}
        >
          <Sections.Column className={styles.customGap}>
            <ConsentResponse>
              <Reason>{consent.response?.reason}</Reason>
              {consent.response &&
              Object.values(consent.response?.permitted).some(
                (value) => value
              ) ? (
                <ConsentResponse.ResponsePermissions
                  permitted={consent.response?.permitted}
                  dataset={dataset}
                  algorithm={algorithm}
                >
                  Grants permission to:
                </ConsentResponse.ResponsePermissions>
              ) : (
                <> </>
              )}
            </ConsentResponse>
          </Sections.Column>
        </Sections.Section>
      )}
      {isResponse && (
        <Alert
          text="Deleting a consent response won't revert the changes made to the blockchain."
          state="warning"
        />
      )}
      <Actions
        acceptText="Cancel"
        rejectText={`Delete Consent ${isResponse ? 'Response' : ''}`}
        handleReject={callback}
        handleAccept={closeModal}
        isLoading={isLoading}
      />
    </Sections>
  )
}
