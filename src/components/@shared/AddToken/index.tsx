import { ReactElement, ReactNode } from 'react'
import classNames from 'classnames/bind'
import { addTokenToWallet } from '@utils/wallet'
import Button from '@shared/atoms/Button'
import OceanLogo from '@images/logo.svg'
import styles from './index.module.css'
import { useNetwork } from 'wagmi'

const cx = classNames.bind(styles)

export interface AddTokenProps {
  address: string
  symbol: string
  decimals?: number
  logo?: {
    image?: ReactNode
    url?: string
  }
  text?: string
  className?: string
  minimal?: boolean
}

export default function AddToken({
  address,
  symbol,
  decimals,
  logo,
  text,
  className,
  minimal
}: AddTokenProps): ReactElement {
  const { chain } = useNetwork()

  const styleClasses = cx({
    button: true,
    minimal,
    [className]: className
  })

  async function handleAddToken() {
    if (!window?.ethereum) return

    await addTokenToWallet(address, symbol, decimals, logo?.url)
  }

  return (
    <Button
      className={styleClasses}
      style="text"
      size="small"
      onClick={handleAddToken}
    >
      <span className={styles.logoWrap}>
        <div className={styles.logo}>{logo?.image || <OceanLogo />}</div>
      </span>

      <span className={styles.text}>
        {text || (
          <>
            {'Add '}
            <span className={styles.symbol}>{symbol}</span>
            {chain && (
              <>
                {' ('}
                <span className={styles.network}>{chain.name}</span>
                {')'}
              </>
            )}
          </>
        )}
      </span>
    </Button>
  )
}
