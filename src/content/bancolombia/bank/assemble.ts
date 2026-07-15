import type {
  Exam,
  ExamAttempt,
  ExamSession,
  McqQuestion,
  PracticalVariant,
  VariantSelection,
} from "@/domain/exam";
import { mcqFundamentosBank } from "./mcq-fundamentos";
import { mcqFundamentosExtra } from "./mcq-fundamentos-extra";
import { mcqWebBank } from "./mcq-web";
import { mcqSqlBank } from "./mcq-sql";
import { javascriptBank } from "./javascript";
import { cssBank } from "./css";
import { angularBank } from "./angular";
import { sqlBank } from "./sql";

export const MCQ_PER_SESSION = 10;

const mcqSession1Bank = [...mcqFundamentosBank, ...mcqFundamentosExtra];
/** Sesión 2 mezcla web/Angular + SQL conceptos */
const mcqSession2Bank = [...mcqWebBank, ...mcqSqlBank];
/** Sesión 3: algoritmia JS o SQL */
const logicBank: PracticalVariant[] = [...javascriptBank, ...sqlBank];

export type UsedContent = {
  mcq1: Set<string>;
  mcq2: Set<string>;
  logic: Set<string>;
  css: Set<string>;
  angular: Set<string>;
};

export const examMeta = {
  company: "Bancolombia" as const,
  title: "Prueba técnica Frontend — Bancolombia",
  totalMinutes: 180,
  passThreshold: 70,
  environmentNote:
    "Resolverás el código en un IDE embebido (como en la plataforma real). No hay acceso a frameworks CSS ni al sistema de diseño del banco (BDS).",
  rules: [
    "Tiempo límite total: exactamente 3 horas para toda la prueba.",
    "Meta de aprobación: puntaje mínimo del 70%.",
    "Formato: 5 sesiones — 2 de selección múltiple y 3 de desarrollo práctico.",
    "Cada corrida nueva prioriza preguntas/prácticas que aún no hayas visto en slots previos.",
    "La sesión práctica 3 puede ser JavaScript o SQL según el sorteo.",
    "En las sesiones prácticas los archivos de pruebas unitarias están bloqueados.",
    "En Angular está prohibido ReactiveFormsModule: captura manual con $event o #templateRef.",
  ],
};

