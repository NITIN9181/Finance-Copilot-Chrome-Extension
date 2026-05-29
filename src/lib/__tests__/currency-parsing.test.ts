/**
 * Property-Based Tests: Currency Parsing Correctness
 *
 * **Validates: Requirements 3.3**
 *
 * Property 3: Currency Parsing Correctness
 * - Positive currency strings parse to positive numbers
 * - Parenthesized values parse to negative numbers
 * - Minus-prefixed values parse to negative numbers
 * - Results are rounded to at most 2 decimal places
 * - Unparseable strings return null
 * - Sign idempotence: double-negation holds
 */

import { parseCurrencyValue } from '../data-extractor'

// ---------------------------------------------------------------------------
// Helpers: value generators
// ---------------------------------------------------------------------------

/**
 * Build a formatted currency string like "$1,234.56" from raw parts.
 */
function buildCurrencyString(
  dollars: number,
  cents: number,
  includeDollarSign: boolean,
  includeDecimals: boolean
): string {
  const intPart = dollars.toLocaleString('en-US') // adds commas
  const decPart = cents.toString().padStart(2, '0')
  const base = includeDollarSign ? `$${intPart}` : intPart
  return includeDecimals ? `${base}.${decPart}` : base
}

/**
 * Generate a list of positive currency strings covering various formats.
 * Returns [inputString, expectedNumericValue] pairs.
 */
function generatePositiveCurrencyPairs(): Array<[string, number]> {
  const pairs: Array<[string, number]> = []

  // Whole-dollar amounts with $ sign
  const wholeDollarAmounts = [1, 99, 100, 999, 1000, 9999, 10000, 99999, 100000, 850000, 1210000]
  for (const amount of wholeDollarAmounts) {
    const formatted = `$${amount.toLocaleString('en-US')}`
    pairs.push([formatted, amount])
  }

  // Amounts with cents and $ sign
  const centsAmounts: Array<[number, number]> = [
    [1234, 56],
    [850000, 0],
    [0, 99],
    [9999, 99],
    [1, 1],
    [100, 50],
  ]
  for (const [dollars, cents] of centsAmounts) {
    const formatted = buildCurrencyString(dollars, cents, true, true)
    const expected = Math.round((dollars + cents / 100) * 100) / 100
    pairs.push([formatted, expected])
  }

  // Amounts without $ sign (comma-only format)
  const noSignAmounts = [1234, 56789, 1000000, 425000, 605000]
  for (const amount of noSignAmounts) {
    const formatted = amount.toLocaleString('en-US')
    pairs.push([formatted, amount])
  }

  // Simple decimal values
  pairs.push(['0.99', 0.99])
  pairs.push(['1.00', 1.0])
  pairs.push(['$0.99', 0.99])
  pairs.push(['$1,234.56', 1234.56])
  pairs.push(['1,234,567', 1234567])

  return pairs
}

/**
 * Generate parenthesized negative currency strings.
 * Returns [inputString, expectedNumericValue] pairs.
 */
function generateParenthesizedPairs(): Array<[string, number]> {
  return [
    ['($1,234.56)', -1234.56],
    ['(850,000)', -850000],
    ['(0.99)', -0.99],
    ['($0.99)', -0.99],
    ['(1,234,567)', -1234567],
    ['($100)', -100],
    ['(9,999.99)', -9999.99],
    ['($9,999.99)', -9999.99],
    ['(1)', -1],
    ['($1)', -1],
  ]
}

/**
 * Generate minus-prefixed negative currency strings.
 * Returns [inputString, expectedNumericValue] pairs.
 */
function generateMinusPrefixedPairs(): Array<[string, number]> {
  return [
    ['-$1,234.56', -1234.56],
    ['-850,000', -850000],
    ['-0.99', -0.99],
    ['-$0.99', -0.99],
    ['-1,234,567', -1234567],
    ['-$100', -100],
    ['-9,999.99', -9999.99],
    ['-$9,999.99', -9999.99],
    ['-1', -1],
    ['-$1', -1],
  ]
}

