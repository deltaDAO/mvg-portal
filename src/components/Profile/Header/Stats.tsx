import { ReactElement, useState } from 'react'
import NumberUnit from './NumberUnit'
import styles from './Stats.module.css'
import { useProfile } from '@context/Profile'
import EscrowWithdrawModal from './EscrowWithdrawModal' // Import the modal

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

  return (
    <div className={styles.stats}>
      <NumberUnit
        label={`Sale${sales === 1 ? '' : 's'}`}
        value={sales < 0 ? 0 : sales}
      />
      <NumberUnit label="Published" value={assetsTotal} />
      <NumberUnit label="Downloads" value={downloadsTotal} />
      <NumberUnit label="Revenue Ocean" value={revenue} />
      {ownAccount && (
        <>
          <div onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
            <NumberUnit
              label="Escrow Available Funds (Click to Withdraw)"
              value={parseFloat(escrowAvailableFunds).toFixed(2)}
            />
          </div>
          <NumberUnit
            label="Escrow Locked Funds"
            value={parseFloat(escrowLockedFunds).toFixed(2)}
          />
        </>
      )}

      {showModal && (
        <EscrowWithdrawModal
          escrowFunds={escrowAvailableFunds}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
