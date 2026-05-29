# DOM Extraction Rules

## Detection Strategy
The content script must detect financial tables using this priority order:
1. Check for attribute: data-financial-table="true" (our demo site)
2. Check for table cells containing currency patterns: /\$[\d,]+/ or /\([\d,]+\)/
3. Check page title for: QuickBooks, NetSuite, Xero, Sage, Workday
4. Check element class/id for: dashboard, ledger, financials, gl-, ap-, ar-, report

## Data Extraction
When extracting table data, follow these rules:
- Parse "$1,234.56" → 1234.56 (strip $ and commas)
- Parse "(1,234)" → -1234 (parentheses = negative)
- Parse "1,234,567" → 1234567
- Skip rows where ALL values are zero
- The first column is always the row label (string, not number)
- The first row is always headers

## Output Interface (TypeScript)
Always use this exact interface for extracted data:
```typescript
interface ExtractedFinancialData {
  pageTitle: string;
  detectedPlatform: string;
  tables: Array<{
    headers: string[];
    rows: Array<{
      label: string;
      values: number[];
    }>;
  }>;
}
```

## Flux Analysis Calculation
- Period-over-period change: ((current - prior) / Math.abs(prior)) * 100
- Only compare adjacent columns (Q1→Q2, Q2→Q3, Q3→Q4)
- Highlight the 3 rows with highest absolute % change in the most recent period
- Never divide by zero — skip rows where prior value is 0