import Loader from '@components/@shared/atoms/Loader'
import { useModalContext } from '@components/@shared/Modal'
import { useCreateConsentResponse } from '@hooks/useUserConsents'
import Info from '@images/info.svg'
import { Asset } from '@oceanprotocol/lib'
import { Consent, ConsentState, PossibleRequests } from '@utils/consents/types'
import { cleanRequests } from '@utils/consents/utils'
import { ErrorMessage, Form, Formik } from 'formik'
import {
  PropsWithChildren,
  ReactNode,
  Suspense,
  useEffect,
  useState
} from 'react'
import { toast } from 'react-toastify'
import ConsentStateBadge from '../../../Feed/StateBadge'
import Actions from '../Actions'
import { FullRequests, InteractiveRequests } from '../Requests'
import { SwitchNetwork } from '../SwitchNetwork'
import { AutoResize } from './AutoResize'
import { AutoSave } from './AutoSave'
import styles from './index.module.css'
import { useAsset } from '@context/Asset'

function ConsentResponse({ children }: PropsWithChildren) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>
}

interface StatusProps {
  status: ConsentState
}
function Status({ status }: StatusProps) {
  return <ConsentStateBadge status={status} />
}

interface InteractiveRequestFormProps {
  dataset: Asset
  algorithm: Asset
  handleSubmit: (reason: string, request: PossibleRequests) => void
}
function InteractiveRequestForm({
  dataset,
  algorithm,
  handleSubmit
}: InteractiveRequestFormProps) {
  return (
    <Formik
      initialValues={{ reason: '', permissions: {} }}
      validate={(values) => {
        const errors: { reason?: string; permissions?: string } = {}
        if (!values.reason || values.reason.length === 0) {
          errors.reason = 'Reason required'
        } else if (values.reason.length > 255) {
          errors.reason = 'Must be 255 characters or less'
        }
        return errors
      }}
      onSubmit={(values, { setSubmitting }) => {
        console.log('Submitting', values)
        handleSubmit(values.reason, cleanRequests(values.permissions))
        setSubmitting(false)
      }}
    >
      {({ isSubmitting, isValid }) => (
        <Form className={styles.form}>
          <div className={styles.requestInfo}>
            <AutoResize
              name="reason"
              placeholder="This is where your reasons go"
            />
            <ErrorMessage name="reason" component="div">
              {(msg) => (
                <div className={styles.error}>
                  <Info />
                  {msg}
                </div>
              )}
            </ErrorMessage>
            <InteractiveRequests
              dataset={dataset}
              algorithm={algorithm}
              fieldName="permissions"
            >
              <span>Requests for:</span>
            </InteractiveRequests>
            <Actions acceptText="Submit" isLoading={!isValid || isSubmitting} />
          </div>
        </Form>
      )}
    </Formik>
  )
}

interface CachedResponse {
  id: number
  reason: string
  permitted: PossibleRequests
}

interface InteractiveResponseFormProps {
  chainId: number
  consent: Consent
  dataset: Asset
  algorithm: Asset
}
function InteractiveResponseForm({
  chainId,
  consent,
  dataset,
  algorithm
}: InteractiveResponseFormProps) {
  const { asset } = useAsset()
  const { closeModal } = useModalContext()
  const [isTriedSubmitted, setIsTriedSubmitted] = useState(false)
  const { mutateAsync: createConsentResponse } = useCreateConsentResponse(asset)

  const [cachedResponse, setCachedResponse] = useState<CachedResponse>(() => {
    const response = localStorage.getItem('cachedConsentResponse') ?? '{}'
    try {
      const parsed = JSON.parse(response) as CachedResponse
      if (!response || consent.id !== parsed.id) {
        return {
          id: consent.id,
          reason: '',
          permitted: {}
        }
      }

      return parsed
    } catch (error) {
      console.warn(
        'Could not parse cached consent response, maybe corrupted.',
        error
      )
      return {
        id: consent.id,
        reason: '',
        permitted: {}
      }
    }
  })
  const isWrongChain = asset?.chainId !== chainId

  useEffect(() => {
    localStorage.setItem(
      'cachedConsentResponse',
      JSON.stringify(cachedResponse)
    )
  }, [cachedResponse])

  return (
    <Formik
      key={chainId}
      enableReinitialize
      validateOnChange={isTriedSubmitted}
      validateOnBlur={isTriedSubmitted}
      initialValues={cachedResponse}
      validate={({ reason, permitted }) => {
        const errors: { reason?: string; permitted?: string } = {}
        if (!reason) {
          errors.reason = 'Required'
        }
        setIsTriedSubmitted(true)

        setCachedResponse((prev) => ({
          ...prev,
          reason,
          permitted
        }))

        return errors
      }}
      onSubmit={async ({ reason, permitted }, { setSubmitting }) => {
        await createConsentResponse(
          {
            consentId: consent.id,
            reason,
            permitted: cleanRequests(permitted)
          },
          {
            onSuccess: () => {
              closeModal()
              setSubmitting(false)
              toast.success('Consent responded successfully')
            }
          }
        )
      }}
    >
      {({ isValid, isSubmitting, setFieldValue, submitForm }) => (
        <Form>
          <AutoSave onChange={setCachedResponse} />
          <div className={styles.requestInfo}>
            <div className={styles.requestContainer}>
              <AutoResize name="reason" placeholder="Reason of the response" />
              <ErrorMessage name="reason" component="div">
                {(msg) => (
                  <div className={styles.error}>
                    <Info className={styles.errorIcon} />
                    {msg}
                  </div>
                )}
              </ErrorMessage>
              <InteractiveRequests
                dataset={dataset}
                algorithm={algorithm}
                requests={consent.request}
              >
                Permissions:
              </InteractiveRequests>
              <div className={styles.actions}>
                <SwitchNetwork
                  chainId={chainId}
                  targetNetwork={asset?.chainId}
                />
                <Actions
                  acceptText="Submit"
                  rejectText="Reject All"
                  handleAccept={submitForm}
                  handleReject={() =>
                    setFieldValue('permitted', {}).then(submitForm)
                  }
                  isLoading={isSubmitting || !isValid || isWrongChain}
                />
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

interface ResponsePermissionsProps {
  permitted: PossibleRequests
  dataset: Asset
  algorithm: Asset
  children?: ReactNode
}
function ResponsePermissions({
  permitted,
  dataset,
  algorithm,
  children
}: ResponsePermissionsProps) {
  return (
    <div className={styles.requestInfo}>
      <div className={styles.requestContainer}>
        <FullRequests
          dataset={dataset}
          algorithm={algorithm}
          requests={permitted}
        >
          {children}
        </FullRequests>
      </div>
    </div>
  )
}

ConsentResponse.Status = Status
ConsentResponse.InteractiveResponseForm = InteractiveResponseForm
ConsentResponse.InteractiveRequestForm = InteractiveRequestForm
ConsentResponse.ResponsePermissions = ResponsePermissions

export default ConsentResponse
