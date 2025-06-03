'use client'

import SentimentChart from './visualizations/sentiment/SentimentChart'
import DataDistribution from './visualizations/distribution/DataDistribution'
import WordCloud from './visualizations/wordcloud'
import DocumentSummary from './visualizations/summary/DocumentSummary'
import VisualizationWrapper from './ui/common/VisualizationWrapper'
import LoadingIndicator from './ui/common/LoadingIndicator'
import FutureFeatures from './ui/common/FutureFeatures'
import { STORAGE_KEYS } from './store/dataStore'
import { useVizHubData } from './hooks/useVizHubData'
import { VizHubThemeProvider } from './store/themeStore'
import type { VizHubProps } from './types'

/**
 * Internal VizHub component that expects to be within a theme provider
 */
function VizHubInternal({
  data,
  config,
  className = '',
  theme = 'light'
}: VizHubProps) {
  const {
    dataStatus,
    processingStatus,
    statusMessage,
    config: effectiveConfig,
    hasAnyData,
    dataSourceInfo
  } = useVizHubData(data, config)

  // Show loading state if processing
  if (processingStatus === 'not_ready') {
    return (
      <div className={`vizhub-container ${className}`}>
        <LoadingIndicator />
      </div>
    )
  }

  // Show error state if there's an error
  if (processingStatus === 'error') {
    return (
      <div className={`vizhub-container ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">Error Loading Data</div>
          <div className="text-gray-600 dark:text-gray-400">
            {statusMessage}
          </div>
        </div>
      </div>
    )
  }

  // Show empty state if no data is available
  if (!hasAnyData) {
    return (
      <div className={`vizhub-container ${className}`}>
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No Data Available</div>
          <div className="text-gray-400 text-sm">
            Please provide data through the data prop or upload data to
            localStorage.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`vizhub-container ${theme} ${className}`}>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <main>
            {/* Debug info (only in development)
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-600 dark:text-blue-400">
                Data source:{' '}
                {dataSourceInfo.usingExternalData
                  ? 'External Props'
                  : 'localStorage'}
              </div>
            )} */}

            {/* Distribution Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Email Distribution */}
              {effectiveConfig.showEmailDistribution && (
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
              )}

              {/* Date Distribution */}
              {effectiveConfig.showDateDistribution && (
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
              )}
            </div>

            {/* Sentiment Analysis */}
            {effectiveConfig.showSentiment && (
              <VisualizationWrapper
                isAvailable={dataStatus[STORAGE_KEYS.SENTIMENT]}
                title="Sentiment Analysis"
              >
                <SentimentChart skipLoading={true} />
              </VisualizationWrapper>
            )}

            {/* Word Cloud */}
            {effectiveConfig.showWordCloud && (
              <VisualizationWrapper
                isAvailable={dataStatus[STORAGE_KEYS.WORD_CLOUD]}
                title="Word Cloud"
              >
                <WordCloud />
              </VisualizationWrapper>
            )}

            {/* Document Summary */}
            {effectiveConfig.showDocumentSummary && (
              <VisualizationWrapper
                isAvailable={dataStatus[STORAGE_KEYS.DOCUMENT_SUMMARY]}
                title="Document Summary"
              >
                <DocumentSummary skipLoading={true} />
              </VisualizationWrapper>
            )}

            {/* Future Features */}
            {effectiveConfig.showFutureFeatures && <FutureFeatures />}
          </main>
        </div>
      </div>
    </div>
  )
}

/**
 * VizHub Component - A self-contained visualization dashboard
 *
 * This component can be used in two modes:
 * 1. With external data (passed via props) - recommended for integration
 * 2. With localStorage data (fallback mode) - for standalone usage
 */
export default function VizHub(props: VizHubProps) {
  return (
    <VizHubThemeProvider theme={props.theme}>
      <VizHubInternal {...props} />
    </VizHubThemeProvider>
  )
}
