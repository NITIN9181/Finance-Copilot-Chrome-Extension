/**
 * Property-Based Tests: Table Classification Correctness
 *
 * **Validates: Requirements 2.2**
 *
 * Property 1: Table Classification Correctness
 * - Tables with ≥1 label column AND ≥2 currency columns → isFinancialTable returns true
 * - Tables NOT meeting that criteria → isFinancialTable returns false
 * - Tables with data-financial-table="true" attribute → always returns true
 *
 * Simulates property-based testing by running many iterations with varied
 * random parameters to cover the full input space.
 */

import { isFinancialTable } from '../table-detector'

// ---------------------------------------------------------------------------
// Helper: build an HTMLTableElement in jsdom
// ---------------------------------------------------------------------------

/**
 * Label cell texts used to simulate account names (non-numeric text).
 */
const LABEL_TEXTS = [
  'Revenue',
  'COGS',
  'Gross Profit',
  'Marketing Expenses',
  'Payroll',
  'Software & Tools',
  'Travel & Entertainment',
  'Office & Facilities',
  'Net Income',
  'Operating Expenses',
  'Total Assets',
  'Liabilities',
]

/**
 * Currency cell texts that match the CURRENCY_PATTERN used by isFinancialTable.
 * Pattern: /^\s*(\$[\d,]+(\.\d+)?|\([\d,]+(\.\d+)?\))\s*$/
 */
const CURRENCY_VALUES = [
  '$850,000',
  '$1,210,000',
  '$425,000',
  '$605,000',
  '$85,000',
  '$152,500',
  '$180,000',
  '$195,000',
  '$25,000',
  '$32,000',
  '$15,000',
  '$28,000',
  '$35,000',
  '$38,000',
  '$101,000',
  '$159,500',
  '(1,234)',
  '(50,000)',
  '$1,234',
  '$9,999',
]

/**
 * Purely numeric cell texts (no currency symbol) — NOT currency columns.
 */
const NUMERIC_VALUES = [
  '1234',
  '850000',
  '-1234',
  '0',
  '99.5',
  '1,234,567',
  '-99.99',
]

/**
 * Builds an HTMLTableElement with the specified column structure.
 *
 * @param labelCols   Number of label columns (non-numeric text cells)
 * @param currencyCols Number of currency columns ($-formatted cells)
 * @param numericCols  Number of plain numeric columns (not currency)
 * @param rows         Number of data rows (tbody rows)
 */
function buildTable(
  labelCols: number,
  currencyCols: number,
  numericCols: number = 0,
  rows: number = 3,
): HTMLTableElement {
  const table = document.createElement('table')

  // Header row
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  const totalCols = labelCols + currencyCols + numericCols
  for (let c = 0; c < totalCols; c++) {
    const th = document.createElement('th')
    th.textContent = c === 0 ? 'Account' : `Period ${c}`
    headerRow.appendChild(th)
  }
  thead.appendChild(headerRow)
  table.appendChild(thead)

  // Data rows
  const tbody = document.createElement('tbody')
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement('tr')

    // Label columns
    for (let c = 0; c < labelCols; c++) {
      const td = document.createElement('td')
      td.textContent = LABEL_TEXTS[(r + c) % LABEL_TEXTS.length]
      tr.appendChild(td)
    }

    // Currency columns
    for (let c = 0; c < currencyCols; c++) {
      const td = document.createElement('td')
      td.textContent = CURRENCY_VALUES[(r + c) % CURRENCY_VALUES.length]
      tr.appendChild(td)
    }

    // Plain numeric columns
    for (let c = 0; c < numericCols; c++) {
      const td = document.createElement('td')
      td.textContent = NUMERIC_VALUES[(r + c) % NUMERIC_VALUES.length]
      tr.appendChild(td)
    }

    tbody.appendChild(tr)
  }
  table.appendChild(tbody)

  return table
}

