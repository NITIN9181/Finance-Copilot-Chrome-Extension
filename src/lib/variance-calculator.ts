/**
 * Variance Calculator
 * 
 * Computes period-over-period changes and identifies top movers
 */

import type { VarianceResult } from "../types/variance"

/**
 * Compute period-over-period variances
 */
export function computeVariances(dataset: any): VarianceResult[] {
  // TODO: Implement variance calculation
  // - For each account
  // - Compare most recent vs prior period
  // - Calculate percentage change
  // - Classify account type
  // - Assign color
  
  return []
}

/**
 * Identify top 3 movers by absolute change
 */
export function identifyTopMovers(variances: VarianceResult[]): VarianceResult[] {
  // TODO: Sort by absolute percentage change
  // Return top 3
  
  return []
}

/**
 * Classify account type
 */
export function classifyAccount(label: string): 'revenue' | 'expense' | 'net-income' | 'other' {
  const lower = label.toLowerCase()
  
  if (lower.includes('revenue') || lower.includes('sales')) {
    return 'revenue'
  }
  
  if (lower.includes('net income') || lower.includes('net profit')) {
    return 'net-income'
  }
  
  if (lower.includes('expense') || lower.includes('cost') || 
      lower.includes('payroll') || lower.includes('marketing')) {
    return 'expense'
  }
  
  return 'other'
}

/**
 * Determine variance card color
 */
export function getVarianceColor(
  accountType: string,
  change: number
): 'green' | 'red' | 'amber' | 'neutral' {
  if (change === 0) return 'neutral'
  
  if (accountType === 'revenue' || accountType === 'net-income') {
    return change > 0 ? 'green' : 'red'
  }
  
  if (accountType === 'expense') {
    return change > 0 ? 'amber' : 'green'
  }
  
  return 'neutral'
}
