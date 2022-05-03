import React, { ReactElement } from 'react'
import styles from './StepBody.module.css'
import Markdown from '../../atoms/Markdown'
import StepAction, { IStepAction } from './StepAction'
import Button from '../../atoms/Button'
import { ReactComponent as Refresh } from '../../../images/refresh.svg'

export default function StepBody({
  body,
  image,
  actions,
  refreshOption
}: {
  body: string
  image?: string
  actions?: IStepAction[]
  refreshOption?: boolean
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
          </div>
        </div>
      </div>
      {image && <img src={image} className={styles.image} />}
    </div>
  )
}
