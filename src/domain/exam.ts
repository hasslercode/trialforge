export type SessionKind = "mcq" | "javascript" | "css" | "angular" | "sql";

/** Mini layout preview for Flex/Grid UI questions */
export type McqLayoutItem = {
  label: string;
  /** Optional inline styles for the item box (e.g. alignSelf, gridColumn) */
  style?: Record<string, string>;
};

export type McqLayoutPreview = {
  display: "flex" | "grid";
  justifyContent?: string;
  alignItems?: string;
  flexDirection?: string;
  flexWrap?: string;
  gap?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  items: McqLayoutItem[];
};

export type McqOption = {
  id: string;
  label: string;
  /** Optional code snippet (HTML/TS/CSS) shown under the label */
  code?: string;
  /** Optional visual layout mock for CSS questions */
  layout?: McqLayoutPreview;
};

export type McqQuestion = {
  id: string;
  prompt: string;
  /** Optional code block shown under the prompt (component, snippet, etc.) */
  code?: string;
  /** Language hint for accessibility / styling */
  codeLang?: "ts" | "html" | "css" | "js" | "sql";
  options: McqOption[];
  answerId: string;
  explanation: string;
};

export type HiddenTest = {
  id: string;
  name: string;
  patterns: RegExp[];
  forbidden?: RegExp[];
};

export type PracticalVariant = {
  variantId: string;
  kind: "javascript" | "css" | "angular" | "sql";
  title: string;
  subtitle: string;
  story: string;
  estimatedMinutes: number;
  requirements: string[];
  acceptanceCriteria: string[];
  restrictions: string[];
  starterFiles: { name: string; language: string; code: string }[];
  hiddenTests: HiddenTest[];
  hints: string[];
  solution: string;
  explanation: string;
};

export type McqSession = {
  kind: "mcq";
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  questions: McqQuestion[];
};

export type PracticalSession = Omit<PracticalVariant, "variantId">;

export type ExamSession = {
  id: string;
  order: number;
  weight: number;
  phase: string;
  variantId?: string;
} & (McqSession | PracticalSession);

/**
 * Bank IDs chosen for this exam run.
 * Mirrors the real Bancolombia-style panel order.
 */
export type VariantSelection = {
  /** S1 — Angular practical (API + list) */
  angular: string;
  /** S2 — 5 AWS architecture MCQs */
  aws: string[];
  /** S3 — 5 HTML/CSS MCQs (Grid-heavy) */
  htmlCss: string[];
  /** S4 — TypeScript/JS curry practical */
  typescript: string;
  /** S5 — 5 simple Angular MCQs */
  angularMcq: string[];
};

export type Exam = {
  company: string;
  title: string;
  totalMinutes: number;
  passThreshold: number;
  environmentNote: string;
  rules: string[];
  sessions: ExamSession[];
  selection: VariantSelection | null;
};

export type SessionResult = {
  sessionId: string;
  score: number;
  passed: number;
  total: number;
  feedback: string[];
  completedAt: string;
};

export type ExamProgress = {
  startedAt: string | null;
  remainingSeconds: number;
  selection: VariantSelection | null;
  results: SessionResult[];
  answers: Record<string, string>;
  submissions: Record<string, Record<string, string>>;
};

/** One complete exam run (occupies 1 panel slot) */
export type ExamAttempt = {
  id: string;
  startedAt: string;
  remainingSeconds: number;
  selection: VariantSelection;
  results: SessionResult[];
  answers: Record<string, string>;
  submissions: Record<string, Record<string, string>>;
  /** Cached weighted score for the panel */
  overallScore: number;
};

/**
 * Enough history slots to cover the expanded MCQ bank
 * (bottleneck for practicals remains ~10 JS/SQL variants in session 3).
 */
export const MAX_ATTEMPT_SLOTS = 15;

export type AppState = {
  /** Length = MAX_ATTEMPT_SLOTS: null = free slot */
  slots: (ExamAttempt | null)[];
  activeSlot: number | null;
};
