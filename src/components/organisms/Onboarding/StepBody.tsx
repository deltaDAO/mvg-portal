import React, { ReactElement } from 'react'
import styles from './StepBody.module.css'
import Markdown from '../../atoms/Markdown'
import StepAction, { IStepAction } from './StepAction'

export default function StepBody({
  body,
  image,
  actions
}: {
  body: string
  image?: string
  actions?: IStepAction[]
}): ReactElement {
  return (
    <div className={styles.content}>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
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
