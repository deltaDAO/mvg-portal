import React, { ReactElement, useEffect, useState } from 'react'
import Markdown from '../../atoms/Markdown'
import MetaFull from './MetaFull'
import MetaSecondary from './MetaSecondary'
import AssetActions from '../AssetActions'
import { useUserPreferences } from '../../../providers/UserPreferences'
import Pricing from './Pricing'
import Bookmark from './Bookmark'
import { useAsset } from '../../../providers/Asset'
import Button from '../../atoms/Button'
import Edit from '../AssetActions/Edit'
import EditComputeDataset from '../AssetActions/Edit/EditComputeDataset'
import DebugOutput from '../../atoms/DebugOutput'
import MetaMain from './MetaMain'
import EditHistory from './EditHistory'
import { useWeb3 } from '../../../providers/Web3'
import styles from './index.module.css'
import EditAdvancedSettings from '../AssetActions/Edit/EditAdvancedSettings'
import { useSiteMetadata } from '../../../hooks/useSiteMetadata'
import NetworkName from '../../atoms/NetworkName'
import { getFormattedCodeString, getServiceSD } from '../../../utils/metadata'
import Visualizer from '../../pages/Verify/Visualizer'
export interface AssetContentProps {
  path?: string
}

export default function AssetContent(props: AssetContentProps): ReactElement {
  const { debug } = useUserPreferences()
  const { accountId } = useWeb3()
  const {
    ddo,
    isAssetNetwork,
    isServiceSelfDescriptionVerified,
    metadata,
    owner,
    price,
    type
  } = useAsset()
  const [showPricing, setShowPricing] = useState(false)
  const [showEdit, setShowEdit] = useState<boolean>()
  const [isComputeType, setIsComputeType] = useState<boolean>(false)
  const [showEditCompute, setShowEditCompute] = useState<boolean>()
  const [showEditAdvancedSettings, setShowEditAdvancedSettings] =
    useState<boolean>()
  const [isOwner, setIsOwner] = useState(false)
  const [serviceSelfDescription, setServiceSelfDescription] = useState<string>()
  const { appConfig } = useSiteMetadata()

  useEffect(() => {
    if (!accountId || !owner) return

    const isOwner = accountId.toLowerCase() === owner.toLowerCase()
    setIsOwner(isOwner)
    setShowPricing(isOwner && type !== 'thing' && price?.type === '')
    setIsComputeType(Boolean(ddo.findServiceByType('compute')))
  }, [accountId, price, owner, ddo, type])

  function handleEditButton() {
    // move user's focus to top of screen
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    setShowEdit(true)
  }

  function handleEditComputeButton() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    setShowEditCompute(true)
  }

  function handleEditAdvancedSettingsButton() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    setShowEditAdvancedSettings(true)
  }

  useEffect(() => {
    if (!isServiceSelfDescriptionVerified) return
    const serviceSD = metadata?.additionalInformation?.serviceSelfDescription
    if (serviceSD?.raw) {
      setServiceSelfDescription(JSON.parse(serviceSD?.raw))
    }
    if (serviceSD?.url) {
      getServiceSD(serviceSD?.url).then((serviceSelfDescription) =>
        setServiceSelfDescription(JSON.parse(serviceSelfDescription))
      )
    }
  }, [
    isServiceSelfDescriptionVerified,
    metadata?.additionalInformation?.serviceSelfDescription
  ])

  return showEdit ? (
    <Edit setShowEdit={setShowEdit} isComputeType={isComputeType} />
  ) : showEditCompute ? (
    <EditComputeDataset setShowEdit={setShowEditCompute} />
  ) : showEditAdvancedSettings ? (
    <EditAdvancedSettings setShowEdit={setShowEditAdvancedSettings} />
  ) : (
    <>
      <div className={styles.networkWrap}>
        <NetworkName networkId={ddo.chainId} className={styles.network} />
      </div>

      <article className={styles.grid}>
        <div>
          {showPricing && <Pricing ddo={ddo} />}
          <div className={styles.content}>
            <MetaMain />
            <Bookmark did={ddo.id} />
            <Markdown
              className={styles.description}
              text={metadata?.additionalInformation?.description || ''}
            />
            {isServiceSelfDescriptionVerified && (
              <div className={styles.sdVisualizer}>
                <Visualizer
                  text={getFormattedCodeString(serviceSelfDescription) || ''}
                  title="Service Self-Description"
                  copyText={
                    serviceSelfDescription &&
                    JSON.stringify(serviceSelfDescription, null, 2)
                  }
                />
              </div>
            )}
            <MetaSecondary />
            {isOwner && isAssetNetwork && type !== 'thing' && (
              <div className={styles.ownerActions}>
                <Button style="text" size="small" onClick={handleEditButton}>
                  Edit Metadata
                </Button>
                {accountId && appConfig.allowAdvancedSettings === 'true' && (
                  <>
                    <span className={styles.separator}>|</span>
                    <Button
                      style="text"
                      size="small"
                      onClick={handleEditAdvancedSettingsButton}
                    >
                      Edit Advanced Settings
                    </Button>
                  </>
                )}
                {ddo.findServiceByType('compute') && type === 'dataset' && (
                  <>
                    <span className={styles.separator}>|</span>
                    <Button
                      style="text"
                      size="small"
                      onClick={handleEditComputeButton}
                    >
                      Edit Compute Settings
                    </Button>
                  </>
                )}
              </div>
            )}
            <MetaFull />
            <EditHistory />
            {debug === true && <DebugOutput title="DDO" output={ddo} />}
          </div>
        </div>
        <div className={styles.actions}>
          <AssetActions />
        </div>
      </article>
    </>
  )
}
