/**
 * Financial Data Extraction
 * 
 * Extracts and serializes table data to JSON
 */

import type { FinancialDataset } from "../types/financial-dataset"

/**
 * Extract financial dataset from HTML table
 */
export function extractFinancialDataset(table: HTMLTableElement): FinancialDataset | null {
  // TODO: Implement extraction logic
  // - Parse headers
  // - Parse rows
  // - Parse currency values
  // - Build dataset structure
  
  return null
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number | null {
  // Remove $, commas
  // Handle parentheses as negative
  // Handle minus sign
  
  const cleaned = value.replace(/[$,]/g, '').trim()
  
  // Handle parentheses (negative)
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    const num = parseFloat(cleaned.slice(1, -1))
    return isNaN(num) ? null : -num
  }
  
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}
