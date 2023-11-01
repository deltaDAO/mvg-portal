import { ReactElement } from 'react'
import classNames from 'classnames/bind'
import styles from './AssetViewSelector.module.css'
import Button from '../atoms/Button'
import GridViewIcon from '@images/grid-view-icon.svg'
import ListViewIcon from '@images/list-view-icon.svg'

const cx = classNames.bind(styles)

export enum AssetViewOptions {
  Grid = 'grid',
  List = 'list'
}

const assetViews = [
  { value: AssetViewOptions.Grid, icon: <GridViewIcon /> },
  { value: AssetViewOptions.List, icon: <ListViewIcon /> }
]

export default function AssetViewSelector({
  activeAssetView,
  setActiveAssetView
}: {
  activeAssetView: AssetViewOptions
  setActiveAssetView: (activeView: AssetViewOptions) => void
}): ReactElement {
  return (
    <div className={styles.viewSelectorContainer}>
      {assetViews.map((view) => {
        const selectFilter = cx({
          [styles.selected]: view.value === activeAssetView,
          [styles.viewSelector]: true
        })
        return (
          <Button
            key={view.value}
            className={selectFilter}
            title={`Switch to ${view.value} view`}
            onClick={() => setActiveAssetView(view.value)}
          >
            {view.icon}
          </Button>
        )
      })}
    </div>
  )
}
