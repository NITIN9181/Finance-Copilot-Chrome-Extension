/**
 * Financial Table Detection
 *
 * Detects and classifies financial tables in the DOM.
 *
 * Detection priority:
 * 1. data-financial-table="true" attribute (demo site)
 * 2. Column structure heuristic: ≥1 label column + ≥2 currency columns
 *
 * Ranking: tables are ranked by currency cell count; ties broken by DOM order.
 */

/** Pattern matching currency-formatted values: $1,234 or (1,234) */
const CURRENCY_PATTERN = /^\s*(\$[\d,]+(\.\d+)?|\([\d,]+(\.\d+)?\))\s*$/

/** Pattern matching purely numeric text (integers, decimals, negatives) */
const NUMERIC_PATTERN = /^\s*-?[\d,]+(\.\d+)?\s*$/

/**
 * Returns the data cells (td elements) for a given column index across all
 * body rows of a table. Skips header rows (th-only rows).
 */
function getColumnCells(table: HTMLTableElement, colIndex: number): HTMLTableCellElement[] {
  const cells: HTMLTableCellElement[] = []
  const rows = Array.from(table.rows)

  for (const row of rows) {
    const cell = row.cells[colIndex]
    // Skip header cells
    if (!cell || cell.tagName === 'TH') continue
    cells.push(cell as HTMLTableCellElement)
  }

  return cells
}

/**
 * Returns the number of columns in the table (based on the widest row).
 */
function getColumnCount(table: HTMLTableElement): number {
  let max = 0
  for (const row of Array.from(table.rows)) {
    if (row.cells.length > max) max = row.cells.length
  }
  return max
}

/**
 * Determines whether a column is a "label column":
 * all data cells contain non-numeric text (i.e. account names).
 */
function isLabelColumn(cells: HTMLTableCellElement[]): boolean {
  if (cells.length === 0) return false
  return cells.every(cell => {
    const text = cell.textContent?.trim() ?? ''
    if (text === '') return false
    return !NUMERIC_PATTERN.test(text) && !CURRENCY_PATTERN.test(text)
  })
}

/**
 * Determines whether a column is a "currency column":
 * all data cells match a currency pattern ($1,234 or (1,234)).
 */
function isCurrencyColumn(cells: HTMLTableCellElement[]): boolean {
  if (cells.length === 0) return false
  return cells.every(cell => {
    const text = cell.textContent?.trim() ?? ''
    if (text === '') return false
    return CURRENCY_PATTERN.test(text)
  })
}

/**
 * Count the total number of currency-formatted cells in a table.
 * Used for ranking tables when multiple financial tables are detected.
 */
export function countCurrencyCells(table: HTMLTableElement): number {
  let count = 0
  for (const row of Array.from(table.rows)) {
    for (const cell of Array.from(row.cells)) {
      if (cell.tagName === 'TH') continue
      const text = cell.textContent?.trim() ?? ''
      if (CURRENCY_PATTERN.test(text)) count++
    }
  }
  return count
}

/**
 * Classify a table as a financial table.
 *
 * Priority 1: explicit data-financial-table="true" attribute.
 * Priority 2: heuristic — ≥1 label column AND ≥2 currency columns.
 */
export function isFinancialTable(table: HTMLTableElement): boolean {
  // Priority 1: explicit marker (demo site)
  if (table.dataset.financialTable === 'true') {
    return true
  }

  const colCount = getColumnCount(table)
  if (colCount === 0) return false

  let labelColumns = 0
  let currencyColumns = 0

  for (let i = 0; i < colCount; i++) {
    const cells = getColumnCells(table, i)
    if (cells.length === 0) continue

    if (isLabelColumn(cells)) {
      labelColumns++
    } else if (isCurrencyColumn(cells)) {
      currencyColumns++
    }
  }

  return labelColumns >= 1 && currencyColumns >= 2
}

/**
 * Scan the DOM for all financial tables on the page.
 * Returns them in document order.
 */
export function detectFinancialTables(): HTMLTableElement[] {
  const allTables = Array.from(document.querySelectorAll<HTMLTableElement>('table'))
  return allTables.filter(table => isFinancialTable(table))
}

/**
 * Select the primary (best) financial table from a list.
 *
 * Ranking: most currency cells wins.
 * Ties: first in DOM order (i.e. the order of the input array, which mirrors
 * document order from detectFinancialTables).
 *
 * Returns null when the list is empty.
 */
export function selectPrimaryTable(tables: HTMLTableElement[]): HTMLTableElement | null {
  if (tables.length === 0) return null
  if (tables.length === 1) return tables[0]

  let best = tables[0]
  let bestCount = countCurrencyCells(best)

  for (let i = 1; i < tables.length; i++) {
    const count = countCurrencyCells(tables[i])
    // Strictly greater — ties keep the earlier (first in DOM) table
    if (count > bestCount) {
      best = tables[i]
      bestCount = count
    }
  }

  return best
}
