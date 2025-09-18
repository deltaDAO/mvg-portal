import { ReactElement, useState, useEffect } from 'react'
import { useAsset } from '@context/Asset'
import styles from './index.module.css'
import Tabs from '@shared/atoms/Tabs'
import EditMetadata from './EditMetadata'
import Page from '@shared/Page'
import Loader from '@shared/atoms/Loader'
import Alert from '@shared/atoms/Alert'
import contentPage from '../../../../content/pages/edit.json'
import Container from '@shared/atoms/Container'
import EditServices from './EditServices'

export default function Edit({ uri }: { uri: string }): ReactElement {
  const { asset, error, isInPurgatory, title, isOwner } = useAsset()
  const [pageTitle, setPageTitle] = useState<string>('')
  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    if (!asset) return

    const pageTitle = isInPurgatory
      ? ''
      : !isOwner
      ? 'Edit action not available'
      : `Edit ${title}`

    setPageTitle(pageTitle)
  }, [asset, isInPurgatory, title, isOwner])

  const tabs = [
    {
      title: 'Edit Asset',
      content: <EditMetadata asset={asset} />
    },
    {
      title: 'Edit Services',
      content: <EditServices asset={asset} />
    }
  ]

  return (
    <Page title={pageTitle} description={contentPage.description} uri={uri}>
      {!asset?.accessDetails ? (
        <Loader />
      ) : !isOwner ? (
        <Alert
          title="Edit action available only to asset owner"
          text={error}
          state="error"
        />
      ) : (
        <Container className={`${styles.container} ${styles.containerPublish}`}>
          <Tabs
            items={tabs}
            selectedIndex={tabIndex}
            onIndexSelected={setTabIndex}
            className={styles.edit}
            variant="publish"
            showRadio
            isEditPage
          />
        </Container>
      )}
    </Page>
  )
}
