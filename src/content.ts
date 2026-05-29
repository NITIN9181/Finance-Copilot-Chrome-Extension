/**
 * Content Script
 * 
 * Runs in webpage context to:
 * - Detect financial tables on page load
 * - Extract and serialize table data
 * - Inject copilot overlay
 */

import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

// Wait for page to fully load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript)
} else {
  initContentScript()
}

function initContentScript() {
  console.log('[Finance Copilot] Content script initialized')
  
  // Scan for financial tables
  const tables = scanForFinancialTables()
  
  if (tables.length > 0) {
    console.log(`[Finance Copilot] Found ${tables.length} financial table(s)`)
    // TODO: Extract data and inject overlay
    // This will be implemented in later tasks
  } else {
    console.log('[Finance Copilot] No financial tables detected')
  }
}

/**
 * Scan DOM for financial tables
 */
function scanForFinancialTables(): HTMLTableElement[] {
  const allTables = document.querySelectorAll('table')
  const financialTables: HTMLTableElement[] = []
  
  allTables.forEach(table => {
    if (isFinancialTable(table)) {
      financialTables.push(table)
    }
  })
  
  return financialTables
}

/**
 * Check if table contains financial data
 */
function isFinancialTable(table: HTMLTableElement): boolean {
  // Check for explicit marker (demo site)
  if (table.dataset.financialTable === 'true') {
    return true
  }
  
  // TODO: Implement heuristic detection
  // This will be implemented in a later task
  
  return false
}
