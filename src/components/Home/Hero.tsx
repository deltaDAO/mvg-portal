import Container from '@components/@shared/atoms/Container'
import Link from 'next/link'
import Button from '../Home/common/Button'

const scrollToElement = (e: React.MouseEvent, selector: string): void => {
  e.preventDefault()
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth'
  })
}

export default function Hero() {
  return (
    <section className="py-36 relative overflow-hidden">
      {/* Hero background image */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url('/images/hero-background.png')`,
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center'
        }}
      />

      <Container>
        <div className="flex flex-col relative z-10">
          <h1 className="font-sans text-4xl md:text-5xl leading-normal tracking-[-0.019em] font-bold mb-6">
            Explore archival data securely. Build knowledge collectively.
          </h1>

          <p className="font-serif text-lg md:text-xl text-body leading-normal tracking-[-0.019em] font-normal text-left max-w-3xl mb-16 opacity-90">
            ClioX is a new kind of privacy-first platform—built by and for
            researchers, archivists, and cultural institutions. It&apos;s
            designed to help you explore, share, and collaborate on sensitive
            archival material with AI without compromising on privacy or
            ownership.
          </p>

          <div className="flex gap-10">
            <Link
              href="#choose-role"
              onClick={(e) => scrollToElement(e, '#choose-role')}
            >
              <Button
                variant="primary"
                size="lg"
                className="cursor-pointer hover:bg-blue-700 hover:scale-[1.02] transform transition-all duration-200 ease-in-out"
              >
                Get Started
              </Button>
            </Link>
            <Link
              href="#what-we-do"
              onClick={(e) => scrollToElement(e, '#what-we-do')}
            >
              <Button
                variant="secondary"
                size="lg"
                className="cursor-pointer hover:bg-gray-100 hover:scale-[1.02] transform transition-all duration-200 ease-in-out"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
