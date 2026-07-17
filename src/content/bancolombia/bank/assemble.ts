import type {
  Exam,
  ExamAttempt,
  ExamSession,
  McqQuestion,
  PracticalVariant,
  VariantSelection,
} from "@/domain/exam";
import { mcqAngularSimpleBank } from "./mcq-angular-simple";
import { mcqCssLayoutsBank } from "./mcq-css-layouts";
import { mcqHtmlCssTheoryBank } from "./mcq-html-css-theory";
import { mcqAwsBank } from "./mcq-aws";
import { javascriptBank } from "./javascript";
import { angularBank } from "./angular";

/** Questions per MCQ phase (matches real panel: 5 + 5 + 5). */
export const MCQ_PER_BLOCK = 5;

const htmlCssGridBank = mcqCssLayoutsBank.filter((q) => q.id.includes("grid"));
const htmlCssFlexBank = mcqCssLayoutsBank.filter((q) => q.id.includes("flex"));
const htmlCssTheoryBank = mcqHtmlCssTheoryBank;

/** All MCQs that can appear (for lookup). */
const allMcqBank: McqQuestion[] = [
  ...mcqAwsBank,
  ...mcqCssLayoutsBank,
  ...mcqHtmlCssTheoryBank,
  ...mcqAngularSimpleBank,
];

/** TypeScript practical bank — curry first (interview killer). */
const typescriptBank: PracticalVariant[] = javascriptBank.filter((v) => v.variantId === "js-curry");
const typescriptFallbackBank: PracticalVariant[] =
  typescriptBank.length > 0 ? typescriptBank : javascriptBank;

export type UsedContent = {
  angular: Set<string>;
  aws: Set<string>;
  htmlCss: Set<string>;
  typescript: Set<string>;
  angularMcq: Set<string>;
};

export const examMeta = {
  company: "Bancolombia" as const,
  title: "Frontend Technical Challenge · Bancolombia",
  totalMinutes: 180,
  passThreshold: 70,
  environmentNote:
    "Flow aligned to a real Bancolombia-style panel: Angular API exercise → AWS → HTML/CSS → TypeScript curry → Angular MCQ.",
  rules: [
    "Total time limit: exactly 3 hours for the entire challenge.",
    "Passing goal: minimum score of 70%.",
    "Format mirrors the real panel: 1 Angular practical, 5 AWS MCQs, 5 HTML/CSS MCQs, 1 TypeScript curry practical, 5 Angular MCQs.",
    "HTML/CSS block emphasizes CSS Grid (plus Flex/theory).",
    "Each new run prioritizes questions/practicals you have not seen in previous slots.",
    "In practical sessions, unit test files are locked.",
    "In Angular, ReactiveFormsModule is forbidden: capture input manually with $event or #templateRef.",
  ],
};

