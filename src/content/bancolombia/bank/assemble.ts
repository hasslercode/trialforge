import type {
  Exam,
  ExamAttempt,
  ExamSession,
  McqQuestion,
  PracticalVariant,
  VariantSelection,
} from "@/domain/exam";
import { mcqAngularBank } from "./mcq-angular";
import { mcqHtmlCssBank } from "./mcq-html-css";
import { mcqAwsBank } from "./mcq-aws";
import { typescriptBank } from "./typescript";
import { angularBank } from "./angular";

/** Questions per MCQ phase (real panel: 5 + 5 + 5). */
export const MCQ_PER_BLOCK = 5;

const gridBank = mcqHtmlCssBank.filter((q) => q.id.includes("grid"));
const flexBank = mcqHtmlCssBank.filter(
  (q) => q.id.includes("flex") && !q.id.includes("grid"),
);
const theoryBank = mcqHtmlCssBank.filter(
  (q) => !q.id.includes("grid") && !q.id.includes("flex"),
);

const allMcqBank: McqQuestion[] = [...mcqAwsBank, ...mcqHtmlCssBank, ...mcqAngularBank];

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
    "Mobile-first theory, then desktop practicals: 5 AWS → 5 HTML/CSS → 5 Angular MCQ → Angular API+list → TypeScript (curry/similar).",
  rules: [
    "Total time limit: exactly 3 hours for the entire challenge.",
    "Passing goal: minimum score of 70%.",
    "Sessions 1–3 (mobile): AWS, HTML/CSS (Grid), Angular MCQ — 5 questions each.",
    "Sessions 4–5 (desktop): Angular API+list practical, then TypeScript curry-like practical.",
    "On phone you can complete the three MCQ phases; code phases unlock on desktop / wide tablet.",
    "Each new run prioritizes content you have not seen in previous slots.",
    "In practicals, unit test files are locked. Angular: no ReactiveFormsModule.",
  ],
};

export const bankStats = {
  angular: angularBank.length,
  typescript: typescriptBank.length,
  mcqAws: mcqAwsBank.length,
  mcqHtmlCss: mcqHtmlCssBank.length,
  mcqAngular: mcqAngularBank.length,
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

/** HTML/CSS draw: 3 Grid + 1 Flex + 1 theory. */
function pickHtmlCssIds(used: Set<string>): string[] {
  return pickStratifiedMcqIds(
    [
      { bank: gridBank, count: 3 },
      { bank: flexBank, count: 1 },
      { bank: theoryBank, count: 1 },
    ],
    used,
  );
}

export function defaultPreviewSelection(): VariantSelection {
  return pickVariantSelection();
}

export function pickVariantSelection(used?: UsedContent): VariantSelection {
  const u = used ?? {
    angular: new Set<string>(),
    aws: new Set<string>(),
    htmlCss: new Set<string>(),
    typescript: new Set<string>(),
    angularMcq: new Set<string>(),
  };

  return {
    angular: pickVariantId(angularBank, u.angular),
    aws: pickMcqIds(mcqAwsBank, u.aws, MCQ_PER_BLOCK),
    htmlCss: pickHtmlCssIds(u.htmlCss),
    typescript: pickVariantId(typescriptBank, u.typescript),
    angularMcq: pickMcqIds(mcqAngularBank, u.angularMcq, MCQ_PER_BLOCK),
  };
}

export function buildExam(selection: VariantSelection | null): Exam {
  const sel = isValidSelection(selection) ? selection : defaultPreviewSelection();

  const awsQuestions = sel.aws.map((id) => findMcq(allMcqBank, id, "AWS"));
  const htmlCssQuestions = sel.htmlCss.map((id) => findMcq(allMcqBank, id, "HTML/CSS"));
  const angularMcqQuestions = sel.angularMcq.map((id) => findMcq(allMcqBank, id, "Angular MCQ"));
  const angularPractical = findVariant(angularBank, sel.angular);
  const typescriptPractical = findVariant(typescriptBank, sel.typescript);

  /** Mobile MCQs first, then desktop practicals. */
  const sessions: ExamSession[] = [
    {
      id: "s1-aws",
      order: 1,
      weight: 15,
      phase: "Session 1 · AWS",
      kind: "mcq",
      title: "AWS — Architecture scenarios",
      subtitle: "5 questions: choose the right service for the situation",
      estimatedMinutes: 15,
      questions: awsQuestions,
      variantId: sel.aws.join(","),
    },
    {
      id: "s2-html-css",
      order: 2,
      weight: 15,
      phase: "Session 2 · HTML / CSS",
      kind: "mcq",
      title: "HTML & CSS — Grid focus",
      subtitle: "5 questions: Grid-heavy, plus Flex and core theory",
      estimatedMinutes: 15,
      questions: htmlCssQuestions,
      variantId: sel.htmlCss.join(","),
    },
    {
      id: "s3-angular-mcq",
      order: 3,
      weight: 15,
      phase: "Session 3 · Angular MCQ",
      kind: "mcq",
      title: "Angular — Quick questions",
      subtitle: "5 straightforward questions (bindings, lists, HttpClient…)",
      estimatedMinutes: 15,
      questions: angularMcqQuestions,
      variantId: sel.angularMcq.join(","),
    },
    toPracticalSession(
      {
        id: "s4-angular",
        order: 4,
        weight: 25,
        phase: "Session 4 · Angular practical",
      },
      {
        ...angularPractical,
        title: "Angular — Consume API & list results",
      },
    ),
    toPracticalSession(
      {
        id: "s5-typescript",
        order: 5,
        weight: 30,
        phase: "Session 5 · TypeScript practical",
      },
      {
        ...typescriptPractical,
        title: typescriptPractical.title,
      },
    ),
  ];

  return {
    ...examMeta,
    sessions,
    selection: sel,
  };
}