/**
 * Returns a random integer in [min, max] (inclusive).
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ---------------------------------------------------------------------------
// Property 1: Tables WITH ≥1 label column AND ≥2 currency columns → true
// ---------------------------------------------------------------------------

describe('Property 1: isFinancialTable returns true for qualifying tables', () => {
  /**
   * **Validates: Requirements 2.2**
   *
   * A table qualifies as a financial table when it has ≥1 label column
   * AND ≥2 currency columns. We run 50 iterations with varied parameters
   * to simulate property-based testing.
   */

  it('returns true for minimum valid structure: 1 label + 2 currency columns', () => {
    for (let i = 0; i < 50; i++) {
      const rows = randInt(1, 8)
      const table = buildTable(1, 2, 0, rows)
      expect(isFinancialTable(table)).toBe(true)
    }
  })

  it('returns true for 1 label column + 3 or more currency columns', () => {
    for (let i = 0; i < 50; i++) {
      const currencyCols = randInt(3, 6)
      const rows = randInt(1, 8)
      const table = buildTable(1, currencyCols, 0, rows)
      expect(isFinancialTable(table)).toBe(true)
    }
  })

  it('returns true for 2+ label columns + 2+ currency columns', () => {
    for (let i = 0; i < 50; i++) {
      const labelCols = randInt(2, 4)
      const currencyCols = randInt(2, 5)
      const rows = randInt(1, 8)
      const table = buildTable(labelCols, currencyCols, 0, rows)
      expect(isFinancialTable(table)).toBe(true)
    }
  })

  it('returns true when extra plain-numeric columns are present alongside ≥1 label + ≥2 currency', () => {
    for (let i = 0; i < 30; i++) {
      const labelCols = randInt(1, 3)
      const currencyCols = randInt(2, 4)
      const numericCols = randInt(1, 3)
      const rows = randInt(1, 6)
      const table = buildTable(labelCols, currencyCols, numericCols, rows)
      expect(isFinancialTable(table)).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// Property 2: Tables WITHOUT the required structure → false
// ---------------------------------------------------------------------------

describe('Property 2: isFinancialTable returns false for non-qualifying tables', () => {
  /**
   * **Validates: Requirements 2.2**
   *
   * Tables that do NOT have ≥1 label column AND ≥2 currency columns must
   * return false. We test each failure mode across many iterations.
   */

  it('returns false for tables with 0 label columns (all currency)', () => {
    for (let i = 0; i < 50; i++) {
      const currencyCols = randInt(2, 6)
      const rows = randInt(1, 8)
      const table = buildTable(0, currencyCols, 0, rows)
      expect(isFinancialTable(table)).toBe(false)
    }
  })

  it('returns false for tables with only 1 currency column', () => {
    for (let i = 0; i < 50; i++) {
      const labelCols = randInt(1, 4)
      const rows = randInt(1, 8)
      const table = buildTable(labelCols, 1, 0, rows)
      expect(isFinancialTable(table)).toBe(false)
    }
  })

  it('returns false for tables with 0 currency columns (label + numeric only)', () => {
    for (let i = 0; i < 50; i++) {
      const labelCols = randInt(1, 3)
      const numericCols = randInt(1, 4)
      const rows = randInt(1, 8)
      const table = buildTable(labelCols, 0, numericCols, rows)
      expect(isFinancialTable(table)).toBe(false)
    }
  })

  it('returns false for empty tables (no rows)', () => {
    for (let i = 0; i < 20; i++) {
      const table = buildTable(1, 2, 0, 0)
      expect(isFinancialTable(table)).toBe(false)
    }
  })

  it('returns false for a completely empty table element', () => {
    const table = document.createElement('table')
    expect(isFinancialTable(table)).toBe(false)
  })

  it('returns false for tables with only header rows (no td cells)', () => {
    // buildTable with 0 rows produces only a thead — no td cells for column analysis
    const table = buildTable(2, 3, 0, 0)
    expect(isFinancialTable(table)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Property 3: data-financial-table="true" always returns true
// ---------------------------------------------------------------------------

describe('Property 3: data-financial-table="true" attribute always returns true', () => {
  /**
   * **Validates: Requirements 2.2 (detection priority 1)**
   *
   * When a table carries the explicit data-financial-table="true" attribute,
   * isFinancialTable must return true regardless of column content.
   */

  it('returns true for an empty table with the attribute', () => {
    const table = document.createElement('table')
    table.dataset.financialTable = 'true'
    expect(isFinancialTable(table)).toBe(true)
  })

  it('returns true for a table with only numeric columns when attribute is set', () => {
    for (let i = 0; i < 30; i++) {
      const numericCols = randInt(1, 5)
      const rows = randInt(1, 6)
      const table = buildTable(0, 0, numericCols, rows)
      table.dataset.financialTable = 'true'
      expect(isFinancialTable(table)).toBe(true)
    }
  })

  it('returns true for a table with 0 currency columns when attribute is set', () => {
    for (let i = 0; i < 30; i++) {
      const labelCols = randInt(1, 3)
      const rows = randInt(1, 6)
      const table = buildTable(labelCols, 0, 0, rows)
      table.dataset.financialTable = 'true'
      expect(isFinancialTable(table)).toBe(true)
    }
  })

  it('returns true for a table with only 1 currency column when attribute is set', () => {
    for (let i = 0; i < 30; i++) {
      const labelCols = randInt(1, 3)
      const rows = randInt(1, 6)
      const table = buildTable(labelCols, 1, 0, rows)
      table.dataset.financialTable = 'true'
      expect(isFinancialTable(table)).toBe(true)
    }
  })

  it('does NOT return true for attribute value other than "true"', () => {
    // Only the exact string "true" triggers the shortcut
    const table = buildTable(0, 0, 2, 3)
    table.dataset.financialTable = 'false'
    // No label cols, no currency cols → should be false
    expect(isFinancialTable(table)).toBe(false)
  })
})
