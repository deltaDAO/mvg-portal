import { ReactElement, useState } from 'react'
import ReactDOM from 'react-dom'
import styles from './EscrowWithdrawModal.module.css'
import { EscrowContract } from '@oceanprotocol/lib'
import { useNetwork, useSigner } from 'wagmi'
import { getOceanConfig } from '@utils/ocean'
import { useProfile } from '@context/Profile'
import { utils } from 'ethers'
import { a } from 'react-spring'

export default function EscrowWithdrawModal({
  escrowFunds,
  onClose
}): ReactElement {
  const { refreshEscrowFunds } = useProfile()
  const { data: signer } = useSigner()
  const { chain } = useNetwork()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleInputChange(e) {
    const val = e.target.value
    setAmount(val)
    setError('')
    if (Number(val) > Number(escrowFunds)) {
      setError('Amount can’t be greater than your escrow funds.')
    }
  }

  function handleMaxClick() {
    setAmount(escrowFunds)
    setError('')
  }

  async function handleWithdraw() {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid withdrawal amount.')
      return
    }
    if (Number(amount) > Number(escrowFunds)) {
      setError('Amount can’t be greater than your escrow funds.')
      return
    }
    if (!signer || !chain?.id) {
      setError('Wallet or network not detected.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const { oceanTokenAddress, escrowAddress } = getOceanConfig(chain?.id)
      const escrow = new EscrowContract(escrowAddress, signer, chain?.id)
      // Convert amount to wei (18 decimals):
      await escrow.withdraw([oceanTokenAddress], [amount])
      if (refreshEscrowFunds) await refreshEscrowFunds()
      onClose()
    } catch (err) {
      setError(err.message || 'Withdrawal failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const modalContent = (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalBox}>
        <h3 className={styles.modalTitle}>Withdraw Escrow Funds</h3>
        <div style={{ marginBottom: '10px', fontSize: '14px' }}>
          Available: <strong>{escrowFunds}</strong>
        </div>
        <div className={styles.inputRow}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={handleInputChange}
            className={styles.input}
            disabled={isLoading}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className={`${styles.button} ${styles.maxButton}`}
            onClick={handleMaxClick}
            disabled={isLoading}
          >
            Max
          </button>
        </div>
        {error && (
          <div style={{ color: 'red', fontSize: '13px', marginBottom: 8 }}>
            {error}
          </div>
        )}
        <button
          onClick={handleWithdraw}
          className={styles.button}
          disabled={
            isLoading ||
            !amount ||
            Number(amount) <= 0 ||
            Number(amount) > Number(escrowFunds)
          }
        >
          {isLoading ? 'Withdrawing...' : 'Withdraw'}
        </button>
        <button
          onClick={onClose}
          className={styles.closeButton}
          disabled={isLoading}
        >
          Close
        </button>
      </div>
    </div>
  )

  return typeof window !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : null
}
