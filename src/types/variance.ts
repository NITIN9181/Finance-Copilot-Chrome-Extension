/**
 * Variance Result Types
 * 
 * Types for flux analysis calculations
 */

export interface VarianceResult {
  accountLabel: string
  currentPeriod: string
  priorPeriod: string
  currentValue: number | null
  priorValue: number | null
  percentageChange: number | null // null if N/A
  absoluteChange: number | null
  isTopMover: boolean
  accountType: 'revenue' | 'expense' | 'net-income' | 'other'
  color: 'green' | 'red' | 'amber' | 'neutral'
}
