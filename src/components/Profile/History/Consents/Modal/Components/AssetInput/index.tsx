import { Asset } from '@oceanprotocol/lib'
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from 'react'
import AssetPicker from './AssetPicker/AssetPicker'
import AssetTextField from './AssetTextField/AssetTextField'
import styles from './index.module.css'

interface AssetInputContextValue {
  asset: Asset
  selected: Asset
  setSelected: Dispatch<SetStateAction<Asset>>
  written: Asset
  setWritten: Dispatch<SetStateAction<Asset>>
  error?: string
  setError: Dispatch<SetStateAction<string | null>>
}

const AssetInputContext = createContext({} as AssetInputContextValue)

interface AssetInputProps {
  asset: Asset
  setAlgorithm: Dispatch<SetStateAction<Asset>>
}

function AssetInput({ asset, setAlgorithm }: AssetInputProps) {
  const [selected, setSelected] = useState<Asset>()
  const [written, setWritten] = useState<Asset>()
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    setAlgorithm(written ?? selected)
  }, [setAlgorithm, selected, written])

  return (
    <AssetInputContext.Provider
      value={{
        asset,
        selected,
        setSelected,
        error,
        setError,
        written,
        setWritten
      }}
    >
      <div className={styles.container}>
        <AssetPicker />
        <i>-- or --</i>
        <AssetTextField />
      </div>
    </AssetInputContext.Provider>
  )
}

export const useAssetInput = () => useContext(AssetInputContext)
export default AssetInput
