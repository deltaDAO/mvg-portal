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
      <NumberUnit label="Revenue" value={`${revenue} Ocean`} />
      {ownAccount && (
        <>
          <NumberUnit
            label="Escrow Locked Funds"
            value={`${parseInt(escrowLockedFunds, 10)} Ocean`}
          />
          <div onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
            <NumberUnit
              label="Escrow Available Funds 👉 Click to Withdraw 👈"
              value={`${Number(escrowAvailableFunds).toFixed(2)} OCEAN`}
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
