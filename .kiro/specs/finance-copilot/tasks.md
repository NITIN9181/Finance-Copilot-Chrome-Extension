# Implementation Plan: Finance Copilot Chrome Extension

## Overview

This implementation plan breaks down the Finance Copilot Chrome extension into discrete coding tasks. The extension is built with Plasmo (React + TypeScript) and consists of a content script for table detection, a background worker for API communication, a popup for API key management, and an overlay UI with flux analysis, AI chat, and migration simulation features. A demo site simulating a QuickBooks-style ERP dashboard is also included.

The implementation uses TypeScript with React throughout, following Plasmo framework conventions. The overlay uses a dark theme (bg-gray-900) to contrast with legacy ERP pages, and includes an activation badge that auto-shows on the demo site.

## Tasks

- [x] 1. Set up Plasmo project structure and core configuration
  - Initialize Plasmo project with TypeScript and React
  - Configure manifest.json with required permissions (storage, activeTab)
  - Set up Tailwind CSS with Shadow DOM support and dark theme configuration
  - Create directory structure: src/background/, src/contents/, src/popup/, src/components/, src/lib/, src/types/
  - Configure build scripts and development environment
  - Add demo-site/ directory for standalone HTML demo
  - _Requirements: 1.5, 4.6_

- [x] 2. Implement data models and type definitions
  - [x] 2.1 Create TypeScript interfaces for core data structures
    - Define FinancialDataset interface with metadata, periods, and accounts
    - Define VarianceResult interface with account info, changes, and display properties
    - Define ChatMessage and ChatState interfaces
    - Define StorageSchema for chrome.storage.local
    - Create type definitions for API request/response formats (NimApiRequest, ChatResponse)
    - Define component prop types for all React components
    - _Requirements: 3.1, 3.2_

- [ ] 3. Implement financial table detection and extraction
  - [ ] 3.1 Create table detection algorithm in content script
    - Scan DOM for all table elements on page load (document_idle)
    - Check for data-financial-table="true" attribute (demo site priority)
    - Implement isFinancialTable classifier: ≥1 label column (non-numeric text) AND ≥2 currency columns ($ or , with numbers)
    - Rank tables by currency cell count and select primary table (first in DOM order for ties)
    - Complete detection within 2 seconds of page load
    - _Requirements: 2.1, 2.2, 2.3, 2.6_
  
  - [ ] 3.2 Implement currency parsing utility
    - Parse "$1,234.56" → 1234.56 (strip $ and commas)
    - Parse "($1,234.56)" or "-$1,234.56" → -1234.56 (handle negatives)
    - Parse "1,234,567" → 1234567 (handle comma-only format)
    - Return null for empty or unparseable values
    - Preserve up to 2 decimal places
    - _Requirements: 3.3, 3.5_
  
  - [ ] 3.3 Implement data extraction and serialization
    - Extract account labels from first column
    - Extract period identifiers from header row
    - Build Financial_Dataset JSON with metadata, periods array, and accounts map
    - Use currency parser for all numeric cells
    - Handle null values for empty or unparseable cells
    - Add metadata: sourceUrl, extractedAt timestamp, companyName if detectable
    - _Requirements: 3.1, 3.2, 3.5, 3.6_
  
  - [ ]* 3.4 Write property test for table classification
    - **Property 1: Table Classification Correctness**
    - **Validates: Requirements 2.2**
    - Generate random HTML tables with varying column structures
    - Verify tables with ≥1 label column AND ≥2 currency columns return true
    - Verify tables not meeting criteria return false
  
  - [ ]* 3.5 Write property test for currency parsing
    - **Property 3: Currency Parsing Correctness**
    - **Validates: Requirements 3.3**
    - Generate random currency strings with various formats
    - Verify correct numeric extraction with proper sign handling
    - Verify null return for unparseable strings
  
  - [ ]* 3.6 Write property test for round-trip serialization
    - **Property 4: Serialization Round-Trip Preservation**
    - **Validates: Requirements 3.4**
    - Generate random Financial_Dataset with various account/period combinations
    - Serialize to JSON and deserialize back
    - Verify account labels and period identifiers exactly equal
    - Verify null values preserved, numeric values within 0.01

