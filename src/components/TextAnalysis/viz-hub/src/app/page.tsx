'use client'

import { useEffect, useState } from 'react'
import SentimentChart from '../components/visualizations/sentiment/SentimentChart'
import DataDistribution from '../components/visualizations/distribution/DataDistribution'
import WordCloud from '../components/visualizations/wordcloud'
import DocumentSummary from '../components/visualizations/summary/DocumentSummary'
import Header from '../components/layout/Header'
import VisualizationWrapper from '../components/ui/common/VisualizationWrapper'
import LoadingIndicator from '../components/ui/common/LoadingIndicator'
import FutureFeatures from '../components/ui/common/FutureFeatures'
import { useDataStore } from '../store/dataStore'
import { useTheme } from '../store/themeStore'
import { TextAnalysisUseCaseData } from '@/@context/UseCases/models/TextAnalysis.model'

export interface TextAnalysisProps {
  data: TextAnalysisUseCaseData[]
}

export default function Home({ data }: TextAnalysisProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { checkDataStatus, dataStatus } = useDataStore()
  const { theme } = useTheme()

  useEffect(() => {
    if (data) {
      checkDataStatus(data)
      setIsLoading(false)
    }
  }, [data, checkDataStatus])

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <main>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <VisualizationWrapper
                isAvailable={dataStatus.emailDistributionData}
                title="Email Distribution"
                className=""
              >
                <DataDistribution
                  title="Data Distribution on Email Counts"
                  description="Shows the distribution of email counts over time"
                  type="email"
                  skipLoading={true}
                  data={data}
                />
              </VisualizationWrapper>

              <VisualizationWrapper
                isAvailable={dataStatus.dateDistributionData}
                title="Date Distribution"
                className=""
              >
                <DataDistribution
                  title="Data Distribution on Date"
                  description="Shows the distribution of emails by date"
                  type="date"
                  skipLoading={true}
                  data={data}
                />
              </VisualizationWrapper>
            </div>

            <VisualizationWrapper
              isAvailable={dataStatus.sentimentData}
              title="Sentiment Analysis"
            >
              <SentimentChart skipLoading={true} data={data} />
            </VisualizationWrapper>

            <VisualizationWrapper
              isAvailable={dataStatus.wordCloudData}
              title="Word Cloud"
            >
              <WordCloud data={data} />
            </VisualizationWrapper>

            <VisualizationWrapper
              isAvailable={dataStatus.documentSummaryData}
              title="Document Summary"
            >
              <DocumentSummary skipLoading={true} data={data} />
            </VisualizationWrapper>

            <FutureFeatures />
          </main>
        </div>
      </div>
    </div>
  )
}
