import { useOcean } from '../../../../providers/Ocean'
import { useWeb3 } from '../../../../providers/Web3'
import { Formik } from 'formik'
import React, { ReactElement, useRef, useState } from 'react'
import {
  validationSchema,
  getInitialValues,
  ComputePrivacyForm
} from '../../../../models/FormEditComputeDataset'
import { useAsset } from '../../../../providers/Asset'
import FormEditComputeDataset from './FormEditComputeDataset'
import { Logger, ServiceComputePrivacy } from '@oceanprotocol/lib'
import MetadataFeedback from '../../../molecules/MetadataFeedback'
import { graphql, useStaticQuery } from 'gatsby'
import { useUserPreferences } from '../../../../providers/UserPreferences'
import DebugEditCompute from './DebugEditCompute'
import styles from './index.module.css'
import { transformComputeFormToServiceComputePrivacy } from '../../../../utils/compute'
import {
  setMinterToDispenser,
  setMinterToPublisher
} from '../../../../utils/freePrice'
import Web3Feedback from '../../../molecules/Web3Feedback'
import Page from '../../../templates/Page'
import Loader from '../../../atoms/Loader'

const contentQuery = graphql`
  query EditComputeDataQuery {
    content: allFile(
      filter: { relativePath: { eq: "pages/editComputeDataset.json" } }
    ) {
      edges {
        node {
          childPagesJson {
            description
            form {
              title
              success
              successAction
              error
              data {
                name
                placeholder
                label
                help
                type
                required
                sortOptions
                options
                multiple
                rows
              }
            }
          }
        }
      }
    }
  }
`

export default function EditComputeDataset({
  setShowEdit,
  tutorial
}: {
  setShowEdit: (show: boolean) => void
  tutorial?: boolean
}): ReactElement {
  const data = useStaticQuery(contentQuery)
  const content = data.content.edges[0].node.childPagesJson

  const { debug } = useUserPreferences()
  const { ocean } = useOcean()
  const { accountId } = useWeb3()
  const { ddo, price, isAssetNetwork, refreshDdo } = useAsset()
  const [success, setSuccess] = useState<string>()
  const [error, setError] = useState<string>()
  const hasFeedback = error || success

  async function handleSubmit(
    values: ComputePrivacyForm,
    resetForm: () => void
  ) {
    try {
      if (price.type === 'free') {
        const tx = await setMinterToPublisher(
          ocean,
          ddo.dataToken,
          accountId,
          setError
        )
        if (!tx) return
      }
      const privacy = await transformComputeFormToServiceComputePrivacy(
        values,
        ocean
      )

      const ddoEditedComputePrivacy = await ocean.compute.editComputePrivacy(
        ddo,
        1,
        privacy as ServiceComputePrivacy
      )

      if (!ddoEditedComputePrivacy) {
        setError(content.form.error)
        Logger.error(content.form.error)
        return
      }

      const storedddo = await ocean.assets.updateMetadata(
        ddoEditedComputePrivacy,
        accountId
      )
      if (!storedddo) {
        setError(content.form.error)
        Logger.error(content.form.error)
        return
      } else {
        if (price.type === 'free') {
          const tx = await setMinterToDispenser(
            ocean,
            ddo.dataToken,
            accountId,
            setError
          )
          if (!tx) return
        }
        // Edit succeeded
        setSuccess(content.form.success)
        resetForm()
      }
    } catch (error) {
      Logger.error(error.message)
      setError(error.message)
    }
  }

  const computeRef = useRef(null)
  const executeScroll = () =>
    computeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })

  return !ddo && tutorial ? (
    <Page title={undefined} uri="/tutorial">
      <Loader />
    </Page>
  ) : (
    <Formik
      initialValues={getInitialValues(
        ddo.findServiceByType('compute').attributes.main.privacy
      )}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        // move user's focus to top of screen
        if (!tutorial) {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        } else {
          executeScroll()
        }
        // kick off editing
        await handleSubmit(values, resetForm)
        if (tutorial) {
          setShowEdit(true)
        }
      }}
    >
      {({ values, isSubmitting }) =>
        isSubmitting || hasFeedback ? (
          <div ref={computeRef}>
            <MetadataFeedback
              title="Updating Data Set"
              error={error}
              success={success}
              setError={setError}
              successAction={{
                name: content.form.successAction,
                onClick: async () => {
                  await refreshDdo()
                  setShowEdit(false)
                }
              }}
            />
          </div>
        ) : (
          <>
            {!tutorial && (
              <p className={styles.description}>{content.description}</p>
            )}
            <article className={tutorial ? styles.tutorialGrid : styles.grid}>
              <FormEditComputeDataset
                title={content.form.title}
                data={content.form.data}
                setShowEdit={setShowEdit}
                tutorial={tutorial}
              />
            </article>
            <Web3Feedback isAssetNetwork={isAssetNetwork} />
            {debug === true && (
              <div className={styles.grid}>
                <DebugEditCompute values={values} ddo={ddo} />
              </div>
            )}
          </>
        )
      }
    </Formik>
  )
}