- [ ] 4. Checkpoint - Verify table detection and extraction
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement activation badge and overlay injection
  - [ ] 5.1 Create activation badge component
    - Render small floating button: fixed position, bottom-right corner
    - Display "✦ Finance Copilot" text with subtle pulse animation
    - On demo site: auto-show after 1500ms with bounce-in animation
    - On other sites: show immediately when financial data detected
    - Click badge to inject overlay
    - _Requirements: 4.1, 2.5_
  
  - [ ] 5.2 Implement overlay injection logic in content script
    - Check for existing overlay before injection (prevent duplicates)
    - Create Shadow DOM root for style isolation
    - Mount React CopilotOverlay component in shadow root
    - Pass extracted Financial_Dataset as prop
    - Apply position: fixed, right: 20px, bottom: 20px, z-index: 9999
    - Complete injection within 1 second of activation
    - _Requirements: 4.1, 4.6, 4.7_
  
  - [ ]* 5.3 Write unit tests for overlay injection
    - Test duplicate injection prevention
    - Test Shadow DOM creation
    - Test overlay positioning and z-index
    - _Requirements: 4.7_

- [ ] 6. Implement API key management in popup
  - [ ] 6.1 Create popup UI component with dark theme
    - Build input field (max 512 chars, password type) for API key
    - Add save button (disabled when input empty/whitespace)
    - Display status indicator: "API Key Configured ✓" or "No API Key Set"
    - Show validation and success messages
    - Add link to NVIDIA NIM API documentation
    - Use dark theme matching overlay (bg-gray-900)
    - Width: 320px (standard extension popup)
    - _Requirements: 5.1, 5.3, 5.5, 5.6_
  
  - [ ] 6.2 Implement chrome.storage.local integration
    - Save API key with whitespace trimming (key: "nvidia_api_key")
    - Retrieve API key on popup mount to show status
    - Handle storage errors gracefully with error display
    - Display save-success confirmation on successful save
    - _Requirements: 5.2, 5.4, 5.9_
  
  - [ ]* 6.3 Write property test for API key trimming
    - **Property 5: API Key Trimming Consistency**
    - **Validates: Requirements 5.2**
    - Generate random strings with whitespace variations
    - Verify trimming produces non-empty string for valid input
    - Verify idempotence (multiple trims = single trim)
  
  - [ ]* 6.4 Write unit tests for API key validation
    - Test empty string rejection with validation message
    - Test whitespace-only rejection
    - Test valid key acceptance with trimming
    - Test storage error handling
    - _Requirements: 5.4, 5.9_

- [ ] 7. Implement background worker for API communication
  - [ ] 7.1 Create message listener for chat queries
    - Listen for CHAT_QUERY messages from content script
    - Retrieve API key from chrome.storage.local (key: "nvidia_api_key")
    - Validate sender is from extension (security check)
    - Handle missing API key error with clear message
    - _Requirements: 5.7, 5.10, 7.2_
  
  - [ ] 7.2 Implement NVIDIA NIM API client
    - Build chat completion request to https://integrate.api.nvidia.com/v1/chat/completions
    - Set model: "meta/llama-3.1-70b-instruct"
    - Configure max_tokens: 300, temperature: 0.3, stream: true
    - Add Bearer token authentication with stored API key
    - Construct system prompt with Financial_Dataset JSON
    - Implement 30-second timeout with AbortController
    - _Requirements: 7.3, 7.4, 7.8_
  
  - [ ] 7.3 Implement streaming response handler
    - Parse Server-Sent Events (SSE) format from API
    - Extract content deltas from response chunks
    - Send response tokens back to content script via message passing
    - Handle [DONE] signal to complete stream
    - Handle API errors (401, 429, 500) with user-friendly messages
    - _Requirements: 7.5, 7.6_
  
  - [ ]* 7.4 Write integration tests for API client
    - Mock NVIDIA NIM API responses
    - Test successful streaming response parsing
    - Test error handling (401: invalid key, 429: rate limit, 500: server error)
    - Test timeout handling (30 seconds)
    - _Requirements: 7.6, 7.8_

