import Image from 'next/image'
import Container from '@components/@shared/atoms/Container'
import { getLandingPageContent } from '@utils/landingPageContent'

export default function Pillars() {
  const content = getLandingPageContent()
  const { pillars } = content

  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold mb-4 font-sans">{pillars.title}</h2>
          {/* <p className="text-lg font-serif text-gray-700 font-normal mb-16">
            Building a sustainable and ethical future for digital archives and
            cultural heritage
          </p> */}
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
          {pillars.items.map((pillar, index) => (
            <div
              key={pillar.title}
              className={`flex flex-col ${index === 1 ? 'px-4' : ''}`}
            >
              {/* Image */}
              <div className="mb-8 flex items-center justify-center">
                <Image
                  src={pillar.imageSrc}
                  alt={pillar.imageAlt}
                  width={96}
                  height={96}
                  className="object-contain m-[3.125rem]"
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