export const bankStats = {
  angular: angularBank.length,
  mcqAws: mcqAwsBank.length,
  mcqHtmlCss: mcqCssLayoutsBank.length + mcqHtmlCssTheoryBank.length,
  typescript: typescriptFallbackBank.length,
  mcqAngularSimple: mcqAngularSimpleBank.length,
  mcqCssLayouts: mcqCssLayoutsBank.length,
  mcqHtmlCssTheory: mcqHtmlCssTheoryBank.length,
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

export function isValidSelection(sel: unknown): sel is VariantSelection {
  if (!sel || typeof sel !== "object") return false;
  const s = sel as VariantSelection;
  return (
    typeof s.angular === "string" &&
    typeof s.typescript === "string" &&
    Array.isArray(s.aws) &&
    Array.isArray(s.htmlCss) &&
    Array.isArray(s.angularMcq) &&
    s.aws.length === MCQ_PER_BLOCK &&
    s.htmlCss.length === MCQ_PER_BLOCK &&
    s.angularMcq.length === MCQ_PER_BLOCK
  );
}

/** Collects IDs already used in previous runs (occupied slots). */
export function collectUsedContent(attempts: (ExamAttempt | null)[]): UsedContent {
  const used: UsedContent = {
    angular: new Set(),
    aws: new Set(),
    htmlCss: new Set(),
    typescript: new Set(),
    angularMcq: new Set(),
  };

  for (const attempt of attempts) {
    if (!attempt?.selection || !isValidSelection(attempt.selection)) continue;
    used.angular.add(attempt.selection.angular);
    used.typescript.add(attempt.selection.typescript);
    for (const id of attempt.selection.aws) used.aws.add(id);
    for (const id of attempt.selection.htmlCss) used.htmlCss.add(id);
    for (const id of attempt.selection.angularMcq) used.angularMcq.add(id);
  }

  return used;
}

function pickMcqIds(bank: McqQuestion[], used: Set<string>, count: number): string[] {
  if (count <= 0 || bank.length === 0) return [];
  const fresh = shuffle(bank.filter((q) => !used.has(q.id)));
  if (fresh.length >= count) return fresh.slice(0, count).map((q) => q.id);

  const picked = fresh.map((q) => q.id);
  const pickedSet = new Set(picked);
  const refill = shuffle(bank.filter((q) => !pickedSet.has(q.id)));
  return [...picked, ...refill.slice(0, count - picked.length).map((q) => q.id)];
}

function pickStratifiedMcqIds(
  groups: { bank: McqQuestion[]; count: number }[],
  used: Set<string>,
): string[] {
  const ids: string[] = [];
  const localUsed = new Set(used);
  for (const group of groups) {
    const picked = pickMcqIds(group.bank, localUsed, group.count);
    for (const id of picked) localUsed.add(id);
    ids.push(...picked);
  }
  return shuffle(ids);
}

function pickVariantId(bank: PracticalVariant[], used: Set<string>): string {
  const fresh = bank.filter((item) => !used.has(item.variantId));
  return pickOne(fresh.length > 0 ? fresh : bank).variantId;
}

/** Prefer sports-results when unused; otherwise any unused Angular variant. */
function pickAngularPractical(used: Set<string>): string {
  const preferred = "ng-sports-results";
  if (!used.has(preferred) && angularBank.some((v) => v.variantId === preferred)) {
    return preferred;
  }
  return pickVariantId(angularBank, used);
}

function pickTypescriptPractical(used: Set<string>): string {
  const preferred = "js-curry";
  if (!used.has(preferred) && typescriptFallbackBank.some((v) => v.variantId === preferred)) {
    return preferred;
  }
  return pickVariantId(typescriptFallbackBank, used);
}

/** HTML/CSS: 3 Grid + 1 Flex + 1 theory (Grid emphasis from feedback). */
function pickHtmlCssIds(used: Set<string>): string[] {
  return pickStratifiedMcqIds(
    [
      { bank: htmlCssGridBank, count: 3 },
      { bank: htmlCssFlexBank, count: 1 },
      { bank: htmlCssTheoryBank, count: 1 },
    ],
    used,
  );
}

export function defaultPreviewSelection(): VariantSelection {
  return pickVariantSelection();
}

/**
 * Builds a selection avoiding content already seen in previous runs.
 * Only recycles when the unused bank is exhausted.
 */
export function pickVariantSelection(used?: UsedContent): VariantSelection {
  const u = used ?? {
    angular: new Set<string>(),
    aws: new Set<string>(),
    htmlCss: new Set<string>(),
    typescript: new Set<string>(),
    angularMcq: new Set<string>(),
  };

  return {
    angular: pickAngularPractical(u.angular),
    aws: pickMcqIds(mcqAwsBank, u.aws, MCQ_PER_BLOCK),
    htmlCss: pickHtmlCssIds(u.htmlCss),
    typescript: pickTypescriptPractical(u.typescript),
    angularMcq: pickMcqIds(mcqAngularSimpleBank, u.angularMcq, MCQ_PER_BLOCK),
  };
}

export function buildExam(selection: VariantSelection | null): Exam {
  const sel = isValidSelection(selection) ? selection : defaultPreviewSelection();

  const awsQuestions = sel.aws.map((id) => findMcq(allMcqBank, id, "AWS"));
  const htmlCssQuestions = sel.htmlCss.map((id) => findMcq(allMcqBank, id, "HTML/CSS"));
  const angularMcqQuestions = sel.angularMcq.map((id) => findMcq(allMcqBank, id, "Angular MCQ"));
  const angularPractical = findVariant(angularBank, sel.angular);
  const typescriptPractical = findVariant(typescriptFallbackBank, sel.typescript);

  const sessions: ExamSession[] = [
    toPracticalSession(
      {
        id: "s1-angular",
        order: 1,
        weight: 25,
        phase: "Session 1 · Angular practical",
      },
      {
        ...angularPractical,
        title: "Angular — Consume API & list results",
      },
    ),
    {
      id: "s2-aws",
      order: 2,
      weight: 15,
      phase: "Session 2 · AWS",
      kind: "mcq",
      title: "AWS — Architecture scenarios",
      subtitle: "5 questions: pick the right service for the situation",
      estimatedMinutes: 15,
      questions: awsQuestions,
      variantId: sel.aws.join(","),
    },
    {
      id: "s3-html-css",
      order: 3,
      weight: 15,
      phase: "Session 3 · HTML / CSS",
      kind: "mcq",
      title: "HTML & CSS — Grid focus",
      subtitle: "5 questions: Grid-heavy layouts, Flex, and HTML/CSS theory",
      estimatedMinutes: 15,
      questions: htmlCssQuestions,
      variantId: sel.htmlCss.join(","),
    },
    toPracticalSession(
      {
        id: "s4-typescript",
        order: 4,
        weight: 30,
        phase: "Session 4 · TypeScript practical",
      },
      {
        ...typescriptPractical,
        title: "TypeScript — Currying",
        subtitle: typescriptPractical.subtitle,
      },
    ),
    {
      id: "s5-angular-mcq",
      order: 5,
      weight: 15,
      phase: "Session 5 · Angular MCQ",
      kind: "mcq",
      title: "Angular — Quick questions",
      subtitle: "5 straightforward questions (bindings, ngIf/ngFor, HttpClient…)",
      estimatedMinutes: 15,
      questions: angularMcqQuestions,
      variantId: sel.angularMcq.join(","),
    },
  ];

  return {
    ...examMeta,
    sessions,
    selection: sel,
  };
}
