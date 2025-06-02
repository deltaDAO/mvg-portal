import React from 'react'

interface ChartSkeletonProps {
  type: 'line' | 'bar' | 'pie'
  height: number
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ type, height }) => {
  const generateSkeletonPaths = () => {
    if (type === 'line') {
      // Line chart skeleton
      return (
        <g>
          {/* X and Y axes */}
          <rect
            x="50"
            y={height - 30}
            width="80%"
            height="2"
            rx="1"
            className="fill-gray-300"
          />
          <rect
            x="50"
            y="30"
            width="2"
            height={height - 60}
            rx="1"
            className="fill-gray-300"
          />

          {/* Line chart path with pulse animation */}
          <path
            d={`M 50 ${height * 0.7} 
                C ${height * 0.3} ${height * 0.5}, ${height * 0.5} ${
              height * 0.2
            }, ${height * 0.7} ${height * 0.4} 
                S ${height * 1.2} ${height * 0.7}, ${height * 1.5} ${
              height * 0.3
            }`}
            className="stroke-gray-300 animate-pulse"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Points */}
          <circle cx="50" cy={height * 0.7} r="4" className="fill-gray-300" />
          <circle
            cx={height * 0.3}
            cy={height * 0.5}
            r="4"
            className="fill-gray-300"
          />
          <circle
            cx={height * 0.7}
            cy={height * 0.4}
            r="4"
            className="fill-gray-300"
          />
          <circle
            cx={height * 1.2}
            cy={height * 0.7}
            r="4"
            className="fill-gray-300"
          />
          <circle
            cx={height * 1.5}
            cy={height * 0.3}
            r="4"
            className="fill-gray-300"
          />
        </g>
      )
    } else if (type === 'bar') {
      // Bar chart skeleton
      return (
        <g>
          {/* X and Y axes */}
          <rect
            x="50"
            y={height - 30}
            width="80%"
            height="2"
            rx="1"
            className="fill-gray-300"
          />
          <rect
            x="50"
            y="30"
            width="2"
            height={height - 60}
            rx="1"
            className="fill-gray-300"
          />

          {/* Bars */}
          <rect
            x="80"
            y="70"
            width="30"
            height={height - 100}
            rx="2"
            className="fill-gray-300 animate-pulse"
          />
          <rect
            x="130"
            y="100"
            width="30"
            height={height - 130}
            rx="2"
            className="fill-gray-300 animate-pulse"
          />
          <rect
            x="180"
            y="60"
            width="30"
            height={height - 90}
            rx="2"
            className="fill-gray-300 animate-pulse"
          />
          <rect
            x="230"
            y="120"
            width="30"
            height={height - 150}
            rx="2"
            className="fill-gray-300 animate-pulse"
          />
          <rect
            x="280"
            y="90"
            width="30"
            height={height - 120}
            rx="2"
            className="fill-gray-300 animate-pulse"
          />
        </g>
      )
    } else {
      // Pie chart skeleton
      const centerX = height / 2
      const centerY = height / 2
      const radius = height / 3

      return (
        <g>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            className="fill-gray-200"
          />
          <path
            d={`M ${centerX} ${centerY} L ${centerX} ${
              centerY - radius
            } A ${radius} ${radius} 0 0 1 ${centerX + radius * 0.7} ${
              centerY - radius * 0.7
            } Z`}
            className="fill-gray-300 animate-pulse"
          />
          <path
            d={`M ${centerX} ${centerY} L ${centerX + radius * 0.7} ${
              centerY - radius * 0.7
            } A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY} Z`}
            className="fill-gray-400 animate-pulse"
          />
        </g>
      )
    }
  }

  return (
    <div className="w-full flex items-center justify-center">
      <svg width="100%" height={height} className="max-w-full">
        {generateSkeletonPaths()}

        {/* Axis labels */}
        <text
          x="50%"
          y={height - 10}
          textAnchor="middle"
          className="fill-gray-400 text-xs"
        >
          Loading data...
        </text>
      </svg>
    </div>
  )
}

export default ChartSkeleton