// ---------------------------------------------------------------------------
// Property 3a: Positive currency strings parse to positive numbers
// ---------------------------------------------------------------------------

describe('Property 3: Currency Parsing Correctness (Validates: Requirements 3.3)', () => {
  describe('Property 3a: positive currency strings parse to positive numbers', () => {
    const positivePairs = generatePositiveCurrencyPairs()

    it('should return a positive number for all positive currency formats', () => {
      for (const [input, expected] of positivePairs) {
        const result = parseCurrencyValue(input)
        expect(result).not.toBeNull()
        expect(typeof result).toBe('number')
        expect(isNaN(result as number)).toBe(false)
        expect(result).toBeGreaterThan(0)
        // Also verify the numeric value is close to expected
        expect(result as number).toBeCloseTo(expected, 2)
      }
    })

    it('should parse $1,234.56 to 1234.56', () => {
      expect(parseCurrencyValue('$1,234.56')).toBe(1234.56)
    })

    it('should parse $850,000 to 850000', () => {
      expect(parseCurrencyValue('$850,000')).toBe(850000)
    })

    it('should parse 1,234,567 to 1234567', () => {
      expect(parseCurrencyValue('1,234,567')).toBe(1234567)
    })

    it('should parse $0.99 to 0.99', () => {
      expect(parseCurrencyValue('$0.99')).toBe(0.99)
    })
  })

  // ---------------------------------------------------------------------------
  // Property 3b: Parenthesized values parse to negative numbers
  // ---------------------------------------------------------------------------

  describe('Property 3b: parenthesized values parse to negative numbers', () => {
    const parenthesizedPairs = generateParenthesizedPairs()

    it('should return a negative number for all parenthesized formats', () => {
      for (const [input, expected] of parenthesizedPairs) {
        const result = parseCurrencyValue(input)
        expect(result).not.toBeNull()
        expect(typeof result).toBe('number')
        expect(isNaN(result as number)).toBe(false)
        expect(result).toBeLessThan(0)
        expect(result as number).toBeCloseTo(expected, 2)
      }
    })

    it('should parse ($1,234.56) to -1234.56', () => {
      expect(parseCurrencyValue('($1,234.56)')).toBe(-1234.56)
    })

    it('should parse (850,000) to -850000', () => {
      expect(parseCurrencyValue('(850,000)')).toBe(-850000)
    })

    it('should parse (0.99) to -0.99', () => {
      expect(parseCurrencyValue('(0.99)')).toBe(-0.99)
    })
  })

  // ---------------------------------------------------------------------------
  // Property 3c: Minus-prefixed values parse to negative numbers
  // ---------------------------------------------------------------------------

  describe('Property 3c: minus-prefixed values parse to negative numbers', () => {
    const minusPairs = generateMinusPrefixedPairs()

    it('should return a negative number for all minus-prefixed formats', () => {
      for (const [input, expected] of minusPairs) {
        const result = parseCurrencyValue(input)
        expect(result).not.toBeNull()
        expect(typeof result).toBe('number')
        expect(isNaN(result as number)).toBe(false)
        expect(result).toBeLessThan(0)
        expect(result as number).toBeCloseTo(expected, 2)
      }
    })

    it('should parse -$1,234.56 to -1234.56', () => {
      expect(parseCurrencyValue('-$1,234.56')).toBe(-1234.56)
    })

    it('should parse -850,000 to -850000', () => {
      expect(parseCurrencyValue('-850,000')).toBe(-850000)
    })

    it('should parse -0.99 to -0.99', () => {
      expect(parseCurrencyValue('-0.99')).toBe(-0.99)
    })
  })

  // ---------------------------------------------------------------------------
  // Property 3d: Result is rounded to at most 2 decimal places
  // ---------------------------------------------------------------------------

  describe('Property 3d: result is rounded to at most 2 decimal places', () => {
    // Collect all parseable inputs from all generators
    const allParseableInputs: string[] = [
      ...generatePositiveCurrencyPairs().map(([s]) => s),
      ...generateParenthesizedPairs().map(([s]) => s),
      ...generateMinusPrefixedPairs().map(([s]) => s),
    ]

    it('should round all parseable results to at most 2 decimal places', () => {
      for (const input of allParseableInputs) {
        const result = parseCurrencyValue(input)
        if (result !== null) {
          const rounded = Math.round(result * 100) / 100
          // The difference between result and its 2-decimal rounded form should be < 0.001
          expect(Math.abs(result - rounded)).toBeLessThan(0.001)
        }
      }
    })

    it('should parse $1,234.56 and result should be within 2 decimal places', () => {
      const result = parseCurrencyValue('$1,234.56')
      expect(result).toBe(1234.56)
      const rounded = Math.round((result as number) * 100) / 100
      expect(Math.abs((result as number) - rounded)).toBeLessThan(0.001)
    })

    it('should round $9,999.99 to exactly 9999.99', () => {
      const result = parseCurrencyValue('$9,999.99')
      expect(result).toBe(9999.99)
    })
  })

  // ---------------------------------------------------------------------------
  // Property 3e: Unparseable strings return null
  // ---------------------------------------------------------------------------

  describe('Property 3e: unparseable strings return null', () => {
    const unparseableInputs = [
      '',
      'N/A',
      '--',
      'n/a',
      'TBD',
      '   ',
      'abc',
      '$',
      '()',
      'NA',
      '—',
      '...',
      'null',
      'undefined',
      'n.a.',
    ]

    it('should return null for all unparseable strings', () => {
      for (const input of unparseableInputs) {
        const result = parseCurrencyValue(input)
        expect(result).toBeNull()
      }
    })

    it('should return null for empty string', () => {
      expect(parseCurrencyValue('')).toBeNull()
    })

    it('should return null for "N/A"', () => {
      expect(parseCurrencyValue('N/A')).toBeNull()
    })

    it('should return null for "--"', () => {
      expect(parseCurrencyValue('--')).toBeNull()
    })

    it('should return null for whitespace-only string', () => {
      expect(parseCurrencyValue('   ')).toBeNull()
    })

    it('should return null for "$" alone', () => {
      expect(parseCurrencyValue('$')).toBeNull()
    })

    it('should return null for "()" alone', () => {
      expect(parseCurrencyValue('()')).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Property 3f: Sign idempotence — double-negation
  // ---------------------------------------------------------------------------

  describe('Property 3f: sign idempotence — double-negation', () => {
    const signPairs: Array<[string, string]> = [
      ['($1,234)', '$1,234'],
      ['($1,234.56)', '$1,234.56'],
      ['(850,000)', '850,000'],
      ['(0.99)', '0.99'],
      ['($0.99)', '$0.99'],
      ['(1,234,567)', '1,234,567'],
      ['($100)', '$100'],
    ]

    it('should satisfy parseCurrencyValue("(X)") === -parseCurrencyValue("X") for all pairs', () => {
      for (const [negInput, posInput] of signPairs) {
        const negResult = parseCurrencyValue(negInput)
        const posResult = parseCurrencyValue(posInput)

        // Both should be parseable
        expect(negResult).not.toBeNull()
        expect(posResult).not.toBeNull()

        // The negated form should equal the negative of the positive form
        expect(negResult as number).toBeCloseTo(-(posResult as number), 10)
      }
    })

    it('should satisfy parseCurrencyValue("($1,234)") === -parseCurrencyValue("$1,234")', () => {
      const neg = parseCurrencyValue('($1,234)')
      const pos = parseCurrencyValue('$1,234')
      expect(neg).not.toBeNull()
      expect(pos).not.toBeNull()
      expect(neg).toBe(-(pos as number))
    })

    it('should satisfy parseCurrencyValue("(850,000)") === -parseCurrencyValue("850,000")', () => {
      const neg = parseCurrencyValue('(850,000)')
      const pos = parseCurrencyValue('850,000')
      expect(neg).not.toBeNull()
      expect(pos).not.toBeNull()
      expect(neg).toBe(-(pos as number))
    })
  })
})
