'use client'

import { useEffect } from 'react'
import SentimentChart from './visualizations/sentiment/SentimentChart'
import DataDistribution from './visualizations/distribution/DataDistribution'
import WordCloud from './visualizations/wordcloud'
import DocumentSummary from './visualizations/summary/DocumentSummary'
import VisualizationWrapper from './ui/common/VisualizationWrapper'
import LoadingIndicator from './ui/common/LoadingIndicator'
import FutureFeatures from './ui/common/FutureFeatures'
import { STORAGE_KEYS, useDataStore } from './store/dataStore'
import { useVizHubData } from './hooks/useVizHubData'
import { VizHubThemeProvider } from './store/themeStore'
import type { VizHubProps, VizHubConfig } from './types'

/**
 * Helper function to resolve component visibility with backward compatibility
 */
function resolveComponentVisibility(config: VizHubConfig) {
  // New components config takes precedence, fallback to legacy config
  return {
    wordCloud: config.components?.wordCloud ?? config.showWordCloud ?? true,
    sentiment: config.components?.sentiment ?? config.showSentiment ?? true,
    emailDistribution:
      config.components?.emailDistribution ??
      config.showEmailDistribution ??
      true,
    dateDistribution:
      config.components?.dateDistribution ??
      config.showDateDistribution ??
      true,
    documentSummary:
      config.components?.documentSummary ?? config.showDocumentSummary ?? true,
    futureFeatures:
      config.components?.futureFeatures ?? config.showFutureFeatures ?? true
  }
}

/**
 * Helper function to render extensions at a specific position
 */
function renderExtensions(
  extensions: any[] = [],
  position: string,
  useCaseConfig: any
) {
  return extensions
    .filter((ext) => ext.position === position)
    .map((ext) => {
      const Component = ext.component
      return (
        <Component
          key={ext.id}
          useCaseConfig={useCaseConfig}
          {...(ext.props || {})}
        />
      )
    })
}

/**
 * Internal VizHub component that expects to be within a theme provider
 */
function VizHubInternal({
  data,
  config,
  useCaseConfig,
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
  } = useVizHubData(data, config, useCaseConfig)

  // Get the clearAllData function from the data store
  const { clearAllData } = useDataStore()

  // Resolve component visibility with backward compatibility
  const componentVisibility = resolveComponentVisibility(effectiveConfig)

  // Get customization settings
  const customization = effectiveConfig.customization || {}

  // Get extensions
  const extensions = effectiveConfig.extensions || []

  // Force clear data when component unmounts
  useEffect(() => {
    return () => {
      // Clear all data when VizHub component is unmounted
      clearAllData()
    }
  }, [clearAllData])

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
            Please provide data through the data prop or upload data
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`vizhub-container ${theme} ${className}`}>
      <div className="p-6">
        <div className="w-full">
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
              {componentVisibility.emailDistribution && (
                <VisualizationWrapper
                  isAvailable={dataStatus[STORAGE_KEYS.EMAIL_DISTRIBUTION]}
                  title={
                    customization.emailDistribution?.title ||
                    'Email Distribution'
                  }
                  className=""
                >
                  <DataDistribution
                    title={
                      customization.emailDistribution?.title ||
                      'Data Distribution on Email Counts'
                    }
                    description={`Shows the distribution of ${
                      customization.emailDistribution?.unit || 'email counts'
                    } over time`}
                    type="email"
                    skipLoading={true}
                    customization={customization.emailDistribution}
                  />
                </VisualizationWrapper>
              )}

              {/* Date Distribution */}
              {componentVisibility.dateDistribution && (
                <VisualizationWrapper
                  isAvailable={dataStatus[STORAGE_KEYS.DATE_DISTRIBUTION]}
                  title={
                    customization.dateDistribution?.title || 'Date Distribution'
                  }
                  className=""
                >
                  <DataDistribution
                    title={
                      customization.dateDistribution?.title ||
                      'Data Distribution on Date'
                    }
                    description="Shows the distribution of items by date"
                    type="date"
                    skipLoading={true}
                    customization={customization.dateDistribution}
                  />
                </VisualizationWrapper>
              )}
            </div>

            {/* Extensions: before-sentiment */}
            {renderExtensions(extensions, 'before-sentiment', useCaseConfig)}

            {/* Sentiment Analysis */}
            {componentVisibility.sentiment && (
              <VisualizationWrapper
                isAvailable={dataStatus[STORAGE_KEYS.SENTIMENT]}
                title="Sentiment Analysis"
              >
                <SentimentChart skipLoading={true} />
              </VisualizationWrapper>
            )}

            {/* Extensions: after-sentiment */}
            {renderExtensions(extensions, 'after-sentiment', useCaseConfig)}

            {/* Extensions: before-wordcloud */}
            {renderExtensions(extensions, 'before-wordcloud', useCaseConfig)}

            {/* Word Cloud */}
            {componentVisibility.wordCloud && (
              <VisualizationWrapper
                isAvailable={dataStatus[STORAGE_KEYS.WORD_CLOUD]}
                title="Word Cloud"
              >
                <WordCloud />
              </VisualizationWrapper>
            )}

            {/* Extensions: after-wordcloud */}
            {renderExtensions(extensions, 'after-wordcloud', useCaseConfig)}

            {/* Document Summary */}
            {componentVisibility.documentSummary && (
              <VisualizationWrapper
                isAvailable={dataStatus[STORAGE_KEYS.DOCUMENT_SUMMARY]}
                title="Document Summary"
              >
                <DocumentSummary skipLoading={true} />
              </VisualizationWrapper>
            )}

            {/* Future Features */}
            {componentVisibility.futureFeatures && <FutureFeatures />}

            {/* Extensions: footer */}
            {renderExtensions(extensions, 'footer', useCaseConfig)}
          </main>

          {/* Extensions: sidebar */}
          {extensions.some((ext) => ext.position === 'sidebar') && (
            <aside className="w-full md:w-80 mt-6 md:mt-0 md:ml-6">
              {renderExtensions(extensions, 'sidebar', useCaseConfig)}
            </aside>
          )}
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