- [ ] 8. Checkpoint - Verify API communication
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Copilot Overlay container
  - [ ] 9.1 Create overlay component with dark theme
    - Render main container: width 400px (desktop), 100vw-32px (mobile), max-height 80vh
    - Apply dark theme: bg-gray-900, border-gray-700, text-white
    - Add header with "Finance Copilot" branding and controls (minimize, close)
    - Implement tab navigation: "Analysis", "Ask AI", "Migrate"
    - Add footer with status indicators
    - Make header draggable for repositioning
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [ ] 9.2 Implement overlay state management
    - Initialize with extracted Financial_Dataset
    - Track active tab (flux/chat/migration)
    - Track visibility state (visible/minimized)
    - Handle close action: hide panel and restore host page
    - Display error message if close fails
    - _Requirements: 4.4, 4.5_
  
  - [ ]* 9.3 Write unit tests for overlay controls
    - Test tab switching functionality
    - Test minimize/restore functionality
    - Test close and cleanup
    - Test error handling for failed close
    - _Requirements: 4.4, 4.5_

- [ ] 10. Implement Flux Analysis component
  - [ ] 10.1 Create variance computation logic
    - Calculate period-over-period percentage change: ((current - prior) / prior) * 100
    - Use most recent period as current, immediately preceding as prior
    - Round to 1 decimal place
    - Handle N/A cases: prior value is zero or null
    - Compute absolute change for ranking
    - _Requirements: 6.1, 6.8_
  
  - [ ] 10.2 Implement account classification
    - Classify as "revenue": label contains "revenue", "sales", "income" (case-insensitive)
    - Classify as "net-income": label contains "net income", "net profit"
    - Classify as "expense": label contains "expense", "cost", "payroll", "marketing", etc.
    - Default to "other" for unmatched labels
    - _Requirements: 6.4, 6.5, 6.6, 6.7_
  
  - [ ] 10.3 Implement top movers identification
    - Rank all accounts by absolute percentage change (descending)
    - Select top 3 accounts with applicable (non-N/A) changes
    - Break ties by ascending account row order in dataset
    - Handle fewer than 3 applicable accounts (flag all available)
    - _Requirements: 6.3_
  
  - [ ] 10.4 Implement color assignment logic
    - Revenue/Net Income: green (text-green-400) if positive, red (text-red-400) if negative
    - Expenses: amber (text-amber-400) if positive, green if negative
    - Other/Zero/N/A: neutral gray (text-gray-400)
    - _Requirements: 6.4, 6.5, 6.6, 6.7, 6.9_
  
  - [ ] 10.5 Create Variance Card UI component
    - Card styling: rounded-lg, bg-gray-800, p-3, mb-2
    - Display account label (row name)
    - Display period transition (Q3 → Q4)
    - Display absolute values ($1,050,000 → $1,210,000)
    - Display percentage change with arrow (↑ or ↓) and color
    - Display dollar change
    - Add one-line plain English note
    - Show 🔥 badge for top movers
    - _Requirements: 6.2, 6.9_
  
  - [ ] 10.6 Create Flux Analysis layout
    - Top Movers section: 3 cards in grid (1 column mobile, 3 desktop)
    - All Accounts section: scrollable list with compact cards
    - Auto-compute and display on overlay activation (no user input required)
    - _Requirements: 6.1_
  
  - [ ]* 10.7 Write property test for variance calculation
    - **Property 6: Variance Calculation Accuracy**
    - **Validates: Requirements 6.1**
    - Generate random prior/current value pairs
    - Verify percentage change formula: ((current - prior) / prior) * 100
    - Verify rounding to 1 decimal place
    - Test N/A handling for zero/null prior values
  
  - [ ]* 10.8 Write property test for top movers selection
    - **Property 7: Top Movers Selection Correctness**
    - **Validates: Requirements 6.3**
    - Generate random variance result lists
    - Verify top 3 selection by absolute change (descending)
    - Verify tie-breaking by original list order
    - Test with fewer than 3 applicable accounts
  
  - [ ]* 10.9 Write unit tests for account classification
    - Test revenue keywords (revenue, sales, income)
    - Test expense keywords (expense, cost, payroll, marketing)
    - Test net income keywords (net income, net profit)
    - Test case-insensitivity
    - Test default "other" classification
    - _Requirements: 6.4, 6.5, 6.6, 6.7_

