'use client'

import Logo from './Logo'
import { useTheme } from '@/store/themeStore'
import { useDataStore } from '@/store/dataStore'
import Dialog from '@/components/ui/Dialog'
import { useState } from 'react'

interface HeaderProps {
  onUploadClick: () => void
}

export default function Header({ onUploadClick }: HeaderProps) {
  const { theme } = useTheme()
  const { dataStatus } = useDataStore()
  const isDark = theme === 'dark'
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Check if any data is available
  const hasAnyData = Object.values(dataStatus).some((status) => status)

  const handleClearData = () => {
    localStorage.clear()
    window.location.reload()
  }

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

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Clear data button (only shown if data exists) */}
          {hasAnyData && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
              Clear Data
            </button>
          )}

          {/* Upload button */}
          <button
            onClick={onUploadClick}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.12a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            Upload Data
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleClearData}
        title="Clear Data"
        message="Are you sure you want to clear all data?"
        confirmText="Clear"
        confirmVariant="danger"
      />
    </header>
  )
}
