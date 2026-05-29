# UI Design Rules

## Overlay Panel
- Floating panel: fixed position, right: 20px, bottom: 20px
- Width: 400px on desktop, 100vw - 32px on mobile
- Max height: 80vh with overflow-y: auto
- Dark theme: bg-gray-900 border border-gray-700
- The panel has 3 tabs: "Analysis", "Ask AI", "Migrate"

## Activation Badge
- Small floating button: fixed, bottom-right corner
- Shows: "✦ Finance Copilot" text with a subtle pulse animation
- On the demo site: auto-shows after 1500ms with a bounce-in animation
- On other sites: shows immediately when financial data detected

## Flux Analysis Cards
- Each card: rounded-lg bg-gray-800 p-3 mb-2
- Positive revenue change: text-green-400 with ↑ arrow
- Negative net income: text-red-400 with ↓ arrow  
- Expense increases: text-amber-400 with ↑ arrow (amber not red — contextual)
- Show: row name, % change, dollar change, and a one-line plain English note

## Chat Interface
- Message bubbles: user messages right-aligned bg-blue-600, AI messages left-aligned bg-gray-800
- Input: full width, rounded-full, bg-gray-800 border-gray-600
- Show query counter: "14 / 20 queries used" in small gray text
- Loading state: animated "..." dots while waiting for API response

## Migration Modal
- Full-screen overlay (z-index: 9999)
- Left side (40%): Legacy ERP view — desaturated filter, slightly blurred, labeled "Legacy ERP"
- Right side (60%): DualEntry view — clean dark design, sharp, labeled "DualEntry ✦"
- Animated divider between the two sides
- Close button top-right corner

## Popup
- Width: 320px (standard extension popup)
- Dark theme matching the overlay
- Fields: API key input (password type), enable/disable toggle, demo mode toggle
- Show session query count

## Typography
- Use system font stack for extension UI: -apple-system, BlinkMacSystemFont, sans-serif
- Headings: font-semibold tracking-tight
- Data values: font-mono for numbers
- Never use decorative fonts in the extension (legibility over style)