import Image from 'next/image'
import Container from '@components/@shared/atoms/Container'
import PartnerCarousel from './PartnerCarousel'
import { getLandingPageContent } from '@utils/landingPageContent'

export default function WhatWeDo() {
  const content = getLandingPageContent()
  const { whatWeDo } = content

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
            {whatWeDo.title}
          </h2>
        </div>

        {/* Partner logos carousel */}
        <PartnerCarousel partners={partners} className="w-full" />

        {/* Bottom Content Section */}
        <div className="w-full mx-auto">
          <div className="space-y-8 text-lg">
            {whatWeDo.partnerText.map((paragraph, index) => (
              <p key={index} className="text-lg font-serif text-black/80">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
