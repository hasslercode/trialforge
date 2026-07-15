export type SessionKind = "mcq" | "javascript" | "css" | "angular" | "sql";

export type McqOption = {
  id: string;
  label: string;
};

export type McqQuestion = {
  id: string;
  prompt: string;
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

/** IDs del banco elegidos para esta corrida del examen */
export type VariantSelection = {
  mcq1: string[];
  mcq2: string[];
  javascript: string;
  css: string;
  angular: string;
};

export type Exam = {
  company: "Bancolombia";
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

/** Una corrida completa del examen (ocupa 1 de 5 slots del panel) */
export type ExamAttempt = {
  id: string;
  startedAt: string;
  remainingSeconds: number;
  selection: VariantSelection;
  results: SessionResult[];
  answers: Record<string, string>;
  submissions: Record<string, Record<string, string>>;
  /** Puntaje ponderado cacheado para el panel */
  overallScore: number;
};

export const MAX_ATTEMPT_SLOTS = 5;

export type AppState = {
  /** Siempre length 5: null = slot libre */
  slots: (ExamAttempt | null)[];
  activeSlot: number | null;
};
