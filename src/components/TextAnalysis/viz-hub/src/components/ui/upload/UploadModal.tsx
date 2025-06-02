import React from 'react'
import UploadPage from '@/components/ui/upload/UploadPage'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * Modal component for the data upload functionality
 */
const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-opacity-20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-3 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Upload Visualization Data
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <UploadPage onUploadSuccess={onSuccess} />
        </div>
      </div>
    </div>
  )
}

export default UploadModal
