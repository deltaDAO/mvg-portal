import { ReactElement } from 'react'
// import Links from './Links'
import styles from './Footer.module.css'
import Image from 'next/image'
import Button from '@shared/atoms/Button'
import { useUserPreferences } from '@context/UserPreferences'

export default function Footer(): ReactElement {
  const currentYear = new Date().getFullYear()
  const { privacyPolicySlug } = useUserPreferences()

  const partnerLogos = [
    {
      src: '/images/logos/interpares.png',
      alt: 'InterPARES Trust AI',
      url: 'https://interparestrustai.org/'
    },
    {
      src: '/images/logos/nserc.svg',
      alt: 'NSERC',
      url: 'https://www.nserc-crsng.gc.ca/'
    },
    {
      src: '/images/logos/sshrc.jpg',
      alt: 'SSHRC',
      url: 'https://www.sshrc-crsh.gc.ca/'
    },
    {
      src: '/images/logos/ubc.png',
      alt: 'UBC',
      url: 'https://www.ubc.ca/'
    },
    {
      src: '/images/logos/udl.svg',
      alt: 'Universidad de Lleida',
      url: 'http://www.udl.es/ca/'
    },
    {
      src: '/images/logos/uned.svg',
      alt: 'UNED',
      url: 'https://www.uned.es/'
    }
  ]

  return (
    <footer className={styles.footer}>
      {/* <Links /> */}

      <div className="py-8 sm:py-10 px-4 sm:px-10 w-full">
        <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-8 md:gap-10">
          {/* Partner Logos - Left Side */}
          <div className="w-full md:max-w-[50%] md:self-center">
            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
              {partnerLogos.map((logo, index) => (
                <a
                  key={index}
                  href={logo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center justify-center bg-white rounded p-2 transition-transform hover:scale-105"
                  style={{
                    width: '95px',
                    height: '85px',
                    margin: '4px'
                  }}
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={72}
                    className="max-h-[60px] sm:max-h-[65px] w-auto"
                    style={{ objectFit: 'contain' }}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Text Content - Right Side */}
          <div className="md:flex-1 md:max-w-2xl text-center md:text-left border-t border-gray-200 md:border-t-0 pt-6 md:pt-0 mt-2 md:mt-0 md:self-center">
            {/* Funding Text */}
            <p className="text-[13px]">
              Clio X draws on research supported by InterPARES Trust AI, The
              Social Sciences and Humanities Research Council of Canada (SSHRC),
              The University of British Columbia (UBC), Universidad Nacional de
              Educación a Distancia (UNED), The University of Lleida (UdL), and
              The Natural Sciences and Engineering Research Council of Canada
              (NSERC).
            </p>

            {/* Copyright and Privacy */}
            <p className="text-[13px] mt-2">
              © {currentYear} Clio X. All rights reserved —{' '}
              <Button
                to={privacyPolicySlug || '/privacy'}
                className={`${styles.link} underline hover:no-underline`}
                style="text"
              >
                Privacy Policy
              </Button>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
