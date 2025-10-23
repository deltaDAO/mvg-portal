import { useAssetPicker } from './AssetPicker.hook'
import styles from './AssetPicker.module.css'

function AssetPicker() {
  const { assets, written, handleSelectChange } = useAssetPicker()

  return (
    <select
      name="algorithm"
      id="algorithm-select"
      onChange={handleSelectChange}
      className={styles.selector}
      disabled={!!written}
    >
      {assets.results ? (
        <>
          <option value="">--Please choose one of your assets--</option>
          {assets.results.map((item) => (
            <option key={item.id} value={item.id}>
              {item.metadata.name}
            </option>
          ))}
        </>
      ) : (
        <option value="">No assets found</option>
      )}
    </select>
  )
}

export default AssetPicker
