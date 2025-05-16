'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Button from '../Home/common/Button'
import Container from '@components/@shared/atoms/Container'

// Add scroll helper function
const scrollToElement = (e: React.MouseEvent, selector: string): void => {
  e.preventDefault()
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth'
  })
}

type Role = {
  imageSrc: string
  title: string
  description: string
  primaryAction: string
  primaryActionLink: string
  secondaryAction: string
  secondaryActionLink: string
}

const roles: Role[] = [
  {
    imageSrc: '/images/home/archivist.png',
    title: 'The Archivist',
    description:
      'Publish and protect your holdings with tools built for ethical AI stewardship and collaboration.',
    primaryAction: 'Sign Up',
    primaryActionLink: '/signup',
    secondaryAction: 'Publish Dataset',
    secondaryActionLink: '/publish/1'
  },
  {
    imageSrc: '/images/home/researcher.png',
    title: 'The Researcher',
    description:
      'Explore archival datasets with AI to gain data-driven insights.',
    primaryAction: 'Sign Up',
    primaryActionLink: '/signup',
    secondaryAction: 'Browse Catalogue',
    secondaryActionLink: '/search?sort=nft.created&sortOrder=desc'
  },
  {
    imageSrc: '/images/home/partner.png',
    title: 'Ecosystem Partner',
    description: 'Ready to join a global values-aligned Web3 community?',
    primaryAction: 'Become a Partner',
    primaryActionLink: '/partner-signup',
    secondaryAction: 'Learn More',
    secondaryActionLink: '#what-we-do'
  }
]

export default function ChooseRole() {
  const [selectedRole, setSelectedRole] = useState<number | null>(null)

  const handleRoleClick = (index: number) => {
    setSelectedRole(selectedRole === index ? null : index)
  }

  return (
    <section id="choose-role" className="pt-16 bg-white">
      <Container className="px-4">
        <div className="w-full mx-auto text-center">
          <h2 className="text-4xl font-bold mb-5 font-sans">
            Choose Your Role
          </h2>
          <p className="text-gray-600 text-lg mb-10 font-serif">
            Select the path that best describes you to see your next steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mx-auto">
          {roles.map((role, index) => (
            <div
              key={index}
              className="flex flex-col w-full mx-auto max-w-[340px] mb-10 md:mb-0"
            >
              <div
                className={`flex flex-col items-center text-center h-auto min-h-[400px] w-full
                  cursor-pointer transition-all duration-300 p-6
                  border border-gray-200 shadow-sm rounded-2xl
                  ${
                    selectedRole === index
                      ? 'ring-1 ring-[#a66e4e]'
                      : 'hover:shadow-md'
                  }`}
                onClick={() => handleRoleClick(index)}
              >
                <div className="flex flex-col h-full items-center">
                  <div className="h-[160px] flex items-center justify-center">
                    <div className="relative w-[96px] h-[96px]">
                      <Image
                        src={role.imageSrc}
                        alt={`${role.title} icon`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-xl font-bold font-heading">
                      {role.title}
                    </h3>
                  </div>

                  <div className="flex items-start justify-center pt-2">
                    <p className="text-base text-black/80 font-body">
                      {role.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full mx-auto">
                <div
                  className={`space-y-3 transition-all duration-300 ease-out flex flex-col items-center
                    ${
                      selectedRole === index
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95'
                    }`}
                >
                  <Link
                    href={role.primaryActionLink}
                    className="w-full flex justify-center"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className={`w-full max-w-[280px] bg-[#a47e5a] hover:bg-[#8e6c4c] border-0 rounded-xl font-medium text-white transform transition-all duration-200 ${
                        selectedRole === index
                          ? 'cursor-pointer'
                          : 'cursor-default pointer-events-none'
                      }`}
                    >
                      {role.primaryAction}
                    </Button>
                  </Link>
                  <Link
                    href={role.secondaryActionLink}
                    className="w-full flex justify-center"
                    onClick={
                      role.secondaryActionLink.startsWith('#')
                        ? (e) => scrollToElement(e, role.secondaryActionLink)
                        : undefined
                    }
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      className={`w-full max-w-[280px] bg-[#efe6d5] hover:bg-[#e6dcc8] border-0 rounded-xl font-medium text-black transform transition-all duration-200 ${
                        selectedRole === index
                          ? 'cursor-pointer'
                          : 'cursor-default pointer-events-none'
                      }`}
                    >
                      {role.secondaryAction}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
