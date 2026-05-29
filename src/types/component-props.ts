/**
 * Component Prop Types
 *
 * TypeScript prop interfaces for all React components in the extension.
 */

import type { FinancialDataset } from './financial-dataset'
import type { VarianceResult } from './variance'
import type { ChatMessage } from './chat'

// ---------------------------------------------------------------------------
// CopilotOverlay
// ---------------------------------------------------------------------------

export interface CopilotOverlayProps {
  /** The financial dataset extracted from the host page table */
  dataset: FinancialDataset | null
  /** Called when the user closes the overlay */
  onClose?: () => void
}

// ---------------------------------------------------------------------------
// FluxAnalysis
// ---------------------------------------------------------------------------

export interface FluxAnalysisProps {
  /** The financial dataset to analyse */
  dataset: FinancialDataset
  /** Pre-computed variance results (optional — component can compute internally) */
  variances?: VarianceResult[]
}

// ---------------------------------------------------------------------------
// ChatInterface
// ---------------------------------------------------------------------------

export interface ChatInterfaceProps {
  /** The financial dataset to include in the AI system prompt */
  dataset: FinancialDataset | null
  /** Initial chat history (e.g. restored from session) */
  initialMessages?: ChatMessage[]
  /** Maximum number of queries allowed per session */
  queryQuota?: number
}

// ---------------------------------------------------------------------------
// MigrationModal
// ---------------------------------------------------------------------------

export interface MigrationModalProps {
  /** The financial dataset to render in both legacy and modern views */
  dataset: FinancialDataset | null
  /** Whether the modal is currently open */
  isOpen: boolean
  /** Called when the user requests to close the modal */
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Popup (IndexPopup)
// ---------------------------------------------------------------------------

export interface PopupProps {
  // The popup is a Plasmo entry point and receives no external props,
  // but the interface is defined here for completeness and future use.
}

// ---------------------------------------------------------------------------
// ActivationBadge
// ---------------------------------------------------------------------------

export interface ActivationBadgeProps {
  /** Whether the badge should auto-show with a bounce-in animation (demo site) */
  autoShow?: boolean
  /** Delay in milliseconds before auto-showing (default: 1500) */
  autoShowDelay?: number
  /** Called when the user clicks the badge to activate the overlay */
  onActivate: () => void
}
