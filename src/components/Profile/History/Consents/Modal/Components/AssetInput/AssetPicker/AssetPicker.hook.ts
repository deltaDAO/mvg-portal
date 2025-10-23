import { useAccount } from 'wagmi'
import { useAssetInput } from '..'
import { useAssets } from '@hooks/useAssets'

export const useAssetPicker = () => {
  const { asset, setError, setSelected, written } = useAssetInput()
  const { address } = useAccount()
  const { data: assets } = useAssets(address, 'algorithm', asset.chainId)

  return {
    assets,
    written,
    handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.preventDefault()
      setError(undefined)
      setSelected(assets.results.find((data) => data.id === e.target.value))
    }
  }
}
