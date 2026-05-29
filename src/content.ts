/**
 * Content Script
 *
 * Runs in webpage context to:
 * - Detect financial tables on page load
 * - Extract and serialize table data
 * - Inject copilot overlay
 */

import type { PlasmoCSConfig } from "plasmo"
import {
  detectFinancialTables,
  selectPrimaryTable,
} from "./lib/table-detector"
import { extractFinancialDataset } from "./lib/data-extractor"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false,
  // run_at: "document_idle" is the Plasmo default — detection happens after
  // the DOM is fully parsed, satisfying the ≤2 s requirement.
}

// Plasmo injects content scripts at document_idle by default.
// Guard against the rare case where the script fires before DOMContentLoaded.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initContentScript)
} else {
  initContentScript()
}

function initContentScript(): void {
  console.log("[Finance Copilot] Content script initialized")

  const startTime = performance.now()

  // Scan DOM for financial tables (requirement 2.1)
  const financialTables = detectFinancialTables()

  const elapsed = performance.now() - startTime
  console.log(`[Finance Copilot] Table scan completed in ${elapsed.toFixed(1)} ms`)

  if (financialTables.length === 0) {
    // Requirement 2.4: leave host page unmodified when no tables found
    console.log("[Finance Copilot] No financial tables detected")
    return
  }

  console.log(`[Finance Copilot] Found ${financialTables.length} financial table(s)`)

  // Requirement 2.6: select primary table (most currency cells; first in DOM for ties)
  const primaryTable = selectPrimaryTable(financialTables)

  if (!primaryTable) return

  console.log("[Finance Copilot] Primary table selected:", primaryTable)

  // Extract structured financial data from the primary table (requirement 3.1, 3.2)
  const dataset = extractFinancialDataset(primaryTable)
  console.log("[Finance Copilot] Extracted financial dataset:", dataset)

  // TODO: Inject overlay (implemented in later tasks)
}
