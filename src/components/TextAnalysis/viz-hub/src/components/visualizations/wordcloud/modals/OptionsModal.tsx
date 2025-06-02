import React, { useEffect } from 'react'
import { WordCloudOptions } from '../types'
import { FONT_FAMILIES } from '../constants'
import { Language } from '../useStoplistManager'

interface OptionsModalProps {
  isOpen: boolean
  tempOptions: WordCloudOptions
  setTempOptions: (options: WordCloudOptions) => void
  onClose: () => void
  onSave: () => void

  // Stoplist/Whitelist related props
  selectedLanguage: Language
  stoplistActive: boolean
  whitelistActive: boolean
  setLanguage: (language: Language) => void
  toggleStoplist: () => void
  toggleWhitelist: () => void
  onOpenStopwordsModal: () => void
  onOpenWhitelistModal: () => void
}

const languageOptions: {
  value: Language
  label: string
  disabled?: boolean
}[] = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish', disabled: true },
  { value: 'french', label: 'French', disabled: true },
  { value: 'german', label: 'German', disabled: true },
  { value: 'custom', label: 'Custom', disabled: true },
  { value: 'auto-detect', label: 'Auto-detect', disabled: true }
]

const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  tempOptions,
  setTempOptions,
  onClose,
  onSave,

  // Stoplist/Whitelist related props
  selectedLanguage,
  stoplistActive,
  whitelistActive,
  setLanguage,
  toggleStoplist,
  toggleWhitelist,
  onOpenStopwordsModal,
  onOpenWhitelistModal
}) => {
  // Add effect to prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save the current overflow style
      const originalOverflow = document.body.style.overflow
      // Lock scrolling
      document.body.style.overflow = 'hidden'

      // Restore scrolling when modal closes
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const updateOption = <K extends keyof WordCloudOptions>(
    key: K,
    value: WordCloudOptions[K]
  ): void => {
    setTempOptions({
      ...tempOptions,
      [key]: value
    })
  }

  const resetDefaults = (): void => {
    setTempOptions({
      fontFamily: 'Palatino',
      colorSelection: 'random',
      applyGlobally: true
    })
  }

  return (
    <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-[550px] transition-all duration-200 overflow-hidden">
        <div className="px-8 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Word Cloud Options
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Word Filtering Section */}
          <div>
            <h4 className="text-md font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Word Filtering
            </h4>

            {/* Stoplist Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="relative flex items-center">
                    <input
                      id="stoplist-toggle"
                      type="checkbox"
                      checked={stoplistActive}
                      onChange={toggleStoplist}
                      className="appearance-none h-4 w-4 rounded border border-gray-300 dark:border-gray-700 checked:bg-blue-600 dark:checked:bg-blue-500 focus:focus-visible:outline-none focus:focus-visible:ring-2 focus:focus-visible:ring-blue-500 dark:focus:focus-visible:ring-blue-600 cursor-pointer"
                    />
                    {stoplistActive && (
                      <svg
                        className="absolute w-4 h-4 pointer-events-none text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <label
                    htmlFor="stoplist-toggle"
                    className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Enable Stopwords
                  </label>
                </div>
                <button
                  onClick={onOpenStopwordsModal}
                  disabled={!stoplistActive}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors
                            ${
                              stoplistActive
                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/60'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-75'
                            }`}
                  title={
                    !stoplistActive
                      ? 'Enable stopwords first to edit the list'
                      : 'Edit stopwords list'
                  }
                >
                  Edit List
                </button>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stopwords Language:
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className={`form-select block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm 
                            focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 sm:text-sm
                            dark:bg-gray-700 dark:text-gray-200
                            ${
                              !stoplistActive
                                ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-75'
                                : ''
                            }`}
                  disabled={!stoplistActive}
                  title={
                    !stoplistActive
                      ? 'Enable stopwords first to select a language'
                      : ''
                  }
                >
                  {languageOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {stoplistActive
                  ? 'Stopwords are common words (like "the", "and", "to") that will be filtered out of the visualization.'
                  : 'Stopwords filtering is disabled.'}
              </p>

              {selectedLanguage === 'custom' && stoplistActive && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  Using custom stoplist. Click "Edit List" to modify.
                </div>
              )}

              {selectedLanguage === 'auto-detect' && stoplistActive && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  Auto-detecting stopwords based on word frequency patterns.
                </div>
              )}
            </div>

            {/* Whitelist Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="relative flex items-center">
                    <input
                      id="whitelist-toggle"
                      type="checkbox"
                      checked={whitelistActive}
                      onChange={toggleWhitelist}
                      className="appearance-none h-4 w-4 rounded border border-gray-300 dark:border-gray-700 checked:bg-blue-600 dark:checked:bg-blue-500 focus:focus-visible:outline-none focus:focus-visible:ring-2 focus:focus-visible:ring-blue-500 dark:focus:focus-visible:ring-blue-600 cursor-pointer"
                    />
                    {whitelistActive && (
                      <svg
                        className="absolute w-4 h-4 pointer-events-none text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <label
                    htmlFor="whitelist-toggle"
                    className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Enable Whitelist
                  </label>
                </div>
                <button
                  onClick={onOpenWhitelistModal}
                  disabled={!whitelistActive}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors
                            ${
                              whitelistActive
                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/60'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-75'
                            }`}
                  title={
                    !whitelistActive
                      ? 'Enable whitelist first to edit the list'
                      : 'Edit whitelist'
                  }
                >
                  Edit List
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {whitelistActive
                  ? 'Whitelist will only show words explicitly included in your list.'
                  : 'Whitelist filtering is disabled.'}
              </p>

              {whitelistActive && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  Click "Edit List" to specify exactly which words should be
                  shown.
                </div>
              )}
            </div>
          </div>

          {/* Visualization Section */}
          <div>
            <h4 className="text-md font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Visualization
            </h4>

            {/* Font Family */}
            <div className="flex items-center mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-36">
                Font Family:
              </label>
              <div className="flex-1">
                <select
                  value={tempOptions.fontFamily}
                  onChange={(e) => updateOption('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-200"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color Scheme */}
            <div className="flex items-center mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-36">
                Color Scheme:
              </label>
              <div className="flex-1">
                <select
                  value={tempOptions.colorSelection}
                  onChange={(e) =>
                    updateOption(
                      'colorSelection',
                      e.target.value as 'random' | 'monochrome' | 'category'
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="random">Colorful (Random)</option>
                  <option value="monochrome">Monochrome (Blue)</option>
                  <option value="category">Categorical (by frequency)</option>
                </select>
              </div>
            </div>

            {/* Apply Globally */}
            <div className="flex items-center mt-4">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="applyGlobally"
                  checked={tempOptions.applyGlobally}
                  onChange={(e) =>
                    updateOption('applyGlobally', e.target.checked)
                  }
                  className="appearance-none h-4 w-4 rounded border border-gray-300 dark:border-gray-700 checked:bg-blue-600 dark:checked:bg-blue-500 focus:focus-visible:outline-none focus:focus-visible:ring-2 focus:focus-visible:ring-blue-500 dark:focus:focus-visible:ring-blue-600 cursor-pointer"
                />
                {tempOptions.applyGlobally && (
                  <svg
                    className="absolute w-4 h-4 pointer-events-none text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <label
                htmlFor="applyGlobally"
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Apply settings globally to all word clouds
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-8 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
          <button
            onClick={resetDefaults}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default OptionsModal
