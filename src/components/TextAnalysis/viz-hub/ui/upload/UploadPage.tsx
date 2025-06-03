import React, { useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import MultiFileUpload from './MultiFileUpload'

interface UploadPageProps {
  onUploadSuccess: () => void
}

const UploadPage: React.FC<UploadPageProps> = ({ onUploadSuccess }) => {
  const { checkDataStatus } = useDataStore()
  const [allUploaded, setAllUploaded] = useState(false)

  // Handler for when files are successfully processed
  const handleFilesProcessed = (successMap: Record<string, boolean>) => {
    // Check if we have at least one successful upload
    const hasAnyData = Object.values(successMap).some((success) => success)

    if (hasAnyData) {
      checkDataStatus()
      setAllUploaded(true)
      onUploadSuccess()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
        Upload Visualization Data
      </h2>

      <div className="mb-6">
        <MultiFileUpload onFilesProcessed={handleFilesProcessed} />
      </div>

      {allUploaded && (
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-center">
          Files processed successfully! You can now view the visualizations.
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
        <h3 className="text-md font-medium text-blue-700 dark:text-blue-300 mb-2">
          About Data Files
        </h3>
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
          Upload your visualization data files individually or in a single ZIP
          archive using these naming conventions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-100 dark:border-blue-800/50">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
              Word Cloud
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              File name:{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                wordcloud.json
              </code>{' '}
              or{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                word_cloud.txt
              </code>
              <br />
              Contains word frequencies for visualization.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-100 dark:border-blue-800/50">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
              Date Distribution
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              File name:{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                date_distribution.csv
              </code>{' '}
              or{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                date.csv
              </code>
              <br />
              CSV format with time and count columns.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-100 dark:border-blue-800/50">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
              Email Distribution
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              File name:{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                email_distribution.csv
              </code>{' '}
              or{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                email.csv
              </code>
              <br />
              CSV with emails_per_day column.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-100 dark:border-blue-800/50">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
              Sentiment Analysis
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              File name:{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                sentiment.json
              </code>
              <br />
              JSON with sentiment categories and values.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-100 dark:border-blue-800/50 md:col-span-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
              Document Summary
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              File name:{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                document_summary.json
              </code>{' '}
              or{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                summary.txt
              </code>
              <br />
              Document statistics and metadata in JSON or text format.
            </p>
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-100 dark:border-yellow-800/50">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-300 flex items-center">
            <svg
              className="h-4 w-4 mr-1.5 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            ZIP Upload Tip
          </h4>
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
            For faster upload, package all your visualization files in a single
            ZIP archive. The system will automatically extract and process each
            file according to its name.
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
        Supported file formats: CSV, JSON, TXT, ZIP
      </p>
    </div>
  )
}

export default UploadPage
