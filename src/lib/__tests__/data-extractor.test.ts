/**
 * Property-Based Tests: Round-Trip Serialization Preservation
 *
 * **Validates: Requirements 3.4**
 *
 * Property 4: Serialization Round-Trip Preservation
 * For all extracted FinancialDatasets, serializing to JSON and deserializing
 * back SHALL produce a dataset with:
 *   - account labels exactly equal to the original
 *   - period identifiers exactly equal to the original
 *   - null values preserved as null
 *   - numeric values within 0.01 of the original
 *   - metadata fields (sourceUrl, extractedAt, companyName) identical
 */

import type { FinancialDataset } from '../../types/financial-dataset';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Build a FinancialDataset from the given accounts, periods, and a factory
 * that produces the value for each (account, period) cell.
 */
function buildDataset(
  accounts: string[],
  periods: string[],
  valueFactory: () => number | null,
): FinancialDataset {
  const accountsMap: FinancialDataset['accounts'] = {};
  for (const label of accounts) {
    accountsMap[label] = {};
    for (const period of periods) {
      accountsMap[label][period] = valueFactory();
    }
  }
  return {
    metadata: {
      sourceUrl: 'https://example.com/erp',
      extractedAt: new Date().toISOString(),
      companyName: 'Test Corp',
    },
    periods,
    accounts: accountsMap,
  };
}

/** Perform a JSON round-trip on a FinancialDataset. */
function roundTrip(dataset: FinancialDataset): FinancialDataset {
  return JSON.parse(JSON.stringify(dataset)) as FinancialDataset;
}

// ─── Random generators ───────────────────────────────────────────────────────

/** Pseudo-random number in [min, max). */
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Random integer in [min, max]. */
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

/** Pick a random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

/** Generate a random account label (may include spaces, special chars, unicode). */
function randomAccountLabel(): string {
  const samples = [
    'Revenue',
    'Cost of Goods Sold',
    'Gross Profit',
    'Marketing Expenses',
    'Payroll & Benefits',
    'Software & Tools',
    'Travel & Entertainment',
    'Office & Facilities',
    'Net Income',
    'R&D Costs',
    'Depreciation (Assets)',
    'Taxes — Federal',
    'Hébergement',          // accented characters
    '売上高',               // Japanese
    'Umsatz (€)',           // euro symbol
    'Account #42',
    'Line-Item: Misc.',
    'COGS / Direct Costs',
  ];
  return pick(samples);
}

/** Generate a random period identifier. */
function randomPeriod(): string {
  const samples = [
    'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024',
    'Jan 2024', 'Feb 2024', 'Mar 2024',
    'FY2023', 'FY2024',
    '2023-01', '2023-12',
    'Period 1', 'Period 2',
  ];
  return pick(samples);
}

/** Generate a random numeric value (positive, negative, or fractional). */
function randomNumericValue(): number {
  const sign = Math.random() < 0.2 ? -1 : 1;
  const magnitude = rand(0, 2_000_000);
  // Round to 2 decimal places (mirrors parseCurrencyValue behaviour)
  return Math.round(magnitude * 100) / 100 * sign;
}

/** Generate a value that is either a number or null (20 % chance of null). */
function randomValue(): number | null {
  return Math.random() < 0.2 ? null : randomNumericValue();
}

/** Generate a unique array of N strings drawn from a generator function. */
function uniqueStrings(n: number, gen: () => string): string[] {
  const set = new Set<string>();
  let attempts = 0;
  while (set.size < n && attempts < n * 10) {
    set.add(gen());
    attempts++;
  }
  // If we couldn't get enough unique values, append an index suffix
  const arr = Array.from(set);
  while (arr.length < n) {
    arr.push(`${gen()}_${arr.length}`);
  }
  return arr.slice(0, n);
}

// ─── Test suite ──────────────────────────────────────────────────────────────

const ITERATIONS = 30;

