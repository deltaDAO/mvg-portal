import React, { useRef, useEffect, useState } from 'react'

interface ListEditModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  value: string
  onChange: (value: string) => void
  onSave: () => void
  language?: string
}

const ListEditModal: React.FC<ListEditModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
  onChange,
  onSave,
  language = 'english'
}) => {
  // Always declare all hooks at the top, regardless of conditions
  const isStoplist = title.includes('Stopwords') || title.includes('Stoplist')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)

  // Reset dirty state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsDirty(false)
      setIsSelecting(false)
    }
  }, [isOpen])

  // Focus textarea when modal opens and position cursor at end
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Set focus
      textareaRef.current.focus()

      // Position cursor at the end
      const length = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(length, length)
    }
  }, [isOpen])

  // Prevent body scrolling when modal is open
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

  // Handle outside click safely - prevent modal closing when selecting text
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if not selecting text and clicking directly on the backdrop
    if (!isSelecting && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Prevent event propagation to parent elements
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Track text selection state
  const handleTextareaMouseDown = () => {
    setIsSelecting(true)
  }

  const handleTextareaMouseUp = () => {
    // Use setTimeout to ensure this happens after any click events
    setTimeout(() => {
      setIsSelecting(false)
    }, 0)
  }

  // Update onChange handler to sync textarea content with state
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    if (!isDirty) setIsDirty(true)
  }

  // Handle save - directly use the value from state
  const handleSaveClick = () => {
    onSave()
    setIsDirty(false)
  }

  // Count words from value
  const wordCount = value
    .split('\n')
    .filter((line) => line.trim().length > 0).length

  // Check for duplicates
  const lines = value
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean)
  const uniqueLines = new Set(lines)
  const hasDuplicates = lines.length !== uniqueLines.size

  // Return null instead of early return
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden"
        onClick={handleContentClick}
      >
        <div className="px-8 py-3 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {isStoplist && (
            <div className="flex items-start mb-4">
              <div className="mr-2 flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 text-sm mb-1">
                  Enter one word per line that you want to exclude from the
                  visualization.
                </p>
                <p className="text-gray-500 text-xs">
                  {`Currently using ${language} stopwords. Changes will be saved to your custom stoplist.`}
                </p>
              </div>
            </div>
          )}
          {!isStoplist && (
            <div className="flex items-start mb-4">
              <div className="mr-2 flex-shrink-0 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 text-sm mb-1">
                  Enter one word per line that you want to include in the
                  visualization.
                </p>
                <p className="text-gray-500 text-xs">
                  Only words in this list will be shown if whitelist is enabled.
                </p>
              </div>
            </div>
          )}
          <div className="relative mb-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextChange}
              onMouseDown={handleTextareaMouseDown}
              onMouseUp={handleTextareaMouseUp}
              onBlur={() => setIsSelecting(false)}
              placeholder={
                isStoplist
                  ? 'Enter words to exclude...'
                  : 'Enter words to include...'
              }
              className="w-full h-64 border border-gray-300 rounded-md p-3 font-mono text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
              aria-label={isStoplist ? 'Stopwords list' : 'Whitelist'}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1.5">
              <div>
                {hasDuplicates && (
                  <span className="text-amber-600">⚠️ Contains duplicates</span>
                )}
              </div>
              <div>
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-2.5 mb-2">
            <p className="text-xs text-gray-600">
              <strong>Tips:</strong> Words are case-insensitive. Empty lines and
              duplicates will be removed automatically.
              {isStoplist &&
                " Common stopwords like 'the', 'and', 'to' should be included."}
              {!isStoplist && ' Add only the specific words you want to show.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-8 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            disabled={!isDirty}
            className={`px-4 py-2 rounded-lg transition-colors text-sm cursor-pointer
              ${
                isDirty
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default ListEditModal
