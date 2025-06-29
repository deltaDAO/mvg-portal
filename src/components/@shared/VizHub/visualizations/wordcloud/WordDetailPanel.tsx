import React from 'react'
import { WordData } from './types'

interface WordDetailPanelProps {
  selectedWord: WordData
  onClose: () => void
  onFilterToWord: (word: string) => void
  maxCount: number
  allWords: WordData[]
}

const WordDetailPanel: React.FC<WordDetailPanelProps> = ({
  selectedWord,
  onClose,
  onFilterToWord,
  maxCount,
  allWords
}) => {
  // Check if no word is selected
  if (!selectedWord) return null

  return (
    <div className="w-64 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-lg flex-shrink-0 md:h-[550px] transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {selectedWord.value}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full h-6 w-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
          <span className="text-gray-600 dark:text-gray-400 block mb-0.5 text-sm">
            Frequency:
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {selectedWord.count}
          </span>
        </div>

        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
          <span className="text-gray-600 dark:text-gray-400 block mb-0.5 text-sm">
            Relative Frequency:
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {((selectedWord.count / maxCount) * 100).toFixed(2)}%
          </span>
        </div>

        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
          <span className="text-gray-600 dark:text-gray-400 block mb-0.5 text-sm">
            Rank:
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {allWords
              .sort((a, b) => b.count - a.count)
              .findIndex((w) => w.value === selectedWord.value) + 1}
          </span>
        </div>

        <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onFilterToWord(selectedWord.value)}
            className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
          >
            Filter to this word
          </button>
        </div>
      </div>
    </div>
  )
}

export default WordDetailPanel
