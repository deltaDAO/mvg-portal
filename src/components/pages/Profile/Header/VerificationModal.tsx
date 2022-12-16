import axios from 'axios'
import { setNestedObjectValues } from 'formik'
import { Link } from 'gatsby'
import React, { ReactElement, useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'react-toastify'
import { verifierApi } from '../../../../../app.config'
import { useProfile } from '../../../../providers/Profile'
import { useWeb3 } from '../../../../providers/Web3'
import Button from '../../../atoms/Button'
import Loader from '../../../atoms/Loader'
import Modal from '../../../atoms/Modal'
import LinkOpener from '../../../molecules/LinkOpener'
import styles from './VerificationModal.module.css'

type AUTH_STATUS = 'waiting' | 'success' | 'error'

export default function VerificationModal(): ReactElement {
  const [requesting, setIsRequesting] = useState<boolean>(false)
  const [qrCodeVisible, setQrCodeVisible] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { refreshVerificationStatus } = useProfile()
  const { accountId } = useWeb3()
  const [qrCodeData, setQrCodeData] = useState<string>()
  const [sessionId, setSessionId] = useState<string>()
  const [authStatus, setAuthStatus] = useState<AUTH_STATUS>('waiting')

  const requestAuthRequest = async () => {
    setIsRequesting(true)
    setQrCodeVisible(false)
    try {
      const response = await axios.get(
        `${verifierApi}/api/auth/sign-in?address=${accountId}`
      )
      setQrCodeData(JSON.stringify(response.data))
      const { callbackUrl } = response.data.body
      setSessionId(callbackUrl.split('?sessionId=')[1])
      setIsOpen(true)
      setIsRequesting(false)
    } catch (error) {
      console.error(error)
      setIsRequesting(false)
    }
  }

  useEffect(() => {
    if (authStatus === 'waiting') return
    switch (authStatus) {
      case 'success':
        refreshVerificationStatus()
        setIsOpen(false)
        toast.success('GEN-X membership was successfully verified')
        break
      case 'error':
        setIsOpen(false)
        toast.error(
          'GEN-X membership could not be verified. Please try again once you have a valid GEN-X membership claim.'
        )
        break
    }
  }, [authStatus])

  // Interval to poll status from verifier once qrCode has been displayed
  // TODO: limit number of requests
  useEffect(() => {
    if (!sessionId || !qrCodeVisible || !isOpen) return
    const delay = 3000 // request delay in ms
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${verifierApi}/api/auth/status?sessionId=${sessionId}`
        )
        if (response.status !== 401) {
          switch (response.status) {
            case 200:
              setAuthStatus('success')
              break
            default:
              console.log('Error polling verification status', {
                status: response.status,
                data: response.data
              })
              setAuthStatus('error')
          }
          clearInterval(interval)
        }
      } catch (error) {
        // Status will be 401 as long as claim has not been verified
        if (error.response.status !== 401) {
          console.error(error)
          setAuthStatus('error')
          clearInterval(interval)
        }
      }
    }, delay)

    return () => {
      clearInterval(interval)
    }
  }, [sessionId, qrCodeVisible, isOpen])

  return (
    <>
      <Button
        className={styles.verifyButton}
        size="small"
        style="primary"
        onClick={() => requestAuthRequest()}
        disabled={requesting}
      >
        {requesting ? <Loader /> : 'Verify your account'}
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        title="Verify GEN-X membership"
        onToggleModal={() => setIsOpen(false)}
      >
        <div className={styles.modal}>
          <ol>
            <li>Open your Polygon ID wallet</li>
            <li>
              Confirm that you are ready to proceed by clicking{' '}
              <Button
                style="text"
                href=""
                onClick={() => setQrCodeVisible(true)}
              >
                Reveal QR-Code
              </Button>
            </li>
            <li>Scan the QR-Code below with your wallet</li>
            <li>
              You will be asked to verify that you have been onboarded to the
              GEN-X network before. This will be done by providing a
              zero-knowledge based proof that you are in posession of a GEN-X
              Membership claim.
            </li>
          </ol>
          <Button
            className={styles.qrcodeButton}
            style="primary"
            onClick={() => setQrCodeVisible(true)}
          >
            Reveal QR-Code
          </Button>

          {qrCodeData && (
            <div
              className={styles.qrcode}
              style={{ display: qrCodeVisible ? 'block' : 'none' }}
            >
              <QRCode value={qrCodeData} />

              <div className={styles.mobile}>
                If you are on mobile you can follow this link instead:
                <Button
                  size="small"
                  style="primary"
                  href={`iden3comm://?i_m=${Buffer.from(qrCodeData).toString(
                    'base64'
                  )}`}
                >
                  Open Polygon ID Wallet
                </Button>
              </div>
            </div>
          )}

          <footer className={styles.footer}>
            <LinkOpener
              className={styles.learnmore}
              openNewTab
              uri="https://polygon.technology/blog/introducing-polygon-id-zero-knowledge-own-your-identity-for-web3"
            >
              Learn more about the underlying concepts
            </LinkOpener>

            <Button
              style="text"
              size="small"
              className={styles.learnmore}
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </footer>
        </div>
      </Modal>
    </>
  )
}
