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
import { mcqEngineeringBank } from "./mcq-engineering";
import { javascriptBank } from "./javascript";
import { cssBank } from "./css";
import { angularBank } from "./angular";
import { sqlBank } from "./sql";

export const MCQ_PER_SESSION = 10;

const mcqSession1Bank = [...mcqFundamentosBank, ...mcqFundamentosExtra];
/** Session 2 mixes web/Angular + SQL + engineering quality */
const mcqSession2Bank = [...mcqWebBank, ...mcqSqlBank, ...mcqEngineeringBank];
/** Session 3: JS algorithms or SQL */
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
  title: "Frontend Technical Challenge · Bancolombia",
  totalMinutes: 180,
  passThreshold: 70,
  environmentNote:
    "Embedded IDE similar to a real assessment platform. No CSS frameworks or client design systems. Content comes from the Bancolombia track; TrialForge can host other clients.",
  rules: [
    "Total time limit: exactly 3 hours for the entire challenge.",
    "Passing goal: minimum score of 70%.",
    "Format: 5 sessions — 2 multiple choice and 3 hands-on practicals.",
    "Each new run prioritizes questions/practicals you have not seen in previous slots.",
    "Practical session 3 may be JavaScript or SQL depending on the draw.",
    "In practical sessions, unit test files are locked.",
    "In Angular, ReactiveFormsModule is forbidden: capture input manually with $event or #templateRef.",
  ],
};

export const bankStats = {
  mcqFundamentos: mcqSession1Bank.length,
  mcqWeb: mcqSession2Bank.length,
  mcqSql: mcqSqlBank.length,
  mcqEngineering: mcqEngineeringBank.length,
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
  if (!found) throw new Error(`Variant not found: ${id}`);
  return found;
}

function findMcq(bank: McqQuestion[], id: string, label: string) {
  const q = bank.find((item) => item.id === id);
  if (!q) throw new Error(`Question ${label} not found: ${id}`);
  return q;
}

function toPracticalSession(
  slot: { id: string; order: number; weight: number; phase: string },
  variant: PracticalVariant,
): ExamSession {
  const { variantId, ...rest } = variant;
  return { ...slot, ...rest, variantId };
}

/** Collects IDs already used in previous runs (occupied slots). */
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

/** Prefer unused items; if not enough, fill from the rest of the bank. */
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
 * Builds a selection avoiding content already seen in previous runs.
 * Only recycles when the unused bank is exhausted.
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
      phase: "Session 1 · Theory",
      kind: "mcq",
      title: "Multiple-choice questions — Fundamentals",
      subtitle: "JavaScript, browser, security, and best practices",
      estimatedMinutes: 25,
      questions: mcq1Questions,
      variantId: sel.mcq1.join(","),
    },
    {
      id: "s2-mcq",
      order: 2,
      weight: 15,
      phase: "Session 2 · Theory",
      kind: "mcq",
      title: "Multiple-choice questions — Web, Angular, SQL & Engineering",
      subtitle: "CSS, Angular, SQL concepts, Clean Code, SOLID, architecture & quality",
      estimatedMinutes: 25,
      questions: mcq2Questions,
      variantId: sel.mcq2.join(","),
    },
    toPracticalSession(
      {
        id: "s3-logic",
        order: 3,
        weight: 25,
        phase: "Session 3 · Practical",
      },
      {
        ...logicVariant,
        title:
          logicVariant.kind === "sql"
            ? "SQL — Queries"
            : "Vanilla JavaScript — Algorithms",
      },
    ),
    toPracticalSession(
      { id: "s4-css", order: 4, weight: 20, phase: "Session 4 · Practical" },
      findVariant(cssBank, sel.css),
    ),
    toPracticalSession(
      { id: "s5-angular", order: 5, weight: 25, phase: "Session 5 · Practical" },
      findVariant(angularBank, sel.angular),
    ),
  ];

  return {
    ...examMeta,
    sessions,
    selection: sel,
  };
}
