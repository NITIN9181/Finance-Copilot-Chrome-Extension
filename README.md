# Finance Copilot Chrome Extension

AI-powered financial analysis overlay for legacy ERP dashboards.

## Overview

Finance Copilot is a Chrome browser extension that enhances legacy ERP dashboards with AI-powered financial analysis capabilities. The extension detects financial data tables on web pages and injects an interactive overlay providing:

1. **Flux Analysis**: Automatic period-over-period variance analysis with visual indicators
2. **AI Chat**: Natural-language queries about visible financial data powered by NVIDIA NIM API
3. **Migration Simulation**: Side-by-side comparison of legacy vs. modern UI rendering

## Tech Stack

- **Framework**: Plasmo (React-based Chrome extension framework)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS with Shadow DOM isolation
- **API**: NVIDIA NIM API (`meta/llama-3.1-70b-instruct`)
- **Storage**: chrome.storage.local for API key persistence

## Project Structure

```
Finance-Copilot-Chrome-Extension/
├── src/
│   ├── background.ts           # Background service worker
│   ├── content.ts              # Content script (table detection)
│   ├── popup.tsx               # Extension popup (API key config)
│   ├── components/             # React components
│   │   ├── copilot-overlay.tsx
│   │   ├── flux-analysis.tsx
│   │   ├── chat-interface.tsx
│   │   └── migration-modal.tsx
│   ├── lib/                    # Utility functions
│   │   ├── table-detector.ts
│   │   ├── data-extractor.ts
│   │   ├── variance-calculator.ts
│   │   └── api-client.ts
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── demo-site/                  # Standalone demo site
│   ├── demo.html
│   └── vercel.json
└── build/                      # Build output (generated)
```

## Development

### Prerequisites

- Node.js 18+ and npm
- Chrome browser

### Setup

```powershell
# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Build for production
npm run build

# Package extension for Chrome Web Store
npm run package
```

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `build/chrome-mv3-dev` directory

### Demo Site

The demo site simulates a QuickBooks-style ERP dashboard for "Meridian Supply Co." with FY2024 P&L data.

To test locally:
1. Open `demo-site/demo.html` in Chrome
2. The extension will automatically detect the financial table
3. The copilot overlay will activate

## Configuration

### API Key Setup

1. Get your NVIDIA NIM API key from [NVIDIA Build](https://build.nvidia.com/meta/llama-3_1-70b-instruct)
2. Click the extension icon in Chrome toolbar
3. Enter your API key in the popup
4. Click "Save API Key"

## Features

### Flux Analysis
- Automatic period-over-period variance calculation
- Top 3 movers highlighted
- Color-coded by account type and direction:
  - Green: Positive revenue/income or reduced expenses
  - Red: Negative revenue/income
  - Amber: Increased expenses
  - Neutral: Zero change or N/A

### AI Chat
- Natural-language queries about financial data
- Streaming responses from NVIDIA NIM API
- 20 queries per session limit
- Context-aware responses based on visible data

### Migration Modal
- Side-by-side comparison view
- Legacy: Desaturated and blurred
- Modern: Dark theme with enhanced typography

## Security

- API keys stored in `chrome.storage.local` (encrypted by browser)
- API calls isolated in background worker (prevents CORS issues)
- Content Security Policy enforced by Manifest V3
- Shadow DOM prevents style injection attacks

## License

MIT

## Author

Your Name
