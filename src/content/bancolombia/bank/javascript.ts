import type { PracticalVariant } from "@/domain/exam";

const baseRestrictions = [
  "JavaScript nativo únicamente (sin lodash ni similares).",
  "No puedes modificar los archivos de prueba unitaria (bloqueados).",
  "Prioriza una solución clara: tiempo limitado de la sesión.",
];

export const javascriptBank: PracticalVariant[] = [
  {
    variantId: "js-normalize-movements",
    kind: "javascript",
    title: "JavaScript puro — Algoritmia",
    subtitle: "Normalizador de movimientos bancarios",
    estimatedMinutes: 40,
    story:
      "Bancolombia necesita normalizar movimientos bancarios crudos. Debes transformar, filtrar y calcular saldos sin mutar la entrada.",
    requirements: [
      "Implementa `normalizeMovements(movements)` sin librerías externas.",
      "Convierte `amount` a número y `date` a ISO string.",
      "Descarta movimientos con amount no numérico o date inválida.",
      "Ordena por fecha ascendente y calcula `runningBalance` desde 0.",
    ],
    acceptanceCriteria: [
      "No muta el arreglo ni los objetos originales.",
      "Casos borde (vacío, inválidos) sin excepciones no controladas.",
      "Los tests unitarios ocultos pasan.",
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
      { id: "t1", name: "exporta normalizeMovements", patterns: [/function\s+normalizeMovements/] },
      { id: "t2", name: "usa map/filter", patterns: [/\.map\s*\(/, /\.filter\s*\(/] },
      { id: "t3", name: "convierte amount y date", patterns: [/Number\s*\(|parseFloat\s*\(/, /toISOString|Date\s*\(/] },
      { id: "t4", name: "ordena por fecha", patterns: [/\.sort\s*\(/] },
      { id: "t5", name: "calcula runningBalance", patterns: [/runningBalance/] },
      { id: "t6", name: "sin librerías externas", patterns: [/./], forbidden: [/require\s*\(|from\s+['"]lodash/] },
    ],
    hints: [
      "Filtra con Number.isFinite y Date válida.",
      "Acumula el balance sobre el arreglo ya ordenado.",
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
    explanation: "Limpia → filtra → ordena → acumula.",
  },
  {
    variantId: "js-group-transactions",
    kind: "javascript",
    title: "JavaScript puro — Algoritmia",
    subtitle: "Agrupar transacciones por categoría",
    estimatedMinutes: 40,
    story:
      "El resumen mensual debe agrupar transacciones por categoría y devolver totales. Entrada inmutable.",
    requirements: [
      "Implementa `groupByCategory(transactions)`.",
      "Devuelve un arreglo de `{ category, total, count }` ordenado por total descendente.",
      "Ignora transacciones con amount no finito.",
      "No mutes la entrada.",
    ],
    acceptanceCriteria: [
      "Una categoría por entrada en el resultado.",
      "Totales correctos y ordenamiento estable por total.",
      "Tests ocultos pasan.",
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
      { id: "t1", name: "exporta groupByCategory", patterns: [/function\s+groupByCategory/] },
      { id: "t2", name: "acumula totales", patterns: [/total|reduce|Map/] },
      { id: "t3", name: "incluye count", patterns: [/count/] },
      { id: "t4", name: "ordena descendente", patterns: [/\.sort\s*\(/] },
      { id: "t5", name: "filtra inválidos o valida amount", patterns: [/isFinite|Number\.isFinite|filter/] },
      { id: "t6", name: "sin librerías", patterns: [/./], forbidden: [/lodash|underscore/] },
    ],
    hints: ["Usa un Map category→acumulado.", "Al final convierte a arreglo y ordena por total."],
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
    explanation: "Map + sort cubre agrupación eficiente sin mutar la entrada.",
  },
  {
    variantId: "js-retry-payment",
    kind: "javascript",
    title: "JavaScript puro — Algoritmia",
    subtitle: "Reintentos de pago con backoff",
    estimatedMinutes: 40,
    story:
      "Una consulta de pago puede fallar de forma transitoria. Debes reintentar sin bloquear y sin reintentar errores 4xx.",
    requirements: [
      "Implementa `async function retryPayment(request, { retries = 3 })`.",
      "Reintenta solo si el error tiene `status >= 500` o no tiene status.",
      "No uses setInterval.",
      "Si agota reintentos, relanza el último error.",
    ],
    acceptanceCriteria: [
      "Éxito en el primer intento retorna el valor.",
      "Errores 4xx no se reintentan.",
      "Tests ocultos pasan.",
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
      { id: "t1", name: "exporta retryPayment async", patterns: [/async\s+function\s+retryPayment|function\s+retryPayment/] },
      { id: "t2", name: "usa bucle o reintentos", patterns: [/for\s*\(|while\s*\(|retries/] },
      { id: "t3", name: "try/catch", patterns: [/try\s*\{/, /catch/] },
      { id: "t4", name: "considera status 4xx/5xx", patterns: [/status|4\d\d|5\d\d/] },
      { id: "t5", name: "sin setInterval", patterns: [/./], forbidden: [/setInterval/] },
      { id: "t6", name: "await request", patterns: [/await\s+request/] },
    ],
    hints: ["En catch, si status está entre 400–499, throw inmediato.", "Decrementa retries en cada fallo reintentable."],
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
    explanation: "Reintento selectivo según clase de status HTTP.",
  },
  {
    variantId: "js-format-currency",
    kind: "javascript",
    title: "JavaScript puro — Algoritmia",
    subtitle: "Formateador de montos COP",
    estimatedMinutes: 35,
    story:
      "Debes formatear montos para UI de saldos en pesos colombianos, con reglas estrictas de redondeo y signo.",
    requirements: [
      "Implementa `formatCOP(amount)` → string tipo `$ 1.234.567` o `-$ 500`.",
      "Redondea al entero más cercano.",
      "Usa punto como separador de miles (estilo CO).",
      "NaN o no finito → `—`.",
    ],
    acceptanceCriteria: [
      "0 → `$ 0`.",
      "Negativos con prefijo `-`.",
      "Tests ocultos pasan.",
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
      { id: "t1", name: "exporta formatCOP", patterns: [/function\s+formatCOP/] },
      { id: "t2", name: "valida finito / NaN", patterns: [/isFinite|Number\.isFinite|Number\.isNaN/] },
      { id: "t3", name: "usa Math.round o similar", patterns: [/Math\.round|toFixed/] },
      { id: "t4", name: "separador de miles", patterns: [/replace|Intl|toLocaleString|\./] },
      { id: "t5", name: "prefijo $", patterns: [/\$/] },
      { id: "t6", name: "sin librerías", patterns: [/./], forbidden: [/lodash|numeral|accounting/] },
    ],
    hints: ["Math.round + String + replace con regex de miles.", "Intl.NumberFormat('es-CO') también es válido."],
    solution: `export function formatCOP(amount) {
  if (!Number.isFinite(amount)) return "—";
  const n = Math.round(amount);
  const sign = n < 0 ? "-" : "";
  const body = Math.abs(n).toLocaleString("es-CO");
  return sign + "$ " + body;
}`,
    explanation: "Validación + redondeo + locale CO.",
  },
  {
    variantId: "js-unique-sorted-ids",
    kind: "javascript",
    title: "JavaScript puro — Algoritmia",
    subtitle: "IDs únicos ordenados de transferencias",
    estimatedMinutes: 30,
    story:
      "Un batch de transferencias llega con IDs duplicados y desordenados. Debes devolver únicos ASC sin mutar.",
    requirements: [
      "Implementa `uniqueSortedIds(ids: string[]): string[]`.",
      "Elimina duplicados y ordena lexicográficamente.",
      "Ignora valores vacíos o no string.",
      "No mutes el arreglo original.",
    ],
    acceptanceCriteria: [
      "Entrada vacía → [].",
      "Sin side effects sobre `ids`.",
      "Tests ocultos pasan.",
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
      { id: "t1", name: "exporta uniqueSortedIds", patterns: [/function\s+uniqueSortedIds/] },
      { id: "t2", name: "usa Set o filter únicos", patterns: [/Set|filter/] },
      { id: "t3", name: "ordena", patterns: [/\.sort\s*\(/] },
      { id: "t4", name: "filtra strings válidos", patterns: [/typeof|filter|trim/] },
      { id: "t5", name: "no usa sort sobre la entrada directa sin copia", patterns: [/\[|\.\.\.|slice|filter|map|Array\.from/] },
      { id: "t6", name: "sin lodash", patterns: [/./], forbidden: [/lodash|uniq/] },
    ],
    hints: ["Filtra typeof === 'string' && trim.", "[...new Set(clean)].sort()"],
    solution: `export function uniqueSortedIds(ids) {
  const clean = ids.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim());
  return [...new Set(clean)].sort();
}`,
    explanation: "Filter → Set → sort sobre copia.",
  },
];