export const bankStats = {
  mcqFundamentos: mcqSession1Bank.length,
  mcqWeb: mcqSession2Bank.length,
  mcqSql: mcqSqlBank.length,
  javascript: javascriptBank.length,
  css: cssBank.length,
  angular: angularBank.length,
  sql: sqlBank.length,
  logic: logicBank.length,
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickOne<T>(bank: T[]): T {
  return bank[Math.floor(Math.random() * bank.length)];
}

function findVariant(bank: PracticalVariant[], id: string): PracticalVariant {
  const found = bank.find((item) => item.variantId === id);
  if (!found) throw new Error(`Variante no encontrada: ${id}`);
  return found;
}

function findMcq(bank: McqQuestion[], id: string, label: string) {
  const q = bank.find((item) => item.id === id);
  if (!q) throw new Error(`Pregunta ${label} no encontrada: ${id}`);
  return q;
}

function toPracticalSession(
  slot: { id: string; order: number; weight: number; phase: string },
  variant: PracticalVariant,
): ExamSession {
  const { variantId, ...rest } = variant;
  return { ...slot, ...rest, variantId };
}

/** Reúne IDs ya usados en corridas previas (slots ocupados). */
export function collectUsedContent(attempts: (ExamAttempt | null)[]): UsedContent {
  const used: UsedContent = {
    mcq1: new Set(),
    mcq2: new Set(),
    logic: new Set(),
    css: new Set(),
    angular: new Set(),
  };

  for (const attempt of attempts) {
    if (!attempt?.selection) continue;
    for (const id of attempt.selection.mcq1) used.mcq1.add(id);
    for (const id of attempt.selection.mcq2) used.mcq2.add(id);
    used.logic.add(attempt.selection.javascript);
    used.css.add(attempt.selection.css);
    used.angular.add(attempt.selection.angular);
  }

  return used;
}

/** Prioriza ítems no usados; si no alcanzan, completa con el resto del banco. */
function pickMcqIds(bank: McqQuestion[], used: Set<string>, count: number): string[] {
  const fresh = shuffle(bank.filter((q) => !used.has(q.id)));
  if (fresh.length >= count) return fresh.slice(0, count).map((q) => q.id);

  const picked = fresh.map((q) => q.id);
  const pickedSet = new Set(picked);
  const refill = shuffle(bank.filter((q) => !pickedSet.has(q.id)));
  return [...picked, ...refill.slice(0, count - picked.length).map((q) => q.id)];
}

function pickVariantId(bank: PracticalVariant[], used: Set<string>): string {
  const fresh = bank.filter((item) => !used.has(item.variantId));
  return pickOne(fresh.length > 0 ? fresh : bank).variantId;
}

export function defaultPreviewSelection(): VariantSelection {
  return {
    mcq1: mcqSession1Bank.slice(0, MCQ_PER_SESSION).map((q) => q.id),
    mcq2: mcqSession2Bank.slice(0, MCQ_PER_SESSION).map((q) => q.id),
    javascript: logicBank[0].variantId,
    css: cssBank[0].variantId,
    angular: angularBank[0].variantId,
  };
}

/**
 * Arma una selección evitando contenido ya visto en corridas previas.
 * Solo recicla cuando el banco de no usados se agota.
 */
export function pickVariantSelection(used?: UsedContent): VariantSelection {
  const u = used ?? {
    mcq1: new Set<string>(),
    mcq2: new Set<string>(),
    logic: new Set<string>(),
    css: new Set<string>(),
    angular: new Set<string>(),
  };

  return {
    mcq1: pickMcqIds(mcqSession1Bank, u.mcq1, MCQ_PER_SESSION),
    mcq2: pickMcqIds(mcqSession2Bank, u.mcq2, MCQ_PER_SESSION),
    javascript: pickVariantId(logicBank, u.logic),
    css: pickVariantId(cssBank, u.css),
    angular: pickVariantId(angularBank, u.angular),
  };
}

export function buildExam(selection: VariantSelection | null): Exam {
  const sel = selection ?? defaultPreviewSelection();

  const mcq1Questions = sel.mcq1.map((id) => findMcq(mcqSession1Bank, id, "MCQ1")) as typeof mcqSession1Bank;
  const mcq2Questions = sel.mcq2.map((id) => findMcq(mcqSession2Bank, id, "MCQ2")) as typeof mcqSession2Bank;
  const logicVariant = findVariant(logicBank, sel.javascript);

  const sessions: ExamSession[] = [
    {
      id: "s1-mcq",
      order: 1,
      weight: 15,
      phase: "Sesión 1 · Teoría",
      kind: "mcq",
      title: "Preguntas de selección múltiple — Fundamentos",
      subtitle: "JavaScript, navegador, seguridad y buenas prácticas",
      estimatedMinutes: 25,
      questions: mcq1Questions,
      variantId: sel.mcq1.join(","),
    },
    {
      id: "s2-mcq",
      order: 2,
      weight: 15,
      phase: "Sesión 2 · Teoría",
      kind: "mcq",
      title: "Preguntas de selección múltiple — Web, Angular & SQL",
      subtitle: "CSS, Angular, entorno de prueba y conceptos SQL",
      estimatedMinutes: 25,
      questions: mcq2Questions,
      variantId: sel.mcq2.join(","),
    },
    toPracticalSession(
      {
        id: "s3-logic",
        order: 3,
        weight: 25,
        phase: "Sesión 3 · Práctica",
      },
      {
        ...logicVariant,
        title:
          logicVariant.kind === "sql"
            ? "SQL — Consultas"
            : "JavaScript puro — Algoritmia",
      },
    ),
    toPracticalSession(
      { id: "s4-css", order: 4, weight: 20, phase: "Sesión 4 · Práctica" },
      findVariant(cssBank, sel.css),
    ),
    toPracticalSession(
      { id: "s5-angular", order: 5, weight: 25, phase: "Sesión 5 · Práctica" },
      findVariant(angularBank, sel.angular),
    ),
  ];

  return {
    ...examMeta,
    sessions,
    selection: sel,
  };
}
