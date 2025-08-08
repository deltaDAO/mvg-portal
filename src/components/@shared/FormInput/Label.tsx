import { ReactElement, ReactNode } from 'react'
import styles from './Label.module.css'
import cs from 'classnames'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  noMargin?: boolean
}

const Label = ({ children, noMargin, ...props }: LabelProps): ReactElement => (
  <label className={cs(styles.label, noMargin && styles.noMargin)} {...props}>
    {children}
  </label>
)

export default Label
