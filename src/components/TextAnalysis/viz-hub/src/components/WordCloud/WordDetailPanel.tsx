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
    <div className="w-64 bg-gray-50 rounded p-4 border-l border-gray-200 flex-shrink-0 md:h-[550px] transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{selectedWord.value}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-gray-600">Frequency:</span>
          <span className="ml-2 font-medium">{selectedWord.count}</span>
        </div>

        <div>
          <span className="text-gray-600">Relative Frequency:</span>
          <span className="ml-2 font-medium">
            {((selectedWord.count / maxCount) * 100).toFixed(2)}%
          </span>
        </div>

        <div>
          <span className="text-gray-600">Rank:</span>
          <span className="ml-2 font-medium">
            {allWords
              .sort((a, b) => b.count - a.count)
              .findIndex((w) => w.value === selectedWord.value) + 1}
          </span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={() => onFilterToWord(selectedWord.value)}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition-colors"
          >
            Filter to this word
          </button>
        </div>
      </div>
    </div>
  )
}

export default WordDetailPanel
