import React, { ReactElement, useEffect, useState } from 'react'
import HistoryPage from './History'
import AccountHeader from './Header'
import styles from './index.module.css'
import axios from 'axios'

export default function AccountPage({
  accountId
}: {
  accountId: string
}): ReactElement {
  const [verified, setVerified] = useState(false)
  useEffect(() => {
    if (!accountId) return
    const fetch = async () => {
      try {
        const { data } = await axios.post('https://localhost:4000/claim', {
          address: accountId
        })
        setVerified(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetch()
  }, [accountId])
  return (
    <div className={styles.profile}>
      <AccountHeader accountId={accountId} />
      <HistoryPage accountIdentifier={accountId} />
    </div>
  )
}
