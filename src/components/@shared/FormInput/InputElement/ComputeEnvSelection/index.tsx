import Dotdotdot from 'react-dotdotdot'
import slugify from 'slugify'
import PriceUnit from '@shared/Price/PriceUnit'
import Loader from '@shared/atoms/Loader'
import styles from './index.module.css'
import assetSelectionStyles from '../AssetSelection/index.module.css'
import { Empty } from '../AssetSelection'
import { formatDuration, intervalToDuration } from 'date-fns'
import { useMarketMetadata } from '@context/MarketMetadata'
import Tooltip from '@components/@shared/atoms/Tooltip'
import ComputeEnvDetails from './ComputeEnvDetails'

export default function ComputeEnvSelection({
  computeEnvs,
  selected,
  disabled,
  ...props
}: {
  computeEnvs: ComputeEnvironmentExtended[]
  selected?: string
  disabled?: boolean
}): JSX.Element {
  const { approvedBaseTokens } = useMarketMetadata()
  const styleClassesWrapper = `${styles.selection} ${
    disabled ? assetSelectionStyles.disabled : ''
  }`

  return (
    <div className={styleClassesWrapper}>
      <div className={styles.scroll}>
        {!computeEnvs ? (
          <Loader />
        ) : computeEnvs && !computeEnvs.length ? (
          <Empty message="No Compute Environment available." />
        ) : (
          computeEnvs.map((env) => (
            <div className={styles.row} key={env.id}>
              <input
                id={slugify(env.id)}
                className={`${assetSelectionStyles.input} ${assetSelectionStyles.radio}`}
                {...props}
                checked={selected && env.id === selected}
                type="radio"
                value={env.id}
              />
              <label
                className={assetSelectionStyles.label}
                htmlFor={slugify(env.desc || env.id)}
                title={env.desc || env.id}
              >
                <h3 className={assetSelectionStyles.title}>
                  <Dotdotdot clamp={1} tagName="span">
                    {env.desc || env.id}
                  </Dotdotdot>
                  <Tooltip content={<ComputeEnvDetails computeEnv={env} />} />
                </h3>
                <Dotdotdot clamp={1} tagName="code" className={styles.details}>
                  {env?.cpuNumber > 0 && 'CPU | '}
                  {env?.gpuNumber > 0 && 'GPU | '}
                  {'max duration: '}
                  {formatDuration(
                    intervalToDuration({
                      start: 0,
                      end: env?.maxJobDuration * 1000
                    })
                  )}
                </Dotdotdot>
                <PriceUnit
                  price={env.priceMin}
                  size="small"
                  className={assetSelectionStyles.price}
                  symbol={`${
                    approvedBaseTokens?.find(
                      (token) =>
                        token.address.toLowerCase() ===
                        env.feeToken.toLowerCase()
                    )?.symbol || 'EUROe'
                  } / minute`}
                />
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
