import { ReactElement, useEffect, useState } from 'react'
import NumberUnit from './NumberUnit'
import styles from './Stats.module.css'
import { useProfile } from '@context/Profile'
import EscrowWithdrawModal from './EscrowWithdrawModal' // Import the modal
import { useNetwork, useProvider } from 'wagmi'
import { getOceanConfig } from '@utils/ocean'
import { getTokenInfo } from '@utils/wallet'

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
  const { chain } = useNetwork()
  const [tokenSymbol, setTokenSymbol] = useState('OCEAN')
  const web3provider = useProvider()

  useEffect(() => {
    async function fetchSymbol() {
      if (!chain?.id || !web3provider) return
      const { oceanTokenAddress } = getOceanConfig(chain.id)
      if (!oceanTokenAddress) return
      const tokenDetails = await getTokenInfo(oceanTokenAddress, web3provider)
      setTokenSymbol(tokenDetails.symbol || 'OCEAN')
    }
    fetchSymbol()
  }, [chain?.id, web3provider])

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
