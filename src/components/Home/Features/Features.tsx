import { ReactElement } from 'react'
import styles from './features.module.css'

interface FeatureItem {
  title: string
  description: string
}

export default function Features(): ReactElement {
  const features: FeatureItem[] = [
    {
      title: 'Self Sovereign Identity (SSI)',
      description:
        'To access a service offering, users will be required to identify themselves through a SSI verification process. Access to the service offering will only be granted if the user identity is validated and approved by the provider of the service offering.'
    },
    {
      title: 'Semantic Interoperability and Extensibility',
      description:
        'The description of the service offering conforms with generally accepted industry standards for exchanging data and data services (for example Gaia-X Self-Descriptions), allowing for semantic interoperability and extensibility.'
    },
    {
      title: 'Data Regulation Compliance',
      description:
        'Ocean Enterprise is compliant to the most recent EU regulations related to data exchange, AI and privacy regulation (Data Act, AI Act, GDPR, ...).'
    },
    {
      title: 'Cloud Agnostic Design',
      description:
        'Ability to select preferred cloud providers for computation & storage.'
    }
  ]

  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureHeader}>
                <div className={styles.iconContainer}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
              </div>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
