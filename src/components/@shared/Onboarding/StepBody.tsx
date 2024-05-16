import { ReactElement } from 'react'
import styles from './StepBody.module.css'
import StepAction, { IStepAction } from './StepAction'
import Button from '../atoms/Button'
import Refresh from '@images/refresh.svg'
import Markdown from '../Markdown'

export default function StepBody({
  body,
  image,
  actions,
  refreshOption,
  children
}: {
  body: string
  image?: string
  actions?: IStepAction[]
  refreshOption?: boolean
  children?: ReactElement
}): ReactElement {
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
