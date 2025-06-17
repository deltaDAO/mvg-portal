# VizHub - Self-Contained Data Visualization Component

VizHub is a completely self-contained React component for data visualization dashboards. It includes all necessary visualization components, stores, hooks, and utilities within a single directory structure.

## 🏗️ Architecture

### Complete Self-Containment

VizHub is designed to be **completely portable** - all dependencies are contained within the `viz-hub` directory:

```
src/components/viz-hub/
├── VizHub.tsx                     # Main component entry point
├── hooks/
│   └── useVizHubData.ts          # Data injection and processing hook
├── store/
│   ├── dataStore.ts              # Main data store (copied from original)
│   └── themeStore.tsx            # Theme management store
├── types/
│   └── index.ts                  # TypeScript type definitions
├── visualizations/               # All visualization components
│   ├── sentiment/
│   │   └── SentimentChart.tsx    # Time-series sentiment analysis
│   ├── distribution/
│   │   ├── DataDistribution.tsx  # Email/date distribution charts
│   │   └── ChartModal.tsx        # Expandable chart modal
│   ├── wordcloud/                # Interactive word cloud
│   │   ├── index.tsx             # Main word cloud component
│   │   ├── store.ts              # Word cloud-specific store
│   │   ├── types.ts              # Word cloud types
│   │   ├── constants.ts          # Configuration constants
│   │   ├── useWordCloudVisualization.ts
│   │   ├── useWordCloudData.ts
│   │   ├── WordDetailPanel.tsx
│   │   └── modals/               # Configuration modals
│   └── summary/
│       └── DocumentSummary.tsx   # Document statistics summary
├── ui/                          # All UI components
│   ├── common/                  # Shared UI components
│   │   ├── VisualizationWrapper.tsx
│   │   ├── LoadingIndicator.tsx
│   │   ├── ChartError.tsx
│   │   ├── ChartSkeleton.tsx
│   │   ├── FutureFeatures.tsx
│   │   └── ...
│   └── upload/                  # Upload-related components
│       ├── MultiFileUpload.tsx
│       ├── UploadModal.tsx
│       └── UploadPage.tsx
└── README.md                    # This documentation
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { VizHub } from './components/viz-hub'

function App() {
  const sampleData = {
    emailDistribution: [
      { time: '2024-01-01', count: 45 },
      { time: '2024-01-02', count: 52 }
    ],
    sentiment: [
      { name: '-1', values: [['2024-01-01T00:00:00Z', 10]] },
      { name: '0', values: [['2024-01-01T00:00:00Z', 25]] },
      { name: '+1', values: [['2024-01-01T00:00:00Z', 15]] }
    ],
    wordCloud: {
      wordCloudData: [
        { value: 'important', count: 45 },
        { value: 'data', count: 32 },
        { value: 'analysis', count: 28 }
      ]
    }
  }

  return (
    <VizHub
      data={sampleData}
      config={{
        showEmailDistribution: true,
        showSentiment: true,
        showWordCloud: true,
        showDocumentSummary: true,
        showDateDistribution: true,
        showFutureFeatures: false
      }}
      theme="light"
      className="my-custom-class"
    />
  )
}
```

### Configuration Options

```tsx
interface VizHubConfig {
  showEmailDistribution?: boolean // Show email count distribution
  showDateDistribution?: boolean // Show date-based distribution
  showSentiment?: boolean // Show sentiment analysis
  showWordCloud?: boolean // Show interactive word cloud
  showDocumentSummary?: boolean // Show document statistics
  showFutureFeatures?: boolean // Show future features placeholder
}
```

### Data Structure

```tsx
interface VizHubData {
  emailDistribution?: EmailDistributionData[]
  dateDistribution?: DateDistributionData[]
  sentiment?: SentimentData[]
  wordCloud?: WordCloudData
  documentSummary?: DocumentSummaryData
}

// Email distribution data format
interface EmailDistributionData {
  emails_per_day: number
}

// Date distribution data format
interface DateDistributionData {
  time: string // Format: "YYYY-MM-DD"
  count: number
}

// Sentiment analysis data format
interface SentimentData {
  name: string // Sentiment level: "-2", "-1", "0", "+1", "+2"
  values: [string, number][] // [ISO date string, count] pairs
}

// Word cloud data format
interface WordCloudData {
  wordCloudData: Array<{
    value: string // The word
    count: number // Frequency count
  }>
}

// Document summary data format
interface DocumentSummaryData {
  totalDocuments: number
  totalWords: number
  uniqueWords: number
  vocabularyDensity: number
  readabilityIndex: number
  wordsPerSentence: number
  frequentWords: Array<{
    word: string
    count: number
  }>
  created: string
}
```

## 📦 Integration Guide

### Option 1: Copy to Another Project

1. **Copy the entire directory:**

   ```bash
   cp -r src/components/viz-hub /path/to/your/project/src/components/
   ```

2. **Install required dependencies:**

   ```bash
   npm install zustand recharts react-wordcloud d3 d3-cloud lodash
   npm install -D @types/d3 @types/lodash
   ```

3. **Use in your project:**

   ```tsx
   import { VizHub } from './components/viz-hub'

   function MyComponent() {
     return <VizHub data={yourData} config={yourConfig} />
   }
   ```

### Option 2: As a Git Submodule

```bash
# Add as submodule
git submodule add <this-repo-url> src/components/viz-hub

# Update submodule
git submodule update --remote
```

## 🎨 Features

### 📊 Visualization Components

