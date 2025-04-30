'use client'

import { useState } from 'react'
import Image from 'next/image'
import Button from '../Home/common/Button'
import Container from '@components/@shared/atoms/Container'

type Role = {
  imageSrc: string
  title: string
  description: string
  primaryAction: string
  secondaryAction: string
}

const roles: Role[] = [
  {
    imageSrc: '/images/researcher-icon.svg',
    title: 'Researcher',
    description:
      'Explore archival datasets with AI to gain data-driven insights.',
    primaryAction: 'Sign Up',
    secondaryAction: 'Browse Catalogue'
  },
  {
    imageSrc: '/images/archivist-icon.svg',
    title: 'Archivist/Cultural Institution',
    description:
      'Publish and protect your holdings with tools built for ethical AI stewardship and collaboration.',
    primaryAction: 'Sign Up',
    secondaryAction: 'Publish Dataset'
  },
  {
    imageSrc: '/images/partner-icon.svg',
    title: 'Ecosystem Partner',
    description: 'Ready to join a global values-aligned Web3 community?',
    primaryAction: 'Become a Partner',
    secondaryAction: 'Learn More'
  }
]

export default function ChooseRole() {
  const [selectedRole, setSelectedRole] = useState<number | null>(null)

  const handleRoleClick = (index: number) => {
    setSelectedRole(selectedRole === index ? null : index)
  }

  return (
    <section id="choose-role" className="py-16 bg-white">
      <Container className="px-4">
        <div className="w-full mx-auto text-center">
          <h2 className="text-4xl font-bold mb-3 font-sans">
            Choose Your Role
          </h2>
          <p className="text-gray-600 text-lg mb-10 font-serif">
            Select the path that best describes you to see your next steps.
          </p>
        </div>

        <div className="flex justify-between w-full">
          {roles.map((role, index) => (
            <div
              key={index}
              className="flex flex-col h-[600px] w-[360px] relative"
            >
              <div
                className={`flex flex-col items-center text-center h-[450px] w-full
                  cursor-pointer transition-all duration-300 pb-6
                  ${
                    selectedRole === index
                      ? 'ring-2 ring-blue-600 rounded-2xl'
                      : ''
                  }`}
                onClick={() => handleRoleClick(index)}
              >
                <div className="flex flex-col h-full items-center">
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="relative w-[200px] h-[200px]">
                      <Image
                        src={role.imageSrc}
                        alt={`${role.title} icon`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <div className="h-[80px] flex items-center justify-center">
                    <h3 className="text-2xl font-bold font-sans">
                      {role.title}
                    </h3>
                  </div>

                  <div className="h-[100px] flex items-start justify-center pt-2">
                    <p className="text-lg font-serif text-black/80">
                      {role.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-[360px] mx-auto">
                <div
                  className={`space-y-3 transition-all duration-300 ease-out flex flex-col items-center
                    ${
                      selectedRole === index
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95'
                    }`}
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className={`w-[280px] bg-blue-600 hover:bg-blue-700 transform transition-all duration-200 ${
                      selectedRole === index
                        ? 'cursor-pointer'
                        : 'cursor-default pointer-events-none'
                    }`}
                  >
                    {role.primaryAction}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className={`w-[280px] text-blue-600 bg-transparent hover:bg-gray-50 transform transition-all duration-200 ${
                      selectedRole === index
                        ? 'cursor-pointer'
                        : 'cursor-default pointer-events-none'
                    }`}
                  >
                    {role.secondaryAction}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
