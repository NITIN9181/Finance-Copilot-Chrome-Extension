# Technology Stack

## Chrome Extension

### Framework & Core
- **Plasmo Framework**: React-based Chrome extension framework with built-in HMR, manifest generation, and bundling
- **React 18**: UI library with TypeScript
- **TypeScript**: Type-safe development

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Shadow DOM**: Style isolation to prevent conflicts with host pages

### State Management
- **React Hooks**: Local component state
- **chrome.storage.local**: Persistent storage for API keys

### API Communication
- **Background Service Worker**: Handles authenticated API calls
- **Message Passing**: chrome.runtime messaging between content script and background worker
- **Fetch API**: HTTP client for NVIDIA NIM API requests
- **Streaming**: Server-sent events for real-time chat responses

### External Services
- **NVIDIA NIM API**: `https://integrate.api.nvidia.com/v1/chat/completions`
- **Model**: `meta/llama-3.1-70b-instruct`
- **Authentication**: Bearer token (user-provided)

## Demo Site

### Stack
- **Single HTML file**: No build process required
- **Tailwind CSS CDN**: Styling via CDN link
- **Vanilla JavaScript**: Minimal inline scripts if needed

### Deployment
- **Vercel**: Static site hosting
- **Configuration**: `vercel.json` for routing

## Development Commands

### Extension Development

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

### Testing

```powershell
# Run tests (if test suite exists)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Extension Loading

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `build/chrome-mv3-dev` directory (dev) or `build/chrome-mv3-prod` (production)

## Key Technical Patterns

### Content Script Injection
- Runs in webpage context
- Detects financial tables via DOM scanning
- Injects overlay using Shadow DOM for style isolation

### Message Passing Architecture
```
Content Script → chrome.runtime.sendMessage → Background Worker
Background Worker → API Call → NVIDIA NIM
Background Worker → sendResponse → Content Script → UI Update
```

### API Request Flow
1. User submits query in Chat Interface
2. Content script sends message to background worker with query + dataset
3. Background worker retrieves API key from chrome.storage.local
4. Background worker constructs system prompt with financial data
5. Background worker calls NVIDIA NIM API with streaming enabled
6. Response streams back through message passing
7. Content script updates UI in real-time

### Rate Limiting
- Session-based quota (20 queries per tab session)
- Counter stored in React state (resets on page reload)
- Enforced before sending request to background worker

## Browser Compatibility

- **Target**: Chrome/Chromium browsers (Manifest V3)
- **Minimum Version**: Chrome 88+ (for Manifest V3 support)
- **APIs Used**: chrome.storage, chrome.runtime, chrome.tabs

## Security Considerations

- API keys stored in chrome.storage.local (encrypted by browser)
- API calls isolated in background worker (prevents CORS issues)
- Content Security Policy enforced by Manifest V3
- No eval() or inline scripts in extension context
- Shadow DOM prevents style injection attacks
