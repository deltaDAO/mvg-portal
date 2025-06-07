import { ReactElement } from 'react'
import Container from '@shared/atoms/Container'

export default function NewsletterBanner(): ReactElement {
  return (
    <section className="bg-[var(--brand-clay-lightest)] py-20 w-full">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--font-color-heading)] mb-0">
              Stay in the loop
            </h2>
          </div>
          <div className="max-w-[520px] text-left">
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              Bite-sized insights on Web3 tech to help you explore Clio-X with
              confidence—delivered monthly.
            </p>
            <button className="bg-[var(--brand-clay)] hover:bg-[var(--brand-clay-dark)] text-white font-bold px-8 py-3 rounded-lg text-base transition-colors duration-200">
              Sign up
            </button>
          </div>
        </div>
      </Container>
    </section>
  )
}