- [ ] 11. Implement Chat Interface component
  - [ ] 11.1 Create chat UI with message history
    - Build input field: full width, rounded-full, bg-gray-800, border-gray-600, max 1000 chars
    - Add character counter: "245/1000" in small gray text
    - Display chat history with message bubbles
    - User messages: right-aligned, bg-blue-600
    - AI messages: left-aligned, bg-gray-800
    - Show loading state: animated "..." dots while waiting
    - Render query counter: "14 / 20 queries used" in small gray text
    - _Requirements: 7.1, 8.3_
  
  - [ ] 11.2 Implement query submission logic
    - Validate non-empty input (reject empty/whitespace-only)
    - Check query quota before submission (must be < 20)
    - Check API key configured (retrieve from storage)
    - Send CHAT_QUERY message to background worker with query and dataset
    - Increment query counter on submission
    - Disable input during request
    - _Requirements: 7.2, 7.7, 8.2, 5.8_
  
  - [ ] 11.3 Implement response streaming
    - Receive response tokens from background worker via message passing
    - Append tokens to chat history in real-time
    - Update UI as tokens arrive (streaming effect)
    - Handle API errors with user-friendly messages
    - Display error and retain query in input field on error
    - _Requirements: 7.5, 7.6_
  
  - [ ] 11.4 Implement rate limiting
    - Initialize query count to 0 on session start (component mount)
    - Block submission when count equals 20 (quota reached)
    - Display "Query limit reached (20/20). Reload page to reset." message
    - Display remaining queries: Query_Quota (20) - queriesUsed
    - Reject query if session count uninitialized with "Queries unavailable" message
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 8.6_
  
  - [ ]* 11.5 Write property test for query quota enforcement
    - **Property 8: Query Quota Enforcement**
    - **Validates: Requirements 8.1, 8.2**
    - Simulate query submissions with quota set to 20
    - Verify counter increments by 1 for each submission while < 20
    - Verify submissions rejected when counter equals 20
    - Verify counter remains at 20 for subsequent attempts
  
  - [ ]* 11.6 Write unit tests for input validation
    - Test empty string rejection with validation message
    - Test whitespace-only rejection
    - Test character limit enforcement (1000 chars)
    - Test API key check before submission
    - _Requirements: 7.7, 5.8_

