# Tech Stack Rules

## Extension Framework
- Always use Plasmo framework for the Chrome extension (not raw Manifest V3)
- Plasmo entry points: contents/ for content scripts, popup/ for popup, background/ for service worker
- Use Plasmo's built-in CSS injection — do NOT manually inject style tags
- TypeScript strict mode everywhere

## Styling
- Tailwind CSS for all component styling
- The overlay UI must use a DARK theme (bg-gray-900, text-white) — it needs to contrast against legacy ERP pages which are typically light/white
- No inline styles except for dynamic values (e.g. computed widths)
- Use Tailwind's `shadow-2xl` and `rounded-2xl` for the floating panel

## AI API
- ALWAYS use NVIDIA NIM endpoint: https://integrate.api.nvidia.com/v1/chat/completions
- ALWAYS use model: meta/llama-3.1-70b-instruct
- API calls MUST go through background/index.ts service worker only — never call the API directly from content scripts (CORS)
- Pass messages via chrome.runtime.sendMessage between content script and background worker
- max_tokens: 300, temperature: 0.3

## Storage
- Use chrome.storage.local for API key persistence
- Key name: "nvidia_api_key"
- Never hardcode API keys — always read from storage

## Demo Site
- demo-site/index.html must be a SINGLE self-contained file
- Use Tailwind CDN (https://cdn.tailwindcss.com) — no npm in demo site
- Embed all JS in <script> tags — no external JS files needed
- The demo site MUST have data-financial-table="true" attribute on the main table so the extension can detect it reliably