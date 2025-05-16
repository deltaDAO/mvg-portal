'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '@components/@shared/atoms/Container'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: 'What is Web3?',
    answer:
      'Web3 is the next generation of the internet, built on blockchain technology, where users have control over their data and content. Think of it like the difference between renting a house (Web2) and owning it (Web3). While Web2 platforms control your data and content, Web3 gives you the keys to your digital life—offering more privacy, transparency, and autonomy online.'
  },
  {
    question: 'What is Compute-to-Data?',
    answer:
      "Compute-to-Data is a privacy-first approach where computing tasks go to the data—not the other way around. Instead of moving sensitive data across systems, algorithms are sent to the data's location to run computations securely."
  },
  {
    question: 'Who is ClioX?',
    answer:
      'In Greek mythology, Clio was the Muse of history, one of nine daughters of Zeus and Mnemosyne. She is reflected as having a role in preserving and making famous historical events and is often depicted with objects like scrolls, stone tablets or a lyre symbolizing her connection to history and storytelling.'
  }
  // Add more FAQ items here
]

const FAQ = () => {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([])

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <section className="pb-24 bg-white">
      <Container>
        <h2 className="text-4xl font-bold mb-4 font-sans">FAQ</h2>

        <div className="divide-y divide-gray-200">
          {/* <div> */}
          {faqData.map((item, index) => (
            <div key={index} className="py-6">
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex justify-between items-center text-left focus:outline-none group cursor-pointer"
              >
                <h3 className="text-2xl font-bold font-sans group-hover:text-[#a66e4e] text-black/80">
                  {item.question}
                </h3>
                <svg
                  className={`w-6 h-6 text-gray-500 transform transition-transform duration-200 ${
                    expandedIndices.includes(index) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <AnimatePresence>
                {expandedIndices.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-lg font-serif text-black/80 pt-6">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default FAQ
