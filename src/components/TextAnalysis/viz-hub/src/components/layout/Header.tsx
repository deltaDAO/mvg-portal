'use client'

import Logo from './Logo'
import { useTheme } from '../../store/themeStore'

export default function Header() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/20 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto py-3 flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <Logo darkMode={isDark} />
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Text Analysis Visualization Hub
          </h1>
        </div>
      </div>
    </header>
  )
}