- [ ] 12. Checkpoint - Verify overlay features
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement Migration Modal component
  - [ ] 13.1 Create modal UI with split view layout
    - Build full-screen overlay: z-index 9999, backdrop blur
    - Create split view: left 40% (legacy), right 60% (modern)
    - Add close button in top-right corner
    - Implement smooth fade-in animation (300ms)
    - Add animated divider between sides
    - _Requirements: 9.1, 9.4_
  
  - [ ] 13.2 Implement legacy representation renderer
    - Apply desaturated filter (grayscale)
    - Apply 2px blur effect
    - Use traditional table styling: Times New Roman font, tight spacing
    - Label section: "Legacy ERP"
    - Display all accounts and periods from dataset
    - _Requirements: 9.5, 9.7_
  
  - [ ] 13.3 Implement modern DualEntry representation renderer
    - Apply dark theme: #1a1a1a background
    - Use enhanced typography: Inter/SF Pro font, generous spacing
    - Add accent colors and subtle shadows
    - Label section: "DualEntry ✦"
    - Display same account labels, period identifiers, and numeric values as legacy
    - _Requirements: 9.6, 9.7_
  
  - [ ] 13.4 Implement modal activation logic
    - Add "Simulate DualEntry Migration" button in overlay
    - Disable button when no Financial_Dataset extracted
    - Enable button when dataset available
    - Render comparison within 1 second of button activation
    - Handle rendering errors: display error message, retain dataset
    - _Requirements: 9.2, 9.3, 9.4, 9.8_
  
  - [ ] 13.5 Implement modal close logic
    - Close modal on close button click
    - Hide comparison view
    - Return focus to Copilot_Overlay
    - _Requirements: 9.9_
  
  - [ ]* 13.6 Write unit tests for modal state management
    - Test button enable/disable based on dataset availability
    - Test modal open/close functionality
    - Test error handling for rendering failures
    - _Requirements: 9.2, 9.8, 9.9_

