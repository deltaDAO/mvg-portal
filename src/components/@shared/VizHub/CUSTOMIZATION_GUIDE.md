# VizHub Customization Guide

This guide explains how to customize VizHub components for different use cases, including chart labels, component visibility, and adding new customizations.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Component Visibility Control](#component-visibility-control)
3. [Chart Label Customization](#chart-label-customization)
4. [Adding New Use Cases](#adding-new-use-cases)
5. [Extending Customization to Other Components](#extending-customization-to-other-components)
6. [Extension System](#extension-system)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### Basic Configuration

```typescript
// In your use case _constants.ts file
export const MY_USE_CASE_VIZHUB_CONFIG = {
  // Component visibility
  components: {
    wordCloud: true,
    sentiment: true,
    emailDistribution: true,
    dateDistribution: true,
    documentSummary: true,
    futureFeatures: false
  },

  // Chart customization
  customization: {
    dateDistribution: {
      title: 'My Custom Timeline',
      xAxisLabel: 'Custom Date',
      yAxisLabel: 'Custom Count'
    },
    emailDistribution: {
      title: 'My Email Distribution',
      xAxisLabel: 'Custom Emails per Day',
      yAxisLabel: 'Custom Frequency',
      unit: 'custom email units'
    }
  }
}
```

### Using the Configuration

```typescript
// In your use case index.tsx
import { VizHub } from '../@shared/VizHub'
import { MY_USE_CASE_VIZHUB_CONFIG } from './_constants'

export default function MyUseCase() {
  return (
    <VizHub
      config={MY_USE_CASE_VIZHUB_CONFIG}
      useCaseConfig={MY_USE_CASE_CONFIG}
    />
  )
}
```

## Component Visibility Control

### Show/Hide Components

You can control which visualization components are displayed:

```typescript
const config = {
  components: {
    wordCloud: true, // Show word cloud
    sentiment: false, // Hide sentiment analysis
    emailDistribution: true, // Show email distribution
    dateDistribution: false, // Hide date distribution
    documentSummary: true, // Show document summary
    futureFeatures: false // Hide future features placeholder
  }
}
```

### Backward Compatibility

The old configuration format still works:

```typescript
// Legacy format (still supported)
const legacyConfig = {
  showWordCloud: true,
  showSentiment: false,
  showEmailDistribution: true,
  showDateDistribution: false,
  showDocumentSummary: true,
  showFutureFeatures: false
}

// New format takes precedence if both are present
const mixedConfig = {
  // Legacy
  showWordCloud: false,

  // New format overrides legacy
  components: {
    wordCloud: true // This will be used
  }
}
```

## Chart Label Customization

### Distribution Charts

Currently supported customization for `DataDistribution` component:

```typescript
const config = {
  customization: {
    // Date distribution chart
    dateDistribution: {
      title: 'Publication Timeline', // Chart title
      xAxisLabel: 'Publication Date', // X-axis label
      yAxisLabel: 'Number of Publications', // Y-axis label
      dateFormat: '%b %Y', // Optional: date format
      aggregation: 'month' // Optional: aggregation level
    },

    // Email distribution chart
    emailDistribution: {
      title: 'Email Volume Distribution', // Chart title
      xAxisLabel: 'Emails per Day', // X-axis label
      yAxisLabel: 'Frequency', // Y-axis label
      chartType: 'bar', // Optional: chart type
      unit: 'email messages' // Used in descriptions
    }
  }
}
```

### Fallback Values

If customization is not provided, default labels are used:

```typescript
// Default values for date distribution
{
  title: 'Email Count Over Time',
  xAxisLabel: 'Date',
  yAxisLabel: 'Count'
}

// Default values for email distribution
{
  title: 'Distribution of Emails per Day',
  xAxisLabel: 'Emails per Day',
  yAxisLabel: 'Frequency'
}
```

## Adding New Use Cases

### Step 1: Create Configuration

Create a new configuration file for your use case:

```typescript
// src/components/MyNewUseCase/_constants.ts
export const MY_NEW_USE_CASE_VIZHUB_CONFIG = {
  components: {
    wordCloud: true,
    sentiment: true,
    emailDistribution: false, // Not relevant for this use case
    dateDistribution: true,
    documentSummary: true,
    futureFeatures: false
  },

  customization: {
    dateDistribution: {
      title: 'Research Paper Timeline',
      xAxisLabel: 'Publication Date',
      yAxisLabel: 'Papers Published'
    }
    // Add more customizations as needed
  }
}

// Don't forget your UseCaseConfig
export const MY_NEW_USE_CASE_CONFIG = {
  useCaseName: 'myNewUseCase',
  algoDids: {
    // Your algorithm DIDs
  },
  resultZip: {
    // Your ZIP configuration
  }
}
```

### Step 2: Create Component

```typescript
// src/components/MyNewUseCase/index.tsx
import { VizHub } from '../@shared/VizHub'
import {
  MY_NEW_USE_CASE_VIZHUB_CONFIG,
  MY_NEW_USE_CASE_CONFIG
} from './_constants'

export default function MyNewUseCase() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>My New Use Case</h1>

      <VizHub
        config={MY_NEW_USE_CASE_VIZHUB_CONFIG}
        useCaseConfig={MY_NEW_USE_CASE_CONFIG}
      />
    </div>
  )
}
```

### Step 3: Add Route (if needed)

```typescript
// src/pages/usecases/myNewUseCase.tsx
import MyNewUseCase from '../../components/MyNewUseCase'

export default MyNewUseCase
```

## Extending Customization to Other Components

### Adding Customization to WordCloud

To add customization support to the WordCloud component:

#### Step 1: Update Types

```typescript
// src/components/@shared/VizHub/types/index.ts
interface VizHubConfig {
  customization?: {
    // Existing
    emailDistribution?: { ... }
    dateDistribution?: { ... }

    // NEW: Add WordCloud customization
    wordCloud?: {
      title?: string
      maxWords?: number
      colorScheme?: 'default' | 'categorical' | 'sequential'
      fontFamily?: string
      showControls?: boolean
    }
  }
}
```

#### Step 2: Update WordCloud Component

```typescript
// src/components/@shared/VizHub/visualizations/wordcloud/index.tsx
interface WordCloudProps {
  // Existing props...
  customization?: {
    title?: string
    maxWords?: number
    colorScheme?: 'default' | 'categorical' | 'sequential'
    fontFamily?: string
    showControls?: boolean
  }
}

const WordCloud = ({ customization, ...props }: WordCloudProps) => {
  const maxWords = customization?.maxWords || 100
  const title = customization?.title || 'Word Cloud'

  // Use customization values in your component
  return (
    <div>
      <h2>{title}</h2>
      {/* Your word cloud implementation */}
    </div>
  )
}
```

#### Step 3: Update VizHub to Pass Customization

```typescript
// src/components/@shared/VizHub/VizHub.tsx
{
  componentVisibility.wordCloud && (
    <VisualizationWrapper
      isAvailable={dataStatus[STORAGE_KEYS.WORD_CLOUD]}
      title={customization.wordCloud?.title || 'Word Cloud'}
    >
      <WordCloud customization={customization.wordCloud} />
    </VisualizationWrapper>
  )
}
```

#### Step 4: Use in Configuration

```typescript
// In your use case _constants.ts
export const MY_CONFIG = {
  customization: {
    wordCloud: {
      title: 'Legal Terms Frequency',
      maxWords: 150,
      colorScheme: 'categorical',
      fontFamily: 'serif'
    }
  }
}
```

## Extension System

### Adding Custom Components

You can add custom components at specific positions:

```typescript
// Create your custom component
const CustomAnalytics = ({ useCaseConfig }) => (
  <div className="bg-blue-50 p-4 rounded">
    <h3>Custom Analytics for {useCaseConfig.useCaseName}</h3>
    {/* Your custom content */}
  </div>
)

// Add to configuration
const config = {
  extensions: [
    {
      id: 'custom-analytics',
      name: 'Custom Analytics',
      component: CustomAnalytics,
      position: 'before-wordcloud',
      props: {
        customProp: 'value'
      }
    }
  ]
}
```

### Available Positions

- `before-wordcloud`: Before the word cloud component
- `after-wordcloud`: After the word cloud component
- `before-sentiment`: Before the sentiment analysis
- `after-sentiment`: After the sentiment analysis
- `sidebar`: In a sidebar (if layout supports it)
- `footer`: At the bottom of the visualization area

## Real-World Examples

### Legal Documents Use Case

```typescript
export const LEGAL_DOCS_VIZHUB_CONFIG = {
  components: {
    wordCloud: true,
    documentSummary: true,
    dateDistribution: true,
    sentiment: false, // Not relevant for legal docs
    emailDistribution: false // Not relevant for legal docs
  },

  customization: {
    wordCloud: {
      title: 'Legal Term Frequency',
      maxWords: 200,
      colorScheme: 'categorical'
    },
    dateDistribution: {
      title: 'Case Filing Timeline',
      xAxisLabel: 'Filing Date',
      yAxisLabel: 'Number of Cases'
    },
    documentSummary: {
      title: 'Legal Document Analysis',
      showMetrics: ['totalDocuments', 'uniqueWords', 'readabilityIndex']
    }
  }
}
```

### Medical Research Use Case

```typescript
export const MEDICAL_RESEARCH_VIZHUB_CONFIG = {
  components: {
    wordCloud: true,
    sentiment: true,
    documentSummary: true,
    dateDistribution: true,
    emailDistribution: false
  },

  customization: {
    wordCloud: {
      title: 'Medical Terms Analysis',
      maxWords: 100,
      fontFamily: 'sans-serif'
    },
    sentiment: {
      title: 'Research Sentiment Trends',
      chartType: 'area',
      showLegend: true
    },
    dateDistribution: {
      title: 'Publication Timeline',
      xAxisLabel: 'Publication Date',
      yAxisLabel: 'Research Papers'
    }
  }
}
```

### Financial Reports Use Case

```typescript
export const FINANCIAL_REPORTS_VIZHUB_CONFIG = {
  components: {
    wordCloud: true,
    sentiment: true,
    documentSummary: true,
    dateDistribution: true,
    emailDistribution: true
  },

  customization: {
    dateDistribution: {
      title: 'Financial Report Timeline',
      xAxisLabel: 'Report Date',
      yAxisLabel: 'Number of Reports'
    },
    emailDistribution: {
      title: 'Communication Volume',
      xAxisLabel: 'Communications per Day',
      yAxisLabel: 'Frequency',
      unit: 'financial communications'
    },
    sentiment: {
      title: 'Market Sentiment Analysis',
      chartType: 'line'
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Customization Not Applied

**Problem**: Custom labels not showing up

**Solution**: Check that you're passing the customization prop correctly:

```typescript
// ❌ Wrong - not passing customization
<DataDistribution title="My Title" type="date" />

// ✅ Correct - passing customization
<DataDistribution
  title="My Title"
  type="date"
  customization={customization.dateDistribution}
/>
```

#### 2. TypeScript Errors

**Problem**: TypeScript complaining about customization props

**Solution**: Make sure your interface is properly defined:

```typescript
interface MyComponentProps {
  customization?: {
    title?: string
    // Add other optional properties
  }
}
```

#### 3. Components Not Showing

**Problem**: Components not visible despite configuration

**Solution**: Check the component visibility resolution:

```typescript
// Make sure both legacy and new formats work
const config = {
  // Either use legacy format
  showWordCloud: true,

  // Or new format (takes precedence)
  components: {
    wordCloud: true
  }
}
```

### Debugging Tips

1. **Check the VizHub props**: Use browser dev tools to inspect the props being passed to VizHub
2. **Verify configuration**: Console.log your configuration to ensure it's structured correctly
3. **Check component visibility**: Use the browser to inspect if components are being rendered but hidden by CSS
4. **TypeScript errors**: Pay attention to TypeScript warnings - they often indicate configuration issues

## Best Practices

### 1. Configuration Organization

```typescript
// ✅ Good - organized and documented
export const MY_USE_CASE_VIZHUB_CONFIG = {
  // Component visibility
  components: {
    wordCloud: true,
    sentiment: false, // Not relevant for this use case
    emailDistribution: true,
    dateDistribution: true,
    documentSummary: true,
    futureFeatures: false
  },

  // Chart customization
  customization: {
    dateDistribution: {
      title: 'Document Timeline',
      xAxisLabel: 'Document Date',
      yAxisLabel: 'Document Count'
    }
  }
}
```

### 2. Naming Conventions

- Use descriptive configuration names: `LEGAL_DOCS_VIZHUB_CONFIG`
- Use clear customization titles: "Legal Term Frequency" not "Terms"
- Use domain-specific axis labels: "Filing Date" not "Date"

### 3. Backward Compatibility

Always provide fallback values in your components:

```typescript
const title = customization?.title || 'Default Title'
const xAxisLabel = customization?.xAxisLabel || 'Default X Label'
```

### 4. Type Safety

Always define proper TypeScript interfaces for customization:

```typescript
interface CustomizationProps {
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
}
```

---

## Next Steps

1. **Immediate**: Extend customization to WordCloud component
2. **Short term**: Add Sentiment chart customization
3. **Medium term**: Implement component feature toggles
4. **Long term**: Add component slot system for complete customization

For questions or contributions, please refer to the main VizHub documentation or create an issue in the project repository.