1. **Sentiment Analysis Chart**

   - Time-series visualization of sentiment data
   - Multiple sentiment levels (-2 to +2)
   - Interactive tooltips and zoom/pan
   - Brush selection for date range filtering

2. **Data Distribution Charts**

   - Email count distribution (histogram)
   - Date-based distribution (line chart with area)
   - Modal view for detailed exploration
   - Responsive design with theme support

3. **Interactive Word Cloud**

   - D3-powered word cloud visualization
   - Customizable fonts, colors, and layouts
   - Advanced filtering (stopwords, whitelist, search)
   - Word detail panel with statistics
   - Zoom and pan controls

4. **Document Summary**
   - Statistical overview of document corpus
   - Vocabulary density and readability metrics
   - Most frequent words listing
   - Creation date information

### 🎛️ Configuration & Theming

- **Light/Dark Theme Support:** Automatic theme-aware color schemes
- **Responsive Design:** Adapts to container sizes automatically
- **Configurable Display:** Show/hide individual visualizations
- **Custom Styling:** Support for custom CSS classes

### 📱 User Experience

- **Loading States:** Skeleton loaders and loading indicators
- **Error Handling:** Graceful error states with retry functionality
- **Empty States:** Clear messaging when no data is available
- **Accessibility:** ARIA labels and keyboard navigation support

## 🔧 Technical Details

### Automatic Theme Management

VizHub automatically provides its own theme context internally, making it completely self-contained:

```tsx
// ✅ This works automatically - no external ThemeProvider needed
;<VizHub data={data} theme="dark" />

// ✅ The component internally wraps itself with VizHubThemeProvider
export default function VizHub(props: VizHubProps) {
  return (
    <VizHubThemeProvider theme={props.theme}>
      <VizHubInternal {...props} />
    </VizHubThemeProvider>
  )
}
```

**Key Benefits:**

- **No External Dependencies**: VizHub doesn't require your app to have a ThemeProvider
- **Isolated Theming**: VizHub's theme doesn't affect your app's global theme
- **Plug-and-Play**: Just pass the theme prop and it works immediately

### Manual Theme Provider (Advanced)

If you need more control over theming, you can use the theme components directly:

```tsx
import { VizHubThemeProvider, useTheme } from './components/viz-hub'

function CustomThemedApp() {
  return (
    <VizHubThemeProvider theme="dark">
      <VizHub data={data} />
      <MyOtherComponent />
    </VizHubThemeProvider>
  )
}
```

### Data Management

VizHub uses a sophisticated data management system:

1. **External Data Injection:** Props data is injected into localStorage for compatibility
2. **Store Integration:** Zustand stores manage component state and data flow
3. **Backward Compatibility:** Existing visualization components work unchanged
4. **Caching:** Intelligent caching prevents unnecessary re-renders

### Performance Optimizations

- **Debounced Updates:** Prevents excessive re-renders during interactions
- **Data Decimation:** Large datasets are automatically optimized for display
- **Lazy Loading:** Components only render when needed
- **Memory Management:** Proper cleanup of D3 elements and event listeners

### Dependencies

#### Required Dependencies

- `react` (>=18.0.0)
- `zustand` (>=4.0.0) - State management
- `d3` (>=7.0.0) - Data visualization primitives
- `d3-cloud` (>=1.2.0) - Word cloud layout algorithm
- `recharts` (>=2.0.0) - Chart components
- `react-wordcloud` (>=1.2.0) - Word cloud component base
- `lodash` (>=4.17.0) - Utility functions

#### Optional Dependencies

- `tailwindcss` - For styling (recommended)

## 🎯 Advanced Usage

### Custom Theme Integration

```tsx
import { VizHub, useTheme } from './components/viz-hub'

function ThemedApp() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <VizHub data={data} theme={theme} />
    </div>
  )
}
```

### Individual Component Usage

```tsx
import {
  SentimentChart,
  WordCloud,
  DataDistribution
} from './components/viz-hub'

function CustomDashboard() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SentimentChart skipLoading={true} />
      <WordCloud skipLoading={false} />
      <DataDistribution title="Email Volume" type="email" skipLoading={true} />
    </div>
  )
}
```

### Data Store Access

```tsx
import { useDataStore, STORAGE_KEYS } from './components/viz-hub'

function DataManager() {
  const { dataStatus, checkDataStatus, fetchSentimentData } = useDataStore()

  const isDataAvailable = dataStatus[STORAGE_KEYS.SENTIMENT]

  return (
    <div>
      {isDataAvailable ? 'Data Ready' : 'No Data'}
      <button onClick={checkDataStatus}>Refresh</button>
    </div>
  )
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed
2. **Import Errors**: Check that file paths are correct for your setup
3. **Theme Issues**: Verify CSS classes are available (TailwindCSS recommended)
4. **Data Not Loading**: Check data format matches expected interfaces

### Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Features Used**: ES2020, Web APIs (ResizeObserver, localStorage)

## 📚 Development

### Building from Source

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Project Structure Notes

- **Relative Imports Only**: All imports within viz-hub use relative paths
- **Self-Contained Stores**: DataStore and ThemeStore are copied, not referenced
- **No External Dependencies**: Everything needed is within the viz-hub directory
- **TypeScript Support**: Full type safety with comprehensive interfaces

## 📄 License

This component inherits the license of the parent project.

## 🤝 Contributing

When contributing to VizHub:

1. Maintain self-containment - no external project dependencies
2. Use relative imports only
3. Follow existing TypeScript patterns
4. Update this README for any structural changes
5. Test both standalone and integrated usage

---

**VizHub** - Complete, portable, self-contained data visualization for React applications.
