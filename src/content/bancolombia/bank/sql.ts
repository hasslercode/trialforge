import type { PracticalVariant } from "@/domain/exam";

const sqlRestrictions = [
  "SQL estándar / ANSI lo más portable posible.",
  "No modifiques el esquema salvo que el enunciado lo pida.",
  "Los archivos de prueba (specs) están bloqueados.",
  "Prioriza consultas claras y correctas sobre micro-optimizaciones.",
];

export const sqlBank: PracticalVariant[] = [
  {
    variantId: "sql-account-movements",
    kind: "sql",
    title: "SQL — Consultas",
    subtitle: "Movimientos de una cuenta en un rango",
    estimatedMinutes: 40,
    story:
      "El backend de Bancolombia necesita listar movimientos de una cuenta entre dos fechas, ordenados del más reciente al más antiguo.",
    requirements: [
      "Escribe la consulta en `query.sql`.",
      "Selecciona id, amount, description, created_at.",
      "Filtra por account_id = :accountId y created_at entre :from y :to.",
      "Ordena por created_at DESC.",
    ],
    acceptanceCriteria: [
      "Usa WHERE y ORDER BY correctamente.",
      "No selecciona columnas de más innecesarias (puede haber * penalizado en tests).",
      "Tests ocultos pasan.",
    ],
    restrictions: sqlRestrictions,
    starterFiles: [
      {
        name: "schema.sql",
        language: "sql",
        code: `-- Referencia (bloqueado en plataforma real)
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
        code: `-- TODO: listar movimientos de :accountId entre :from y :to
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "usa SELECT", patterns: [/select/i] },
      { id: "t2", name: "filtra account_id", patterns: [/account_id/i] },
      { id: "t3", name: "rango de fechas", patterns: [/created_at/i] },
      { id: "t4", name: "WHERE presente", patterns: [/where/i] },
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
    explanation: "Filtro por cuenta + rango temporal + orden descendente.",
  },
  {
    variantId: "sql-spend-by-category",
    kind: "sql",
    title: "SQL — Consultas",
    subtitle: "Gastos agrupados por categoría",
    estimatedMinutes: 40,
    story:
      "El resumen mensual debe mostrar el total gastado por categoría (solo montos negativos / débitos).",
    requirements: [
      "Agrupa por category.",
      "Suma el valor absoluto de amount o suma amount filtrando débitos.",
      "Devuelve category, total, tx_count.",
      "Ordena por total DESC.",
    ],
    acceptanceCriteria: [
      "GROUP BY + agregaciones correctas.",
      "HAVING opcional si filtras grupos.",
      "Tests ocultos pasan.",
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
        code: `-- TODO: totales por categoría (débitos)
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "GROUP BY category", patterns: [/group\s+by\s+category/i] },
      { id: "t2", name: "SUM de amount", patterns: [/sum\s*\(/i] },
      { id: "t3", name: "COUNT de txs", patterns: [/count\s*\(/i] },
      { id: "t4", name: "filtra débitos o abs", patterns: [/amount\s*<\s*0|abs\s*\(/i] },
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
    explanation: "Agregación clásica con filtro de débitos.",
  },
  {
    variantId: "sql-customers-with-balance",
    kind: "sql",
    title: "SQL — Consultas",
    subtitle: "Clientes con saldo y último movimiento",
    estimatedMinutes: 45,
    story:
      "Para un dashboard, une customers con accounts y muestra saldo. Incluye clientes aunque aún no tengan cuenta (LEFT JOIN).",
    requirements: [
      "FROM customers c LEFT JOIN accounts a ON a.customer_id = c.id",
      "Proyecta c.id, c.full_name, a.balance.",
      "Ordena por balance DESC NULLS LAST (o equivalente).",
    ],
    acceptanceCriteria: [
      "LEFT JOIN presente.",
      "Columnas de cliente y saldo.",
      "Tests ocultos pasan.",
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
        code: `-- TODO: clientes + saldo (LEFT JOIN)
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "LEFT JOIN", patterns: [/left\s+join/i] },
      { id: "t2", name: "une por customer_id", patterns: [/customer_id/i] },
      { id: "t3", name: "selecciona full_name", patterns: [/full_name/i] },
      { id: "t4", name: "selecciona balance", patterns: [/balance/i] },
      { id: "t5", name: "ORDER BY", patterns: [/order\s+by/i] },
    ],
    hints: ["LEFT JOIN accounts a ON a.customer_id = c.id", "ORDER BY a.balance DESC"],
    solution: `SELECT c.id, c.full_name, a.balance
FROM customers c
LEFT JOIN accounts a ON a.customer_id = c.id
ORDER BY a.balance DESC NULLS LAST;`,
    explanation: "LEFT JOIN preserva clientes sin cuenta.",
  },
  {
    variantId: "sql-duplicate-transfers",
    kind: "sql",
    title: "SQL — Consultas",
    subtitle: "Detectar transferencias duplicadas",
    estimatedMinutes: 40,
    story:
      "Operaciones sospecha duplicados: mismo from_account, to_account, amount y minuto de created_at.",
    requirements: [
      "Agrupa por from_account, to_account, amount y fecha truncada a minuto (o date_trunc).",
      "Devuelve grupos con COUNT(*) > 1.",
      "Usa HAVING.",
    ],
    acceptanceCriteria: [
      "GROUP BY + HAVING COUNT(*) > 1.",
      "Tests ocultos pasan.",
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
        code: `-- TODO: grupos duplicados con HAVING
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "GROUP BY", patterns: [/group\s+by/i] },
      { id: "t2", name: "HAVING", patterns: [/having/i] },
      { id: "t3", name: "COUNT > 1", patterns: [/count\s*\([\s\S]*\)\s*>\s*1/i] },
      { id: "t4", name: "incluye amount", patterns: [/amount/i] },
      { id: "t5", name: "from/to account", patterns: [/from_account/i, /to_account/i] },
    ],
    hints: ["HAVING COUNT(*) > 1", "date_trunc('minute', created_at) si el motor lo permite"],
    solution: `SELECT from_account, to_account, amount, date_trunc('minute', created_at) AS minute_bucket, COUNT(*) AS times
FROM transfers
GROUP BY from_account, to_account, amount, date_trunc('minute', created_at)
HAVING COUNT(*) > 1;`,
    explanation: "Patrón clásico de detección de duplicados con HAVING.",
  },
  {
    variantId: "sql-running-balance",
    kind: "sql",
    title: "SQL — Consultas",
    subtitle: "Saldo acumulado con función ventana",
    estimatedMinutes: 45,
    story:
      "Necesitas el running balance por cuenta usando window functions, sin colapsar el detalle de movimientos.",
    requirements: [
      "Usa SUM(amount) OVER (PARTITION BY account_id ORDER BY created_at, id).",
      "Devuelve id, account_id, amount, created_at, running_balance.",
    ],
    acceptanceCriteria: [
      "OVER / PARTITION BY presentes.",
      "Orden estable con created_at.",
      "Tests ocultos pasan.",
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
        code: `-- TODO: running balance con ventana
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "SUM OVER", patterns: [/sum\s*\([\s\S]*\)\s*over\s*\(/i] },
      { id: "t2", name: "PARTITION BY account_id", patterns: [/partition\s+by\s+account_id/i] },
      { id: "t3", name: "ORDER BY en ventana", patterns: [/over\s*\([\s\S]*order\s+by/i] },
      { id: "t4", name: "alias running_balance", patterns: [/running_balance/i] },
      { id: "t5", name: "no GROUP BY que colapse todo", patterns: [/./], forbidden: [/^\s*group\s+by/im] },
    ],
    hints: ["SUM(amount) OVER (PARTITION BY account_id ORDER BY created_at, id) AS running_balance"],
    solution: `SELECT id, account_id, amount, created_at,
       SUM(amount) OVER (
         PARTITION BY account_id
         ORDER BY created_at, id
       ) AS running_balance
FROM ledger;`,
    explanation: "Window function para saldo acumulado fila a fila.",
  },
];
