'use client'

import { useEffect, useState } from 'react'
import SentimentChart from '@/components/visualizations/sentiment/SentimentChart'
import DataDistribution from '@/components/visualizations/distribution/DataDistribution'
import WordCloud from '@/components/visualizations/wordcloud'
import DocumentSummary from '@/components/visualizations/summary/DocumentSummary'
import Header from '@/components/layout/Header'
import VisualizationWrapper from '@/components/ui/common/VisualizationWrapper'
import LoadingIndicator from '@/components/ui/common/LoadingIndicator'
import FutureFeatures from '@/components/ui/common/FutureFeatures'
import UploadModal from '@/components/ui/upload/UploadModal'
import { STORAGE_KEYS, useDataStore } from '@/store/dataStore'
import { useTheme } from '@/store/themeStore'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const { checkDataStatus, dataStatus } = useDataStore()
  const { theme } = useTheme()

  // Check for uploaded data
  useEffect(() => {
    const checkData = () => {
      // Check if any of the required data types exists in localStorage
      const dataExists = Object.values(STORAGE_KEYS).some(
        (key) => localStorage.getItem(key) !== null
      )

      if (dataExists) {
        // Update data status in the store if data exists
        checkDataStatus()
      } else {
        // Auto-open upload modal when no data is present
        setShowUploadModal(true)
      }

      setIsLoading(false)
    }

    checkData()

    // Listen for storage changes in case data is uploaded in another tab
    window.addEventListener('storage', checkData)
    return () => window.removeEventListener('storage', checkData)
  }, [checkDataStatus])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (showUploadModal) {
      // Save the current overflow style
      const originalOverflow = document.body.style.overflow
      // Lock scrolling
      document.body.style.overflow = 'hidden'

      // Restore scrolling when modal closes
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [showUploadModal])

  // Handle successful upload
  const handleUploadSuccess = () => {
    setShowUploadModal(false)
  }

  // Show loading state
  if (isLoading) {
    return <LoadingIndicator />
  }

  // Render the dashboard with visualizations or empty states
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onUploadClick={() => setShowUploadModal(true)} />

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <main>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <VisualizationWrapper
                isAvailable={dataStatus[STORAGE_KEYS.EMAIL_DISTRIBUTION]}
                title="Email Distribution"
                className=""
              >
                <DataDistribution
                  title="Data Distribution on Email Counts"
                  description="Shows the distribution of email counts over time"
                  type="email"
                  skipLoading={true}
                />
              </VisualizationWrapper>

              <VisualizationWrapper
                isAvailable={dataStatus[STORAGE_KEYS.DATE_DISTRIBUTION]}
                title="Date Distribution"
                className=""
              >
                <DataDistribution
                  title="Data Distribution on Date"
                  description="Shows the distribution of emails by date"
                  type="date"
                  skipLoading={true}
                />
              </VisualizationWrapper>
            </div>

            <VisualizationWrapper
              isAvailable={dataStatus[STORAGE_KEYS.SENTIMENT]}
              title="Sentiment Analysis"
            >
              <SentimentChart skipLoading={true} />
            </VisualizationWrapper>

            <VisualizationWrapper
              isAvailable={dataStatus[STORAGE_KEYS.WORD_CLOUD]}
              title="Word Cloud"
            >
              <WordCloud />
            </VisualizationWrapper>

            <VisualizationWrapper
              isAvailable={dataStatus[STORAGE_KEYS.DOCUMENT_SUMMARY]}
              title="Document Summary"
            >
              <DocumentSummary skipLoading={true} />
            </VisualizationWrapper>

            <FutureFeatures />
          </main>
        </div>
      </div>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}
