import { ReactElement, useEffect, useState } from 'react'
import Tooltip from '@shared/atoms/Tooltip'
import styles from './Fees.module.css'
import Input from '@shared/FormInput'
import Decimal from 'decimal.js'
import { useNetwork } from 'wagmi'
import useFactoryRouter from '@hooks/useRouter'

const Default = ({
  title,
  name,
  tooltip,
  value
}: {
  title: string
  name: string
  tooltip: string
  value: string
}) => (
  <Input
    label={
      <>
        {title}
        <Tooltip content={tooltip} />
      </>
    }
    value={value}
    name={name}
    postfixes={['%']}
    readOnly
    size="small"
  />
)

export default function Fees({
  tooltips
}: {
  tooltips: { [key: string]: string }
}): ReactElement {
  const [oceanCommunitySwapFee, setOceanCommunitySwapFee] = useState<string>('')
  const { chain } = useNetwork()
  const { fees } = useFactoryRouter()

  useEffect(() => {
    setOceanCommunitySwapFee(
      fees.swapOceanFee
        ? new Decimal(fees.swapOceanFee).mul(100).toString()
        : '0'
    )
  }, [chain?.id, fees])

  return (
    <>
      <div className={styles.fees}>
        <Default
          title="Community Fee"
          name="communityFee"
          tooltip={tooltips.communityFee}
          value={oceanCommunitySwapFee}
        />
      </div>
    </>
  )
}
