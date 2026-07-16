import type { PracticalVariant } from "@/domain/exam";

const baseRestrictions = [
  "Native JavaScript only (no lodash or similar libraries).",
  "You cannot modify the unit test files (locked).",
  "Prioritize a clear solution: the session time is limited.",
];

export const javascriptBank: PracticalVariant[] = [
  {
    variantId: "js-normalize-movements",
    kind: "javascript",
    title: "Plain JavaScript — Algorithms",
    subtitle: "Bank movement normalizer",
    estimatedMinutes: 40,
    story:
      "Bancolombia needs to normalize raw bank movements. You must transform, filter, and calculate balances without mutating the input.",
    requirements: [
      "Implement `normalizeMovements(movements)` without external libraries.",
      "Convert `amount` to a number and `date` to an ISO string.",
      "Discard movements with a non-numeric amount or an invalid date.",
      "Sort by date ascending and calculate `runningBalance` from 0.",
    ],
    acceptanceCriteria: [
      "Does not mutate the original array or objects.",
      "Edge cases (empty input, invalid values) do not throw unhandled exceptions.",
      "The hidden unit tests pass.",
    ],
    restrictions: baseRestrictions,
    starterFiles: [
      {
        name: "normalizeMovements.js",
        language: "javascript",
        code: `/**
 * @typedef {{ id: string, amount: string|number, date: string }} RawMovement
 * @typedef {{ id: string, amount: number, date: string, runningBalance: number }} Movement
 * @param {RawMovement[]} movements
 * @returns {Movement[]}
 */
export function normalizeMovements(movements) {
  // TODO
  return [];
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports normalizeMovements", patterns: [/function\s+normalizeMovements/] },
      { id: "t2", name: "uses map/filter", patterns: [/\.map\s*\(/, /\.filter\s*\(/] },
      { id: "t3", name: "converts amount and date", patterns: [/Number\s*\(|parseFloat\s*\(/, /toISOString|Date\s*\(/] },
      { id: "t4", name: "sorts by date", patterns: [/\.sort\s*\(/] },
      { id: "t5", name: "calculates runningBalance", patterns: [/runningBalance\s*:\s*balance|runningBalance\s*=|balance\s*\+=/] },
      { id: "t6", name: "no external libraries", patterns: [/./], forbidden: [/require\s*\(|from\s+['"]lodash/] },
    ],
    hints: [
      "Filter with Number.isFinite and a valid Date.",
      "Accumulate the balance over the already sorted array.",
    ],
    solution: `export function normalizeMovements(movements) {
  const cleaned = movements
    .map((m) => ({ id: m.id, amount: Number(m.amount), date: new Date(m.date) }))
    .filter((m) => Number.isFinite(m.amount) && !Number.isNaN(m.date.getTime()))
    .sort((a, b) => a.date - b.date);
  let balance = 0;
  return cleaned.map((m) => {
    balance += m.amount;
    return { id: m.id, amount: m.amount, date: m.date.toISOString(), runningBalance: balance };
  });
}`,
    explanation: "Clean → filter → sort → accumulate.",
  },
  {
    variantId: "js-group-transactions",
    kind: "javascript",
    title: "Plain JavaScript — Algorithms",
    subtitle: "Group transactions by category",
    estimatedMinutes: 40,
    story:
      "The monthly summary must group transactions by category and return totals. The input is immutable.",
    requirements: [
      "Implement `groupByCategory(transactions)`.",
      "Return an array of `{ category, total, count }` sorted by total descending.",
      "Ignore transactions with a non-finite amount.",
      "Do not mutate the input.",
    ],
    acceptanceCriteria: [
      "One category per entry in the result.",
      "Correct totals and stable sorting by total.",
      "Hidden tests pass.",
    ],
    restrictions: baseRestrictions,
    starterFiles: [
      {
        name: "groupByCategory.js",
        language: "javascript",
        code: `/**
 * @typedef {{ id: string, category: string, amount: number }} Tx
 * @typedef {{ category: string, total: number, count: number }} Group
 * @param {Tx[]} transactions
 * @returns {Group[]}
 */
export function groupByCategory(transactions) {
  // TODO
  return [];
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports groupByCategory", patterns: [/function\s+groupByCategory/] },
      { id: "t2", name: "accumulates totals", patterns: [/\.total\s*\+=|total\s*:\s*0|reduce\s*\(/] },
      { id: "t3", name: "includes count", patterns: [/\.count\s*\+=|count\s*:\s*0/] },
      { id: "t4", name: "sorts descending", patterns: [/\.sort\s*\(/] },
      { id: "t5", name: "filters invalid values or validates amount", patterns: [/isFinite|Number\.isFinite|filter/] },
      { id: "t6", name: "no libraries", patterns: [/./], forbidden: [/lodash|underscore/] },
    ],
    hints: ["Use a Map category→accumulator.", "At the end, convert to an array and sort by total."],
    solution: `export function groupByCategory(transactions) {
  const map = new Map();
  for (const tx of transactions) {
    if (!Number.isFinite(tx.amount)) continue;
    const prev = map.get(tx.category) ?? { category: tx.category, total: 0, count: 0 };
    prev.total += tx.amount;
    prev.count += 1;
    map.set(tx.category, prev);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}`,
    explanation: "Map + sort covers efficient grouping without mutating the input.",
  },
  {
    variantId: "js-retry-payment",
    kind: "javascript",
    title: "Plain JavaScript — Algorithms",
    subtitle: "Payment retries with backoff",
    estimatedMinutes: 40,
    story:
      "A payment lookup can fail transiently. You must retry without blocking and without retrying 4xx errors.",
    requirements: [
      "Implement `async function retryPayment(request, { retries = 3 })`.",
      "Retry only if the error has `status >= 500` or has no status.",
      "Do not use setInterval.",
      "If retries are exhausted, rethrow the last error.",
    ],
    acceptanceCriteria: [
      "Success on the first attempt returns the value.",
      "4xx errors are not retried.",
      "Hidden tests pass.",
    ],
    restrictions: baseRestrictions,
    starterFiles: [
      {
        name: "retryPayment.js",
        language: "javascript",
        code: `/**
 * @param {() => Promise<any>} request
 * @param {{ retries?: number }} [options]
 */
export async function retryPayment(request, { retries = 3 } = {}) {
  // TODO
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports async retryPayment", patterns: [/async\s+function\s+retryPayment|function\s+retryPayment/] },
      { id: "t2", name: "uses a loop or retries", patterns: [/for\s*\(|while\s*\(/] },
      { id: "t3", name: "try/catch", patterns: [/try\s*\{/, /catch/] },
      { id: "t4", name: "considers 4xx/5xx status", patterns: [/status|4\d\d|5\d\d/] },
      { id: "t5", name: "no setInterval", patterns: [/./], forbidden: [/setInterval/] },
      { id: "t6", name: "await request", patterns: [/await\s+request/] },
    ],
    hints: ["In catch, if status is between 400–499, throw immediately.", "Decrement retries on each retryable failure."],
    solution: `export async function retryPayment(request, { retries = 3 } = {}) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try { return await request(); }
    catch (e) {
      lastError = e;
      if (e && e.status >= 400 && e.status < 500) throw e;
      if (i === retries) throw e;
    }
  }
  throw lastError;
}`,
    explanation: "Selective retry based on the HTTP status class.",
  },
  {
    variantId: "js-format-currency",
    kind: "javascript",
    title: "Plain JavaScript — Algorithms",
    subtitle: "COP amount formatter",
    estimatedMinutes: 35,
    story:
      "You must format amounts for a balance UI in Colombian pesos, with strict rounding and sign rules.",
    requirements: [
      "Implement `formatCOP(amount)` → a string such as `$ 1.234.567` or `-$ 500`.",
      "Round to the nearest integer.",
      "Use a dot as the thousands separator (CO style).",
      "NaN or non-finite → `—`.",
    ],
    acceptanceCriteria: [
      "0 → `$ 0`.",
      "Negative values use the `-` prefix.",
      "Hidden tests pass.",
    ],
    restrictions: baseRestrictions,
    starterFiles: [
      {
        name: "formatCOP.js",
        language: "javascript",
        code: `/** @param {number} amount @returns {string} */
export function formatCOP(amount) {
  // TODO
  return "";
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports formatCOP", patterns: [/function\s+formatCOP/] },
      { id: "t2", name: "validates finite / NaN", patterns: [/isFinite|Number\.isFinite|Number\.isNaN/] },
      { id: "t3", name: "uses Math.round or similar", patterns: [/Math\.round|toFixed/] },
      { id: "t4", name: "thousands separator", patterns: [/replace|Intl|toLocaleString|\./] },
      { id: "t5", name: "$ prefix", patterns: [/\$/] },
      { id: "t6", name: "no libraries", patterns: [/./], forbidden: [/lodash|numeral|accounting/] },
    ],
    hints: ["Math.round + String + replace with a thousands regex.", "Intl.NumberFormat('es-CO') is also valid."],
    solution: `export function formatCOP(amount) {
  if (!Number.isFinite(amount)) return "—";
  const n = Math.round(amount);
  const sign = n < 0 ? "-" : "";
  const body = Math.abs(n).toLocaleString("es-CO");
  return sign + "$ " + body;
}`,
    explanation: "Validation + rounding + CO locale.",
  },
  {
    variantId: "js-unique-sorted-ids",
    kind: "javascript",
    title: "Plain JavaScript — Algorithms",
    subtitle: "Unique sorted transfer IDs",
    estimatedMinutes: 30,
    story:
      "A transfer batch arrives with duplicate and unordered IDs. You must return unique IDs in ascending order without mutating the input.",
    requirements: [
      "Implement `uniqueSortedIds(ids: string[]): string[]`.",
      "Remove duplicates and sort lexicographically.",
      "Ignore empty values or non-string values.",
      "Do not mutate the original array.",
    ],
    acceptanceCriteria: [
      "Empty input → [].",
      "No side effects on `ids`.",
      "Hidden tests pass.",
    ],
    restrictions: baseRestrictions,
    starterFiles: [
      {
        name: "uniqueSortedIds.js",
        language: "javascript",
        code: `/** @param {unknown[]} ids @returns {string[]} */
export function uniqueSortedIds(ids) {
  // TODO
  return [];
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports uniqueSortedIds", patterns: [/function\s+uniqueSortedIds/] },
      { id: "t2", name: "uses Set or unique filtering", patterns: [/Set|filter/] },
      { id: "t3", name: "sorts", patterns: [/\.sort\s*\(/] },
      { id: "t4", name: "filters valid strings", patterns: [/typeof|filter|trim/] },
      { id: "t5", name: "does not sort the direct input without a copy", patterns: [/\[\.\.\.|Array\.from|\.slice\s*\(|\.map\s*\(|\.filter\s*\(/] },
      { id: "t6", name: "no lodash", patterns: [/./], forbidden: [/from\s+['\"]lodash['\"]|require\s*\(\s*['\"]lodash|[_]\.(uniq|uniqBy)\b/] },
    ],
    hints: ["Filter with typeof === 'string' && trim.", "[...new Set(clean)].sort()"],
    solution: `export function uniqueSortedIds(ids) {
  const clean = ids.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim());
  return [...new Set(clean)].sort();
}`,
    explanation: "Filter → Set → sort on a copy.",
  },
];
