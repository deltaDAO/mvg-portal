import Image from 'next/image'
import Container from '@components/@shared/atoms/Container'

export default function Pillars() {
  const pillars = [
    {
      id: 1,
      title: 'Ethical Humanities Computing Framework',
      content:
        'We are developing a digital Web3 ecosystem designed to ensure that all participants can contribute equitably and benefit fairly.',
      imageSrc: '/images/ethical-framework-icon.svg',
      imageAlt: 'Ethical Humanities Computing Framework'
    },
    {
      id: 2,
      title: 'Cultural Heritage First Approach',
      content:
        'Our goal is to have a platform that is collectively owned, operated, and developed for the direct benefit of archives and other cultural heritage institutions - prioritizing their sustainability and growth.',
      imageSrc: '/images/heritage-first-icon.svg',
      imageAlt: 'Cultural Heritage First Approach'
    },
    {
      id: 3,
      title: 'Rethinking Traditional Business Models',
      content:
        'Conventional business models have monetized archival and cultural heritage data, generating billion-dollar corporations, often without reinvesting in the archival and cultural heritage community. We seek to shift this dynamic by centering the needs and growth of archives and cultural heritage institutions.',
      imageSrc: '/images/sustainable-model-icon.svg',
      imageAlt: 'Rethinking Traditional Business Models'
    }
  ]

  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold mb-4 font-sans">
            Our Core Pillars
          </h2>
          <p className="text-lg font-serif text-gray-700 font-normal mb-16">
            Building a sustainable and ethical future for digital archives and
            cultural heritage
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.id}
              className={`flex flex-col ${index === 1 ? 'px-4' : ''}`}
            >
              {/* Image */}
              <div className="mb-8 flex items-center justify-center">
                <Image
                  src={pillar.imageSrc}
                  alt={pillar.imageAlt}
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>

              {/* Text content */}
              <div className="space-y-4 max-w-[300px] mx-auto">
                <h3 className="text-2xl font-bold font-sans text-center min-h-[80px] flex items-start justify-center mb-4">
                  {pillar.title}
                </h3>
                <p className="text-lg font-normal font-serif text-black/80 leading-relaxed text-center">
                  {pillar.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
