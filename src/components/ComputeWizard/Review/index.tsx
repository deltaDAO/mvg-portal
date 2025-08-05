import { ReactElement } from 'react'
import { useFormikContext, Field } from 'formik'
import Input from '@shared/FormInput'
import StepTitle from '@shared/StepTitle'
import { FormComputeData } from '../_types'
import DatasetItem from './DatasetItem'
import PriceDisplay from './PriceDisplay'
import PricingRow from './PricingRow'
import FormErrorGroup from '@shared/FormInput/CheckboxGroupWithErrors'
import styles from './index.module.css'

interface ReviewProps {
  totalPrices?: { value: string; symbol: string }[]
  datasetOrderPrice?: string
  algoOrderPrice?: string
  c2dPrice?: string
  isRequestingPrice?: boolean
}

export default function Review({
  totalPrices = [],
  datasetOrderPrice = '0',
  algoOrderPrice = '0',
  c2dPrice = '0',
  isRequestingPrice = false
}: ReviewProps): ReactElement {
  const { values } = useFormikContext<FormComputeData>()

  const handleCheckCredentials = (datasetId: string) => {
    // TODO: Implement credential checking logic
    console.log('Checking credentials for dataset:', datasetId)
  }

  const formatDuration = (seconds: number): string => {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    const parts: string[] = []
    if (d) parts.push(`${d}d`)
    if (h) parts.push(`${h}h`)
    if (m) parts.push(`${m}m`)
    if (s) parts.push(`${s}s`)
    return parts.join(' ') || '0s'
  }

  // Data arrays for mapping - now using real pricing data
  const computeItems = [
    {
      name: 'ALGORITHM',
      value: algoOrderPrice,
      duration: '1 day'
    },
    {
      name: 'C2D RESOURCES',
      value: c2dPrice,
      duration: formatDuration(values.jobDuration)
    }
  ]

  const marketFees = [
    { name: 'CONSUME MARKET ORDER FEE DATASET (0%)', value: '0' },
    { name: 'CONSUME MARKET ORDER FEE ALGORITHM (0%)', value: '0' },
    { name: 'CONSUME MARKET ORDER FEE C2C (0%)', value: '0' }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <StepTitle title="Review and Purchase" />
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.pricingBreakdown}>
          {/* Datasets */}
          {values.datasets?.map((dataset) => (
            <div key={dataset.id} className={styles.pricingRow}>
              <div className={styles.itemInfo}>
                <DatasetItem
                  dataset={dataset}
                  onCheckCredentials={handleCheckCredentials}
                />
              </div>
              <PriceDisplay value="1" />
            </div>
          ))}

          {/* Dataset Services */}
          {values.datasets?.map((dataset) =>
            dataset.services.map((service) => (
              <PricingRow
                key={service.id}
                itemName={service.name}
                value={service.price}
                duration={service.duration}
                isService={true}
              />
            ))
          )}

          {/* Compute Items */}
          {computeItems.map((item) => (
            <PricingRow
              key={item.name}
              itemName={item.name}
              value={item.value}
              duration={item.duration}
            />
          ))}

          {/* Market Order Fees */}
          {marketFees.map((fee) => (
            <PricingRow key={fee.name} itemName={fee.name} value={fee.value} />
          ))}
        </div>

        {/* Total Payment Section */}
        <div className={styles.totalSection}>
          <span className={styles.totalLabel}>YOU WILL PAY</span>
          <span className={styles.totalValue}>
            {isRequestingPrice ? (
              <span className={styles.totalValueNumber}>Calculating...</span>
            ) : totalPrices.length > 0 ? (
              <>
                <span className={styles.totalValueNumber}>
                  {totalPrices[0].value}
                </span>
                <span className={styles.totalValueSymbol}>
                  {' '}
                  {totalPrices[0].symbol}
                </span>
              </>
            ) : (
              <>
                <span className={styles.totalValueNumber}>0</span>
                <span className={styles.totalValueSymbol}> OCEAN</span>
              </>
            )}
          </span>
        </div>

        <div className={styles.termsSection}>
          <FormErrorGroup
            errorFields={['termsAndConditions', 'acceptPublishingLicense']}
          >
            <Field
              component={Input}
              name="termsAndConditions"
              type="checkbox"
              options={['Terms and Conditions']}
              prefixes={['I agree to the']}
              actions={['/terms']}
              disabled={false}
              hideLabel={true}
            />

            <Field
              component={Input}
              name="acceptPublishingLicense"
              type="checkbox"
              options={['Publishing License']}
              prefixes={['I agree the']}
              actions={['/publishing-license']}
              disabled={false}
              hideLabel={true}
            />
          </FormErrorGroup>
        </div>
      </div>
    </div>
  )
}
