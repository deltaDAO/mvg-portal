import { ReactElement } from 'react'
import styles from './StepBody.module.css'
import StepAction, { IStepAction } from './StepAction'
import Button from '../atoms/Button'
import Refresh from '@images/refresh.svg'
import Markdown from '../Markdown'
import AddTokenList from '@components/Header/Wallet/AddTokenList'
import { useAccount } from 'wagmi'
type StepPage = 'TOKENPAGE' | 'FAUCET'
export default function StepBody({
  body,
  image,
  actions,
  refreshOption,
  children,
  stepPage
}: {
  body: string
  image?: string
  stepPage?: StepPage
  actions?: IStepAction[]
  refreshOption?: boolean
  children?: ReactElement
}): ReactElement {
  const { connector: activeConnector } = useAccount()
  return (
    <div className={styles.content}>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          {refreshOption && (
            <div className={styles.refresh}>
              <p>
                Please, before you continue click on the button below to refresh
                the page info.
              </p>
              <Button style="text" onClick={() => location.reload()}>
                <Refresh /> Refresh
              </Button>
            </div>
          )}
          <Markdown text={body} className={styles.paragraph} />
          {stepPage === 'TOKENPAGE' && activeConnector?.name === 'MetaMask' && (
            <div className={styles.tokenList}>
              <AddTokenList />
            </div>
          )}
          {/* {stepPage === 'FAUCET' && (
            <div className={styles.tokenList}>
              <AddTokenList />
            </div>
          )} */}

          <div className={styles.actions}>
            {actions?.map((action) => (
              <StepAction key={action.buttonLabel} {...action} />
            ))}
            {children}
          </div>
        </div>
      </div>
      {image && <img src={image} className={styles.image} />}
    </div>
  )
}
