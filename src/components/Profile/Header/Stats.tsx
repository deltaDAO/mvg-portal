import { ReactElement, useEffect, useState } from 'react'
import NumberUnit from './NumberUnit'
import styles from './Stats.module.css'
import { useProfile } from '@context/Profile'
import EscrowWithdrawModal from './EscrowWithdrawModal' // Import the modal
import { useChainId, usePublicClient } from 'wagmi'
import { getOceanConfig } from '@utils/ocean'
import { getTokenInfo } from '@utils/wallet'
import { JsonRpcProvider } from 'ethers'

export default function Stats(): ReactElement {
  const {
    assetsTotal,
    sales,
    downloadsTotal,
    revenue,
    escrowAvailableFunds,
    escrowLockedFunds,
    ownAccount
  } = useProfile()
  const [showModal, setShowModal] = useState(false)
  const chainId = useChainId()
  const [tokenSymbol, setTokenSymbol] = useState('OCEAN')
  const publicClient = usePublicClient()
  const rpcUrl = getOceanConfig(chainId)?.nodeUri

  const ethersProvider =
    publicClient && rpcUrl ? new JsonRpcProvider(rpcUrl) : undefined

  useEffect(() => {
    async function fetchSymbol() {
      if (!chainId || !ethersProvider) return
      const { oceanTokenAddress } = getOceanConfig(chainId)
      if (!oceanTokenAddress) return
      // Pass Ethers v6 Provider to getTokenInfo
      const tokenDetails = await getTokenInfo(oceanTokenAddress, ethersProvider)
      setTokenSymbol(tokenDetails.symbol || 'OCEAN')
    }
    fetchSymbol()
  }, [chainId, ethersProvider])

  return (
    <div className={styles.stats}>
      <NumberUnit
        label={`Sale${sales === 1 ? '' : 's'}`}
        value={sales < 0 ? 0 : sales}
      />
      <NumberUnit label="Published" value={assetsTotal} />
      <NumberUnit label="Downloads" value={downloadsTotal} />
      <NumberUnit label="Revenue" value={`${revenue} ${tokenSymbol}`} />
      {ownAccount && (
        <>
          <NumberUnit
            label="Escrow Locked Funds"
            value={`${parseInt(escrowLockedFunds, 10)} ${tokenSymbol}`}
          />
          <div onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
            <NumberUnit
              label="Escrow Available Funds 👉 Click to Withdraw 👈"
              value={`${Number(escrowAvailableFunds).toFixed(
                2
              )} ${tokenSymbol}`}
            />
          </div>
        </>
      )}

      {showModal && (
        <EscrowWithdrawModal
          escrowFunds={parseInt(escrowAvailableFunds, 10)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
