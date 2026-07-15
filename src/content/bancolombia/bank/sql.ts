import type { PracticalVariant } from "@/domain/exam";

const sqlRestrictions = [
  "Standard SQL / ANSI, as portable as possible.",
  "Do not modify the schema unless the prompt asks for it.",
  "The test files (specs) are locked.",
  "Prioritize clear and correct queries over micro-optimizations.",
];

export const sqlBank: PracticalVariant[] = [
  {
    variantId: "sql-account-movements",
    kind: "sql",
    title: "SQL — Queries",
    subtitle: "Account movements in a range",
    estimatedMinutes: 40,
    story:
      "Bancolombia's backend needs to list movements for an account between two dates, ordered from newest to oldest.",
    requirements: [
      "Write the query in `query.sql`.",
      "Select id, amount, description, created_at.",
      "Filter by account_id = :accountId and created_at between :from and :to.",
      "Sort by created_at DESC.",
    ],
    acceptanceCriteria: [
      "Uses WHERE and ORDER BY correctly.",
      "Does not select unnecessary extra columns (`*` may be penalized by tests).",
      "Hidden tests pass.",
    ],
    restrictions: sqlRestrictions,
    starterFiles: [
      {
        name: "schema.sql",
        language: "sql",
        code: `-- Reference (locked in the real platform)
CREATE TABLE movements (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL
);
`,
      },
      {
        name: "query.sql",
        language: "sql",
        code: `-- TODO: list movements for :accountId between :from and :to
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "uses SELECT", patterns: [/select/i] },
      { id: "t2", name: "filters account_id", patterns: [/account_id/i] },
      { id: "t3", name: "date range", patterns: [/created_at/i] },
      { id: "t4", name: "WHERE present", patterns: [/where/i] },
      { id: "t5", name: "ORDER BY DESC", patterns: [/order\s+by[\s\S]*desc/i] },
      { id: "t6", name: "no drop/truncate", patterns: [/./], forbidden: [/drop\s+table|truncate/i] },
    ],
    hints: [
      "WHERE account_id = :accountId AND created_at BETWEEN :from AND :to",
      "ORDER BY created_at DESC",
    ],
    solution: `SELECT id, amount, description, created_at
FROM movements
WHERE account_id = :accountId
  AND created_at BETWEEN :from AND :to
ORDER BY created_at DESC;`,
    explanation: "Filter by account + time range + descending order.",
  },
  {
    variantId: "sql-spend-by-category",
    kind: "sql",
    title: "SQL — Queries",
    subtitle: "Spending grouped by category",
    estimatedMinutes: 40,
    story:
      "The monthly summary must show the total spent by category (negative amounts / debits only).",
    requirements: [
      "Group by category.",
      "Sum the absolute value of amount or sum amount while filtering debits.",
      "Return category, total, tx_count.",
      "Sort by total DESC.",
    ],
    acceptanceCriteria: [
      "Correct GROUP BY + aggregations.",
      "HAVING is optional if you filter groups.",
      "Hidden tests pass.",
    ],
    restrictions: sqlRestrictions,
    starterFiles: [
      {
        name: "schema.sql",
        language: "sql",
        code: `CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  category TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  booked_at DATE NOT NULL
);
`,
      },
      {
        name: "query.sql",
        language: "sql",
        code: `-- TODO: totals by category (debits)
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "GROUP BY category", patterns: [/group\s+by\s+category/i] },
      { id: "t2", name: "SUM of amount", patterns: [/sum\s*\(/i] },
      { id: "t3", name: "COUNT of txs", patterns: [/count\s*\(/i] },
      { id: "t4", name: "filters debits or abs", patterns: [/amount\s*<\s*0|abs\s*\(/i] },
      { id: "t5", name: "ORDER BY total", patterns: [/order\s+by/i] },
    ],
    hints: ["WHERE amount < 0", "SELECT category, SUM(ABS(amount)) AS total, COUNT(*) AS tx_count"],
    solution: `SELECT category,
       SUM(ABS(amount)) AS total,
       COUNT(*) AS tx_count
FROM transactions
WHERE amount < 0
GROUP BY category
ORDER BY total DESC;`,
    explanation: "Classic aggregation with a debit filter.",
  },
  {
    variantId: "sql-customers-with-balance",
    kind: "sql",
    title: "SQL — Queries",
    subtitle: "Customers with balance and latest movement",
    estimatedMinutes: 45,
    story:
      "For a dashboard, join customers with accounts and show the balance. Include customers even if they do not have an account yet (LEFT JOIN).",
    requirements: [
      "FROM customers c LEFT JOIN accounts a ON a.customer_id = c.id",
      "Project c.id, c.full_name, a.balance.",
      "Sort by balance DESC NULLS LAST (or equivalent).",
    ],
    acceptanceCriteria: [
      "LEFT JOIN present.",
      "Customer and balance columns.",
      "Hidden tests pass.",
    ],
    restrictions: sqlRestrictions,
    starterFiles: [
      {
        name: "schema.sql",
        language: "sql",
        code: `CREATE TABLE customers (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL
);
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  balance NUMERIC(14,2) NOT NULL DEFAULT 0
);
`,
      },
      {
        name: "query.sql",
        language: "sql",
        code: `-- TODO: customers + balance (LEFT JOIN)
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "LEFT JOIN", patterns: [/left\s+join/i] },
      { id: "t2", name: "joins by customer_id", patterns: [/customer_id/i] },
      { id: "t3", name: "selects full_name", patterns: [/full_name/i] },
      { id: "t4", name: "selects balance", patterns: [/balance/i] },
      { id: "t5", name: "ORDER BY", patterns: [/order\s+by/i] },
    ],
    hints: ["LEFT JOIN accounts a ON a.customer_id = c.id", "ORDER BY a.balance DESC"],
    solution: `SELECT c.id, c.full_name, a.balance
FROM customers c
LEFT JOIN accounts a ON a.customer_id = c.id
ORDER BY a.balance DESC NULLS LAST;`,
    explanation: "LEFT JOIN preserves customers without an account.",
  },
  {
    variantId: "sql-duplicate-transfers",
    kind: "sql",
    title: "SQL — Queries",
    subtitle: "Detect duplicate transfers",
    estimatedMinutes: 40,
    story:
      "Operations flags suspected duplicates when from_account, to_account, amount, and the minute of created_at are the same.",
    requirements: [
      "Group by from_account, to_account, amount, and the date truncated to the minute (or date_trunc).",
      "Return groups with COUNT(*) > 1.",
      "Use HAVING.",
    ],
    acceptanceCriteria: [
      "GROUP BY + HAVING COUNT(*) > 1.",
      "Hidden tests pass.",
    ],
    restrictions: sqlRestrictions,
    starterFiles: [
      {
        name: "schema.sql",
        language: "sql",
        code: `CREATE TABLE transfers (
  id UUID PRIMARY KEY,
  from_account UUID NOT NULL,
  to_account UUID NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMP NOT NULL
);
`,
      },
      {
        name: "query.sql",
        language: "sql",
        code: `-- TODO: duplicate groups with HAVING
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "GROUP BY", patterns: [/group\s+by/i] },
      { id: "t2", name: "HAVING", patterns: [/having/i] },
      { id: "t3", name: "COUNT > 1", patterns: [/count\s*\([\s\S]*\)\s*>\s*1/i] },
      { id: "t4", name: "includes amount", patterns: [/amount/i] },
      { id: "t5", name: "from/to account", patterns: [/from_account/i, /to_account/i] },
    ],
    hints: ["HAVING COUNT(*) > 1", "date_trunc('minute', created_at) if the engine supports it"],
    solution: `SELECT from_account, to_account, amount, date_trunc('minute', created_at) AS minute_bucket, COUNT(*) AS times
FROM transfers
GROUP BY from_account, to_account, amount, date_trunc('minute', created_at)
HAVING COUNT(*) > 1;`,
    explanation: "Classic duplicate detection pattern with HAVING.",
  },
  {
    variantId: "sql-running-balance",
    kind: "sql",
    title: "SQL — Queries",
    subtitle: "Running balance with a window function",
    estimatedMinutes: 45,
    story:
      "You need the running balance per account using window functions, without collapsing the movement details.",
    requirements: [
      "Use SUM(amount) OVER (PARTITION BY account_id ORDER BY created_at, id).",
      "Return id, account_id, amount, created_at, running_balance.",
    ],
    acceptanceCriteria: [
      "OVER / PARTITION BY present.",
      "Stable ordering with created_at.",
      "Hidden tests pass.",
    ],
    restrictions: sqlRestrictions,
    starterFiles: [
      {
        name: "schema.sql",
        language: "sql",
        code: `CREATE TABLE ledger (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMP NOT NULL
);
`,
      },
      {
        name: "query.sql",
        language: "sql",
        code: `-- TODO: running balance with a window
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "SUM OVER", patterns: [/sum\s*\([\s\S]*\)\s*over\s*\(/i] },
      { id: "t2", name: "PARTITION BY account_id", patterns: [/partition\s+by\s+account_id/i] },
      { id: "t3", name: "ORDER BY in window", patterns: [/over\s*\([\s\S]*order\s+by/i] },
      { id: "t4", name: "alias running_balance", patterns: [/running_balance/i] },
      { id: "t5", name: "no GROUP BY that collapses everything", patterns: [/./], forbidden: [/^\s*group\s+by/im] },
    ],
    hints: ["SUM(amount) OVER (PARTITION BY account_id ORDER BY created_at, id) AS running_balance"],
    solution: `SELECT id, account_id, amount, created_at,
       SUM(amount) OVER (
         PARTITION BY account_id
         ORDER BY created_at, id
       ) AS running_balance
FROM ledger;`,
    explanation: "Window function for row-by-row running balance.",
  },
];
