import React, { useState } from 'react'
import { useDataStore, STORAGE_KEYS } from '@/store/dataStore'
import JSZip from 'jszip'

interface MultiFileUploadProps {
  onFilesProcessed: (successMap: Record<string, boolean>) => void
}

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  onFilesProcessed
}) => {
  const { saveData } = useDataStore()
  const [files, setFiles] = useState<File[]>([])
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [successCount, setSuccessCount] = useState(0)
  const [uploadMode, setUploadMode] = useState<'individual' | 'zip'>('zip')

  // Clear out any previous errors
  const resetErrors = () => {
    setErrors([])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      resetErrors()
      setFiles(Array.from(e.target.files))
      setUploadComplete(false)
    }
  }

  const handleZipFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      resetErrors()
      const file = e.target.files[0]
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        setZipFile(file)
        setUploadComplete(false)
      } else {
        setErrors(['Please select a ZIP file'])
      }
    }
  }

  const mapFileToVisualizationType = (fileName: string): string | null => {
    fileName = fileName.toLowerCase()

    if (fileName.includes('wordcloud') || fileName.includes('word_cloud')) {
      return 'wordCloud'
    } else if (
      fileName.includes('date_distribution') ||
      fileName.includes('date')
    ) {
      return 'dateDistribution'
    } else if (
      fileName.includes('email_distribution') ||
      fileName.includes('email')
    ) {
      return 'emailDistribution'
    } else if (fileName.includes('sentiment')) {
      return 'sentiment'
    } else if (
      fileName.includes('document_summary') ||
      fileName.includes('summary')
    ) {
      return 'documentSummary'
    }

    return null
  }

  const getStorageKey = (visualizationType: string): string => {
    switch (visualizationType) {
      case 'wordCloud':
        return STORAGE_KEYS.WORD_CLOUD
      case 'dateDistribution':
        return STORAGE_KEYS.DATE_DISTRIBUTION
      case 'emailDistribution':
        return STORAGE_KEYS.EMAIL_DISTRIBUTION
      case 'sentiment':
        return STORAGE_KEYS.SENTIMENT
      case 'documentSummary':
        return STORAGE_KEYS.DOCUMENT_SUMMARY
      default:
        return ''
    }
  }

  const processZipFile = async () => {
    if (!zipFile) return

    setUploading(true)
    resetErrors()

    const newErrors: string[] = []
    let processedCount = 0
    const successMap: Record<string, boolean> = {
      wordCloud: false,
      dateDistribution: false,
      emailDistribution: false,
      sentiment: false,
      documentSummary: false
    }

    try {
      // Read the zip file
      const zipData = await zipFile.arrayBuffer()
      const zip = await JSZip.loadAsync(zipData)

      // Extract and process each file in the zip
      const filePromises = Object.keys(zip.files).map(async (filename) => {
        // Skip directories
        if (zip.files[filename].dir) return

        const visualizationType = mapFileToVisualizationType(filename)
        if (!visualizationType) {
          newErrors.push(
            `File "${filename}" in ZIP doesn't match any known naming pattern.`
          )
          return
        }

        try {
          // Get file content as text
          const content = await zip.files[filename].async('string')

          // Determine file type based on extension
          let fileType = 'text/plain'
          if (filename.endsWith('.json')) {
            fileType = 'application/json'
          } else if (filename.endsWith('.csv')) {
            fileType = 'text/csv'
          }

          const storageKey = getStorageKey(visualizationType)

          if (storageKey) {
            // Save to local storage
            saveData(storageKey, content, filename, fileType)
            successMap[visualizationType] = true
            processedCount++
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error'
          newErrors.push(
            `Error extracting "${filename}" from ZIP: ${errorMessage}`
          )
        }
      })

      // Wait for all files to be processed
      await Promise.all(filePromises)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      newErrors.push(`Error processing ZIP file: ${errorMessage}`)
    }

    setSuccessCount(processedCount)
    setErrors(newErrors)
    setUploading(false)
    setUploadComplete(true)

    // Notify parent component
    onFilesProcessed(successMap)
  }

  const processFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    resetErrors()

    const newErrors: string[] = []
    let processedCount = 0
    const successMap: Record<string, boolean> = {
      wordCloud: false,
      dateDistribution: false,
      emailDistribution: false,
      sentiment: false,
      documentSummary: false
    }

    // Process each file
    for (const file of files) {
      const visualizationType = mapFileToVisualizationType(file.name)

      if (!visualizationType) {
        newErrors.push(
          `File "${file.name}" doesn't match any known naming pattern.`
        )
        continue
      }

      try {
        // Create a promise to read the file
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()

          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string)
            } else {
              reject(new Error('Failed to read file'))
            }
          }

          reader.onerror = () => {
            reject(new Error('File reading error'))
          }

          if (
            file.type.includes('text') ||
            file.type.includes('json') ||
            file.type.includes('csv')
          ) {
            reader.readAsText(file)
          } else {
            reader.readAsDataURL(file)
          }
        })

        const storageKey = getStorageKey(visualizationType)

        if (storageKey) {
          // Save to local storage
          saveData(storageKey, fileContent, file.name, file.type)
          successMap[visualizationType] = true
          processedCount++
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        newErrors.push(`Error processing "${file.name}": ${errorMessage}`)
      }
    }

    setSuccessCount(processedCount)
    setErrors(newErrors)
    setUploading(false)
    setUploadComplete(true)

    // Notify parent component
    onFilesProcessed(successMap)
  }

  const fileNamingRules = [
    { name: 'wordcloud.*', description: 'Word cloud visualization data' },
    {
      name: 'date_distribution.*',
      description: 'Date distribution chart data'
    },
    {
      name: 'email_distribution.*',
      description: 'Email distribution chart data'
    },
    { name: 'sentiment.*', description: 'Sentiment analysis data' },
    { name: 'document_summary.*', description: 'Document summary data' }
  ]

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-xl font-medium mb-6 text-gray-800 dark:text-gray-200">
        Upload Your Files
      </h3>

      {/* Upload Mode Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-6 py-2.5 text-sm font-medium cursor-pointer 
            ${
              uploadMode === 'zip'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          onClick={() => setUploadMode('zip')}
        >
          ZIP Archive
        </button>
        <button
          className={`px-6 py-2.5 text-sm font-medium cursor-pointer 
            ${
              uploadMode === 'individual'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          onClick={() => setUploadMode('individual')}
        >
          Multiple Files
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Upload data files following these naming conventions:
      </p>

      <ul className="mb-4 space-y-1.5">
        {fileNamingRules.map((rule, index) => (
          <li key={index} className="flex items-baseline">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">
              •
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {rule.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              - {rule.description}
            </span>
          </li>
        ))}
      </ul>

      {uploadMode === 'zip' ? (
        // ZIP Upload UI
        <div className="">
          <div className="relative">
            <input
              type="file"
              onChange={handleZipFileSelect}
              className="sr-only"
              id="zip-file-upload"
              accept=".zip"
              disabled={uploading || uploadComplete}
            />

            <label
              htmlFor="zip-file-upload"
              className={`flex items-center justify-center p-6 border-2 border-dashed
                rounded-lg transition-colors cursor-pointer
                ${
                  zipFile
                    ? 'border-blue-300 dark:border-blue-500/50 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                } 
                ${
                  uploading || uploadComplete
                    ? 'opacity-70 cursor-not-allowed'
                    : ''
                }`}
            >
              <div className="text-center">
                <svg
                  className={`h-12 w-12 mx-auto mb-3 ${
                    zipFile
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <span
                  className={`block text-sm font-medium ${
                    zipFile
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {zipFile ? zipFile.name : 'Select ZIP Archive...'}
                </span>
                {!zipFile && (
                  <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                    Upload a ZIP file containing all visualization data files
                  </span>
                )}
                {zipFile && (
                  <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                    {(zipFile.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </label>
          </div>

          <button
            onClick={processZipFile}
            disabled={!zipFile || uploading || uploadComplete}
            className={`mt-6 w-full px-4 py-2 rounded-lg text-sm transition-colors ${
              !zipFile || uploading || uploadComplete
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white cursor-pointer'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing ZIP Archive
              </span>
            ) : uploadComplete ? (
              <span className="flex items-center justify-center">
                <svg
                  className="-ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {successCount} File(s) Processed
              </span>
            ) : (
              'Process ZIP Archive'
            )}
          </button>
        </div>
      ) : (
        // Multiple Files Upload UI
        <div className="">
          <div className="relative">
            <input
              type="file"
              onChange={handleFileSelect}
              multiple
              className="sr-only"
              id="multi-file-upload"
              accept=".csv,.json,.txt"
              disabled={uploading || uploadComplete}
            />

            <label
              htmlFor="multi-file-upload"
              className={`flex items-center justify-center p-6 border-2 border-dashed 
                rounded-lg transition-colors cursor-pointer
                ${
                  files.length > 0
                    ? 'border-blue-300 dark:border-blue-500/50 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                } 
                ${
                  uploading || uploadComplete
                    ? 'opacity-70 cursor-not-allowed'
                    : ''
                }`}
            >
              <div className="text-center">
                <svg
                  className={`h-12 w-12 mx-auto mb-3 ${
                    files.length > 0
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span
                  className={`block text-sm font-medium ${
                    files.length > 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : 'Select Files...'}
                </span>
                {!files.length && (
                  <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                    Upload individual data files for each visualization
                  </span>
                )}
                {!!files.length && (
                  <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                    Click to select different files
                  </span>
                )}
              </div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4 mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected files:
              </p>
              <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
                  {files.map((file, index) => {
                    const visualizationType = mapFileToVisualizationType(
                      file.name
                    )
                    const typeColor = visualizationType
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400'
                    const fileTypeText = visualizationType
                      ? `(${visualizationType})`
                      : '(unknown format)'

                    return (
                      <li
                        key={index}
                        className="flex items-center p-1 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <svg
                          className="h-3 w-3 mr-1.5 text-blue-500 dark:text-blue-400 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>{file.name}</span>
                        <span className={`ml-1.5 ${typeColor} text-[10px]`}>
                          {fileTypeText}
                        </span>
                        <span className="ml-auto text-gray-400 dark:text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )}

          <button
            onClick={processFiles}
            disabled={files.length === 0 || uploading || uploadComplete}
            className={`mt-6 w-full px-4 py-2 rounded-lg text-sm transition-colors ${
              files.length === 0 || uploading || uploadComplete
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white cursor-pointer'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing Files
              </span>
            ) : uploadComplete ? (
              <span className="flex items-center justify-center">
                <svg
                  className="-ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {successCount} File(s) Processed
              </span>
            ) : (
              'Process Files'
            )}
          </button>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800/50">
          <p className="text-sm font-medium mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Errors:
          </p>
          <ul className="text-xs list-disc pl-5 mt-1 space-y-1.5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default MultiFileUpload
