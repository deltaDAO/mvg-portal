import React from 'react'
import Image from 'next/image'
import chevronUp from './chevron-up.svg'
import frame1000003059 from './frame-1000003059.png'
import image from './image.png'
import image1 from './image.svg'
import line3 from './line-3.svg'
import materialSymbolsLightLanguage from './material-symbols-light-language.svg'
import materialSymbolsPublish from './material-symbols-publish.svg'
import mdiLightSettings from './mdi-light-settings.svg'
import oceanEnterpriseLogoSvg2 from './ocean-enterprise-logo-svg-2.svg'
import styles from './HeroSection.module.css'
import vector2 from './vector-2.svg'
import vector from './vector.png'
import vector1 from './vector.svg'

export const HeroSection: React.FC = () => {
  return (
    <div className={styles['hero-section']}>
      <div className={styles.frame}>
        <div className={styles.div}>
          <Image
            className={styles['ocean-enterprise']}
            alt="Ocean enterprise"
            src={oceanEnterpriseLogoSvg2}
            priority
          />

          <div className={styles['frame-2']}>
            <div className={styles['frame-2']}>
              <div className={styles['frame-2']}>
                <div className={styles['frame-3']}>
                  <Image
                    className={styles.img}
                    alt="Material symbols"
                    src={materialSymbolsLightLanguage}
                  />

                  <Image
                    className={styles['chevron-up']}
                    alt="Chevron up"
                    src={chevronUp}
                  />
                </div>

                <div className={styles['frame-3']}>
                  <Image
                    className={styles.img}
                    alt="Mdi light settings"
                    src={mdiLightSettings}
                  />

                  <Image
                    className={styles['chevron-up']}
                    alt="Chevron up"
                    src={image1}
                  />
                </div>
              </div>

              <div className={styles['text-wrapper']}>
                <div className={styles.text}>ConnectWallet</div>
              </div>

              <div className={styles['frame-4']}>
                <div className={styles.text}>SSI Wallet</div>

                <div className={styles['element-error-icon']} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles['frame-5']}>
          <div className={styles['frame-6']}>
            <div className={styles['frame-7']}>
              <div className={styles['text-wrapper-2']}>
                Ocean Enterprise Demonstration Marketplace
              </div>

              <div className={styles['frame-8']}>
                <p className={styles['publish-find-compare']}>
                  Publish, find, compare, manage and monetize proprietary data
                  &amp; AI products in a secure,
                </p>

                <div className={styles['text-wrapper-3']}>
                  trusted and compliant environment.
                </div>
              </div>
            </div>

            <div className={styles['frame-9']}>
              <div className={styles['frame-10']}>
                <div className={styles['text-wrapper-4']}>Publish an asset</div>

                <button className={styles.button}>
                  <div className={styles['frame-11']}>
                    <Image
                      className={styles.img}
                      alt="Material symbols"
                      src={materialSymbolsPublish}
                    />

                    <div className={styles['text-2']}>Publish</div>
                  </div>
                </button>
              </div>

              <div className={styles['frame-12']}>
                <Image className={styles.line} alt="Line" src={line3} />

                <div className={styles['frame-13']}>
                  <div className={styles['text-wrapper-4']}>
                    Search for data
                  </div>

                  <div className={styles['frame-wrapper']}>
                    <div className={styles['frame-14']}>
                      <div className={styles['text-wrapper-5']}>Search</div>

                      <Image
                        className={styles['frame-15']}
                        alt="Frame"
                        src={frame1000003059}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles['frame-16']}>
            <div className={styles.decentralized}>
              DECENTRALIZED ECOSYSTEM POWERED BY
            </div>

            <div className={styles['frame-17']}>
              <Image className={styles.vector} alt="Vector" src={vector} />

              <Image
                className={styles['vector-2']}
                alt="Vector"
                src={vector1}
              />

              <Image className={styles['vector-3']} alt="Vector" src={image} />

              <Image
                className={styles['vector-4']}
                alt="Vector"
                src={vector2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
