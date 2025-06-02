'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/store/themeStore'

export default function Footer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 mt-2 py-4">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm">
          <div className="flex items-center">
            <Image
              src="/cliox.svg"
              alt="ClioX Logo"
              width={0}
              height={20}
              style={{
                width: 'auto',
                height: '20px',
                filter: isDark
                  ? 'grayscale(100%) brightness(0) invert(70%)'
                  : 'grayscale(100%) brightness(0) invert(55%)'
              }}
              className="max-w-full"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              © {new Date().getFullYear()} ClioX
            </p>
          </div>

          <a
            href="https://www.cliox.org/privacy/en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Privacy
          </a>

          <a
            href="https://www.cliox.org/imprint"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Imprint
          </a>

          <Link
            href="/under-construction"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Manage cookies
          </Link>
        </div>
      </div>
    </footer>
  )
}