describe('Property 4: Serialization Round-Trip Preservation (Validates: Requirements 3.4)', () => {

  // ── Property 4a: account labels survive JSON round-trip exactly ────────────
  describe('account labels survive JSON round-trip exactly', () => {
    it(`holds for ${ITERATIONS} randomly generated datasets`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const numAccounts = randInt(1, 8);
        const numPeriods  = randInt(1, 5);
        const accounts    = uniqueStrings(numAccounts, randomAccountLabel);
        const periods     = uniqueStrings(numPeriods,  randomPeriod);

        const original  = buildDataset(accounts, periods, randomValue);
        const recovered = roundTrip(original);

        const originalKeys  = Object.keys(original.accounts).sort();
        const recoveredKeys = Object.keys(recovered.accounts).sort();

        expect(recoveredKeys).toEqual(originalKeys);
      }
    });
  });

  // ── Property 4b: period identifiers survive JSON round-trip exactly ────────
  describe('period identifiers survive JSON round-trip exactly', () => {
    it(`holds for ${ITERATIONS} randomly generated datasets`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const numAccounts = randInt(1, 8);
        const numPeriods  = randInt(1, 5);
        const accounts    = uniqueStrings(numAccounts, randomAccountLabel);
        const periods     = uniqueStrings(numPeriods,  randomPeriod);

        const original  = buildDataset(accounts, periods, randomValue);
        const recovered = roundTrip(original);

        expect(recovered.periods).toEqual(original.periods);
      }
    });
  });

  // ── Property 4c: null values are preserved as null after round-trip ────────
  describe('null values are preserved as null after round-trip', () => {
    it(`holds for ${ITERATIONS} randomly generated datasets`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const numAccounts = randInt(1, 8);
        const numPeriods  = randInt(1, 5);
        const accounts    = uniqueStrings(numAccounts, randomAccountLabel);
        const periods     = uniqueStrings(numPeriods,  randomPeriod);

        // Force at least some nulls by mixing null and numeric factories
        const original  = buildDataset(accounts, periods, randomValue);
        const recovered = roundTrip(original);

        for (const label of accounts) {
          for (const period of periods) {
            const origVal = original.accounts[label][period];
            const recVal  = recovered.accounts[label][period];
            if (origVal === null) {
              expect(recVal).toBeNull();
            }
          }
        }
      }
    });

    it('preserves null when all values are null', () => {
      const accounts = ['Revenue', 'COGS'];
      const periods  = ['Q1 2024', 'Q2 2024'];
      const original = buildDataset(accounts, periods, () => null);
      const recovered = roundTrip(original);

      for (const label of accounts) {
        for (const period of periods) {
          expect(recovered.accounts[label][period]).toBeNull();
        }
      }
    });
  });

  // ── Property 4d: numeric values are within 0.01 after round-trip ──────────
  describe('numeric values are within 0.01 after round-trip', () => {
    it(`holds for ${ITERATIONS} randomly generated datasets`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const numAccounts = randInt(1, 8);
        const numPeriods  = randInt(1, 5);
        const accounts    = uniqueStrings(numAccounts, randomAccountLabel);
        const periods     = uniqueStrings(numPeriods,  randomPeriod);

        const original  = buildDataset(accounts, periods, randomValue);
        const recovered = roundTrip(original);

        for (const label of accounts) {
          for (const period of periods) {
            const origVal = original.accounts[label][period];
            const recVal  = recovered.accounts[label][period];
            if (origVal !== null && recVal !== null) {
              expect(Math.abs(origVal - recVal)).toBeLessThan(0.01);
            }
          }
        }
      }
    });

    it('preserves large numeric values within 0.01', () => {
      const accounts = ['Revenue'];
      const periods  = ['Q4 2024'];
      const original = buildDataset(accounts, periods, () => 1_234_567.89);
      const recovered = roundTrip(original);
      const diff = Math.abs(
        (original.accounts['Revenue']['Q4 2024'] as number) -
        (recovered.accounts['Revenue']['Q4 2024'] as number),
      );
      expect(diff).toBeLessThan(0.01);
    });

    it('preserves negative numeric values within 0.01', () => {
      const accounts = ['Net Loss'];
      const periods  = ['Q1 2024'];
      const original = buildDataset(accounts, periods, () => -98_765.43);
      const recovered = roundTrip(original);
      const diff = Math.abs(
        (original.accounts['Net Loss']['Q1 2024'] as number) -
        (recovered.accounts['Net Loss']['Q1 2024'] as number),
      );
      expect(diff).toBeLessThan(0.01);
    });
  });

  // ── Property 4e: metadata fields survive round-trip ───────────────────────
  describe('metadata fields survive round-trip', () => {
    it(`holds for ${ITERATIONS} randomly generated datasets`, () => {
      const metadataSamples: FinancialDataset['metadata'][] = [
        { sourceUrl: 'https://erp.example.com/dashboard', extractedAt: '2024-01-15T10:30:00Z', companyName: 'Meridian Supply Co.' },
        { sourceUrl: 'https://quickbooks.intuit.com/reports', extractedAt: '2024-06-01T08:00:00Z' },
        { sourceUrl: 'https://netsuite.oracle.com/gl', extractedAt: '2023-12-31T23:59:59Z', companyName: 'Acme Corp' },
        { sourceUrl: 'https://xero.com/reports/profit-loss', extractedAt: '2024-03-31T00:00:00Z', companyName: 'Hébergement SA' },
        { sourceUrl: 'https://sage.com/dashboard', extractedAt: '2024-09-30T12:00:00Z', companyName: '株式会社テスト' },
      ];

      for (let i = 0; i < ITERATIONS; i++) {
        const numAccounts = randInt(1, 6);
        const numPeriods  = randInt(1, 4);
        const accounts    = uniqueStrings(numAccounts, randomAccountLabel);
        const periods     = uniqueStrings(numPeriods,  randomPeriod);

        const metadata = metadataSamples[i % metadataSamples.length];
        const original: FinancialDataset = {
          metadata,
          periods,
          accounts: buildDataset(accounts, periods, randomValue).accounts,
        };
        const recovered = roundTrip(original);

        expect(recovered.metadata.sourceUrl).toBe(original.metadata.sourceUrl);
        expect(recovered.metadata.extractedAt).toBe(original.metadata.extractedAt);
        expect(recovered.metadata.companyName).toBe(original.metadata.companyName);
      }
    });

    it('preserves undefined companyName as undefined after round-trip', () => {
      const original: FinancialDataset = {
        metadata: {
          sourceUrl: 'https://example.com',
          extractedAt: '2024-01-01T00:00:00Z',
          // companyName intentionally omitted
        },
        periods: ['Q1'],
        accounts: { Revenue: { Q1: 100 } },
      };
      const recovered = roundTrip(original);
      // JSON.stringify omits undefined fields; JSON.parse produces undefined for missing keys
      expect(recovered.metadata.companyName).toBeUndefined();
    });
  });

  // ── Combined: mixed null and numeric values in same dataset ───────────────
  describe('mixed null and numeric values in same dataset', () => {
    it('preserves both null and numeric values correctly across 30 iterations', () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const accounts = uniqueStrings(randInt(2, 6), randomAccountLabel);
        const periods  = uniqueStrings(randInt(2, 4), randomPeriod);

        // Alternate between null and numeric to guarantee both appear
        let toggle = false;
        const original = buildDataset(accounts, periods, () => {
          toggle = !toggle;
          return toggle ? randomNumericValue() : null;
        });
        const recovered = roundTrip(original);

        for (const label of accounts) {
          for (const period of periods) {
            const origVal = original.accounts[label][period];
            const recVal  = recovered.accounts[label][period];

            if (origVal === null) {
              expect(recVal).toBeNull();
            } else {
              expect(recVal).not.toBeNull();
              expect(Math.abs((origVal as number) - (recVal as number))).toBeLessThan(0.01);
            }
          }
        }
      }
    });
  });
});
