import Image from 'next/image'
import Container from '@components/@shared/atoms/Container'
import PartnerCarousel from './PartnerCarousel'

export default function WhatWeDo() {
  const partners = [
    { id: 1, name: 'Partner 1' },
    { id: 2, name: 'Partner 2' },
    { id: 3, name: 'Partner 3' },
    { id: 4, name: 'Partner 4' },
    { id: 5, name: 'Partner 5' },
    { id: 6, name: 'Partner 6' },
    { id: 7, name: 'Partner 7' },
    { id: 8, name: 'Partner 8' },
    { id: 9, name: 'Partner 9' },
    { id: 10, name: 'Partner 10' }
  ]

  return (
    <section id="what-we-do" className="py-16 bg-white">
      <Container>
        {/* Top Section */}
        <div className="w-full mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4 font-sans">
            Welcoming Values-Aligned Partners
          </h2>
        </div>

        {/* Partner logos carousel */}
        <PartnerCarousel partners={partners} className="w-5xl" />

        {/* Bottom Content Section */}
        <div className="w-5xl mx-auto">
          <div className="space-y-8 text-lg">
            <p className="text-lg font-serif text-black/80">
              This platform was designed to be built together. From memory
              institutions to research labs, our partners are shaping a shared
              Web3 ecosystem grounded in community, care, and transparency.
            </p>

            <p className="text-lg font-serif text-black/80">
              As public institutions increasingly digitize and share records
              online, and as more digital-born records become accessible, the
              risk of using AI, including exposing sensitive personal data, has
              grown significantly.
            </p>

            <p className="text-lg font-serif text-black/80">
              ClioX addresses these risks by allowing archives to manage consent
              and usage rights for their data while ensuring that computations
              are performed where the data is stored. This means that the raw
              data is never moved or exposed; only the results or insights from
              the computations are shared.
            </p>

            <p className="text-lg font-serif text-black/80">
              The platform also provides AI + visual analytic tools to help
              researchers analyze large volumes of archival data and discover
              new insights among them.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
