/**
 * Financial Dataset Types
 * 
 * Core data models for extracted financial information
 */

export interface FinancialDataset {
  metadata: {
    sourceUrl: string
    extractedAt: string // ISO 8601 timestamp
    tableName?: string
    companyName?: string
  }
  
  periods: string[]
  
  accounts: {
    [accountLabel: string]: {
      [periodId: string]: number | null
    }
  }
}

export interface ExtractedFinancialData {
  pageTitle: string
  detectedPlatform: string
  tables: Array<{
    headers: string[]
    rows: Array<{
      label: string
      values: number[]
    }>
  }>
}
