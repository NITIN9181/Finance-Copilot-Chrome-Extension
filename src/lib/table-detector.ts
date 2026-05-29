/**
 * Financial Table Detection
 * 
 * Detects and classifies financial tables in the DOM
 */

/**
 * Detect financial tables on the page
 */
export function detectFinancialTables(): HTMLTableElement[] {
  const allTables = document.querySelectorAll('table')
  const financialTables: HTMLTableElement[] = []
  
  allTables.forEach(table => {
    if (isFinancialTable(table as HTMLTableElement)) {
      financialTables.push(table as HTMLTableElement)
    }
  })
  
  return financialTables
}

/**
 * Check if a table contains financial data
 */
export function isFinancialTable(table: HTMLTableElement): boolean {
  // Check for explicit marker (demo site)
  if (table.dataset.financialTable === 'true') {
    return true
  }
  
  // TODO: Implement heuristic detection
  // - Check for currency patterns
  // - Check for label columns
  // - Check page context
  
  return false
}

/**
 * Select primary table when multiple are detected
 */
export function selectPrimaryTable(tables: HTMLTableElement[]): HTMLTableElement | null {
  if (tables.length === 0) return null
  if (tables.length === 1) return tables[0]
  
  // TODO: Rank by currency cell count
  // For now, return first table
  return tables[0]
}
