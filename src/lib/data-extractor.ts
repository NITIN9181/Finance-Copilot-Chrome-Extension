/**
 * Financial Data Extraction
 *
 * Extracts and serializes table data to JSON.
 */

import type { FinancialDataset } from "../types/financial-dataset"

/**
 * Attempt to detect the company name from the page.
 *
 * Strategy (in priority order):
 * 1. First <h1> element text content
 * 2. <title> tag text content (stripped of common suffixes like " - Dashboard")
 *
 * Returns undefined when nothing useful is found.
 */
function detectCompanyName(): string | undefined {
  // Try <h1> first
  const h1 = document.querySelector("h1")
  if (h1) {
    const text = h1.textContent?.trim()
    if (text) return text
  }

  // Fall back to <title>
  const titleText = document.title?.trim()
  if (titleText) return titleText

  return undefined
}

/**
 * Extract financial dataset from an HTML table element.
 *
 * Algorithm:
 * 1. Find the header row: first <thead><tr> if present, otherwise the first <tr>.
 * 2. Extract period identifiers from header cells (skip cell 0 — the label column header).
 * 3. If no periods found, return a FinancialDataset with an empty accounts map.
 * 4. For each data row (<tbody><tr> rows, or all rows after the header when no <tbody>):
 *    a. Extract account label from cell 0 (textContent.trim()).
 *    b. Skip rows where the label is empty.
 *    c. For each period column, call parseCurrencyValue() on the cell text.
 *    d. Build the accounts map entry: { [periodId]: number | null }.
 * 5. Build metadata: sourceUrl, extractedAt, companyName (optional).
 * 6. Return the complete FinancialDataset.
 *
 * Returns null only when the table element itself is invalid (no rows at all).
 */
export function extractFinancialDataset(table: HTMLTableElement): FinancialDataset | null {
  // ── 1. Locate the header row ──────────────────────────────────────────────
  let headerRow: HTMLTableRowElement | null = null
  let dataRows: HTMLTableRowElement[] = []

  const thead = table.tHead
  if (thead && thead.rows.length > 0) {
    headerRow = thead.rows[0]
    // Data rows come from all <tbody> sections
    const tbodies = Array.from(table.tBodies)
    for (const tbody of tbodies) {
      dataRows.push(...Array.from(tbody.rows))
    }
  } else {
    // No <thead>: treat the first <tr> anywhere in the table as the header
    const allRows = Array.from(table.rows)
    if (allRows.length === 0) {
      // Completely empty table — return null (invalid input)
      return null
    }
    headerRow = allRows[0]
    dataRows = allRows.slice(1)
  }

  // ── 2. Extract period identifiers from header cells (skip cell 0) ─────────
  const periods: string[] = []
  const headerCells = Array.from(headerRow.cells)
  for (let i = 1; i < headerCells.length; i++) {
    const text = headerCells[i].textContent?.trim() ?? ""
    if (text !== "") {
      periods.push(text)
    }
  }

  // ── 3. Build metadata ─────────────────────────────────────────────────────
  const metadata: FinancialDataset["metadata"] = {
    sourceUrl: window.location.href,
    extractedAt: new Date().toISOString(),
    companyName: detectCompanyName(),
  }

  // ── 4. If no periods, return empty dataset ────────────────────────────────
  if (periods.length === 0) {
    return { metadata, periods: [], accounts: {} }
  }

  // ── 5. Extract data rows ──────────────────────────────────────────────────
  const accounts: FinancialDataset["accounts"] = {}

  for (const row of dataRows) {
    const cells = Array.from(row.cells)
    if (cells.length === 0) continue

    // Account label from first cell
    const label = cells[0].textContent?.trim() ?? ""
    if (label === "") continue

    // Build period → value map for this account
    const periodValues: { [periodId: string]: number | null } = {}
    for (let i = 0; i < periods.length; i++) {
      const cell = cells[i + 1]
      const cellText = cell?.textContent?.trim() ?? ""
      periodValues[periods[i]] = parseCurrencyValue(cellText)
    }

    accounts[label] = periodValues
  }

  return { metadata, periods, accounts }
}

/**
 * Parse a currency-formatted string into a number.
 *
 * Rules:
 * 1. Trim whitespace first.
 * 2. Return null for empty string.
 * 3. Parenthesized values are negative: ($1,234.56) or (1,234) → negative.
 * 4. Minus-prefixed values are negative: -$1,234.56 or -1,234 → negative.
 * 5. Strip $ symbol and all commas.
 * 6. Parse the remaining string as a float.
 * 7. Round to 2 decimal places.
 * 8. Return null if the result is NaN after parsing.
 *
 * Examples:
 *   "$1,234.56"    → 1234.56
 *   "($1,234.56)"  → -1234.56
 *   "-$1,234.56"   → -1234.56
 *   "1,234,567"    → 1234567
 *   ""             → null
 *   "N/A"          → null
 */
export function parseCurrencyValue(text: string): number | null {
  // Step 1: Trim whitespace
  const trimmed = text.trim()

  // Step 2: Return null for empty string
  if (trimmed === '') {
    return null
  }

  // Step 3: Detect parenthesized negative values: ($1,234.56) or (1,234)
  let isNegative = false
  let working = trimmed

  if (working.startsWith('(') && working.endsWith(')')) {
    isNegative = true
    working = working.slice(1, -1).trim()
  }

  // Step 4: Detect minus-prefixed negative values: -$1,234.56 or -1,234
  if (working.startsWith('-')) {
    isNegative = true
    working = working.slice(1).trim()
  }

  // Step 5: Strip $ symbol and all commas
  working = working.replace(/[$,]/g, '')

  // Step 6: Parse as float
  const num = parseFloat(working)

  // Step 8: Return null if NaN
  if (isNaN(num)) {
    return null
  }

  // Step 7: Round to 2 decimal places and apply sign
  const rounded = Math.round(num * 100) / 100
  return isNegative ? -rounded : rounded
}

/**
 * @deprecated Use parseCurrencyValue instead.
 * Parse currency string to number (legacy wrapper).
 */
export function parseCurrency(value: string): number | null {
  return parseCurrencyValue(value)
}
