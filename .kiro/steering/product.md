# Product Overview

Finance Copilot is a Chrome browser extension that enhances legacy ERP dashboards with AI-powered financial analysis capabilities. The extension detects financial data tables on web pages and injects an interactive overlay providing three core features:

1. **Flux Analysis**: Automatic period-over-period variance analysis with visual indicators for top movers
2. **AI Chat**: Natural-language queries about visible financial data powered by NVIDIA NIM API
3. **Migration Simulation**: Side-by-side comparison of legacy vs. modern UI rendering

## Target Use Case

Portfolio/demo project showcasing browser engineering and AI orchestration skills. Designed for recruiters and technical evaluators to assess capabilities without complex setup.

## Key Characteristics

- **Non-invasive**: Injects overlay without disrupting host page functionality or styling
- **Zero-configuration demo**: Includes self-contained demo site simulating QuickBooks-style ERP dashboard for "Meridian Supply Co."
- **Secure**: API calls isolated in background worker with secure key storage
- **Rate-limited**: 20 queries per session to bound demo API usage

## Demo Site

Self-contained single HTML page displaying FY2024 P&L data (Q1-Q4) for Meridian Supply Co. with nine core accounts (Revenue, COGS, Gross Profit, Marketing, Payroll, Software & Tools, Travel & Entertainment, Office & Facilities, Net Income). Extension auto-activates on demo page.

## Deployment

- Extension: Chrome Web Store (or unpacked for development)
- Demo Site: Vercel static hosting