- [ ] 14. Create demo site
  - [ ] 14.1 Build single-page HTML demo site
    - Create HTML structure with "Meridian Supply Co." as visible page heading
    - Add "FY2024 Financial Dashboard" subtitle
    - Build financial table with data-financial-table="true" attribute
    - Include 9 specified accounts: Revenue, Cost of Goods Sold, Gross Profit, Marketing Expenses, Payroll, Software & Tools, Travel & Entertainment, Office & Facilities, Net Income
    - Display Q1-Q4 2024 data with exact values from design document
    - Format all values with leading "$" and comma thousands separators
    - Use Tailwind CSS CDN (https://cdn.tailwindcss.com)
    - Apply QuickBooks-inspired color scheme (green/blue accents)
    - Make table responsive (horizontal scroll on mobile)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 14.2 Add Vercel configuration
    - Create vercel.json in demo-site/ directory
    - Configure route: "/" → "/demo.html"
    - Add Content-Security-Policy header for Tailwind CDN
    - _Requirements: 1.6_
  
  - [ ]* 14.3 Test demo site without CDN
    - Verify table displays correctly if Tailwind CDN fails to load
    - Verify all 9 accounts and their FY2024 values visible
    - Verify financial table structure intact
    - _Requirements: 1.7_

- [ ] 15. Implement auto-activation for demo site
  - Detect demo site by checking for data-financial-table="true" attribute
  - Automatically show activation badge after 1500ms with bounce-in animation
  - Automatically activate Copilot_Overlay on demo page when badge clicked
  - Ensure detection completes within 2 seconds of page load
  - _Requirements: 2.5_

- [ ] 16. Implement error handling and user feedback
  - [ ] 16.1 Add error boundaries to React components
    - Wrap CopilotOverlay with error boundary
    - Wrap FluxAnalysis, ChatInterface, MigrationModal with error boundaries
    - Display fallback UI on render errors: "Failed to render [component]. Please reload."
    - Log errors to console for debugging
  
  - [ ] 16.2 Implement API error mapping
    - Map 401 to "Invalid API key. Please check your configuration."
    - Map 429 to "Rate limit exceeded. Please try again later."
    - Map 500 to "API service error. Please try again."
    - Map timeout to "Request timed out. Please try again."
    - Map network errors to "Network error. Please check your connection."
    - Display error in chat interface and retain query in input field
    - _Requirements: 7.6_
  
  - [ ] 16.3 Add user feedback for edge cases
    - Display warning banner for partial data extraction (some cells unparseable)
    - Show "Please configure your API key in the extension popup" when no key configured
    - Display "No financial tables detected" when appropriate (silent - no overlay injection)
    - Handle storage errors with clear error messages
    - _Requirements: 5.8, 2.4_

- [ ] 17. Final integration and polish
  - [ ] 17.1 Wire all components together
    - Connect content script to activation badge and overlay injection
    - Connect overlay to background worker messaging (CHAT_QUERY)
    - Connect popup to chrome.storage.local for API key
    - Verify message passing between content script and background worker
    - Verify all features work end-to-end on demo site
  
  - [ ] 17.2 Apply final styling and theming
    - Implement dark theme color palette: bg-gray-900, text-white, border-gray-700
    - Apply variance colors: green (text-green-400), red (text-red-400), amber (text-amber-400), neutral (text-gray-400)
    - Use system font stack: -apple-system, BlinkMacSystemFont, sans-serif
    - Apply font-mono for data values (numbers)
    - Use shadow-2xl and rounded-2xl for floating panel
    - Ensure consistent spacing and typography across all components
    - Verify Shadow DOM style isolation (no host page interference)
    - Test responsive behavior (mobile viewport)
  
  - [ ]* 17.3 Write property test for data extraction structure
    - **Property 2: Data Extraction Structure Validity**
    - **Validates: Requirements 3.1**
    - Generate random valid Financial_Tables
    - Extract Financial_Dataset
    - Verify exactly one value entry per account/period combination
    - Verify all values are numeric or null
  
  - [ ]* 17.4 Write end-to-end integration tests
    - Test full flow: page load → detection → extraction → badge → overlay → flux analysis
    - Test chat flow: query submission → background worker → API → streaming → display
    - Test migration flow: button click → modal render → comparison display → close
    - Test error scenarios: no API key, quota exceeded, API errors
    - _Requirements: 2.1, 4.1, 6.1, 7.2, 9.4_

- [ ] 18. Final checkpoint - Complete testing and verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design uses TypeScript with React (Plasmo framework) for all implementation
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design (8 properties total)
- Unit tests validate specific examples and edge cases
- The demo site is a standalone HTML file requiring no build step
- API key is stored securely in chrome.storage.local with key "nvidia_api_key"
- Query quota (20 per session) prevents excessive API usage
- Shadow DOM ensures style isolation between overlay and host page
- Dark theme (bg-gray-900) used throughout overlay to contrast with legacy ERP pages
- Activation badge auto-shows on demo site after 1500ms with bounce-in animation
- All API calls go through background worker (never from content script) to handle CORS

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2.1"] },
    { "id": 1, "tasks": ["3.1", "14.1"] },
    { "id": 2, "tasks": ["3.2", "14.2"] },
    { "id": 3, "tasks": ["3.3", "5.1", "6.1"] },
    { "id": 4, "tasks": ["3.4", "3.5", "3.6", "5.2", "6.2", "14.3"] },
    { "id": 5, "tasks": ["5.3", "6.3", "6.4", "7.1"] },
    { "id": 6, "tasks": ["7.2", "9.1"] },
    { "id": 7, "tasks": ["7.3", "9.2"] },
    { "id": 8, "tasks": ["7.4", "9.3", "10.1"] },
    { "id": 9, "tasks": ["10.2", "10.3", "10.4"] },
    { "id": 10, "tasks": ["10.5", "11.1"] },
    { "id": 11, "tasks": ["10.6", "11.2", "13.1"] },
    { "id": 12, "tasks": ["10.7", "10.8", "10.9", "11.3", "13.2"] },
    { "id": 13, "tasks": ["11.4", "13.3"] },
    { "id": 14, "tasks": ["11.5", "11.6", "13.4"] },
    { "id": 15, "tasks": ["13.5", "15"] },
    { "id": 16, "tasks": ["13.6", "16.1"] },
    { "id": 17, "tasks": ["16.2", "16.3"] },
    { "id": 18, "tasks": ["17.1"] },
    { "id": 19, "tasks": ["17.2"] },
    { "id": 20, "tasks": ["17.3", "17.4"] }
  ]
}
```
