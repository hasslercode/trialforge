import type { ExamSession, HiddenTest, McqQuestion, SessionResult } from "@/domain/exam";

export type Evaluation = Omit<SessionResult, "completedAt">;

function runHiddenTests(code: string, tests: HiddenTest[]): Evaluation {
  const feedback: string[] = [];
  let passed = 0;

  for (const test of tests) {
    const okPatterns = test.patterns.some((pattern) => pattern.test(code));
    const hitForbidden = (test.forbidden ?? []).some((pattern) => pattern.test(code));
    const ok = okPatterns && !hitForbidden;
    if (ok) passed += 1;
    feedback.push(ok ? `✓ ${test.name}` : `✗ ${test.name}`);
  }

  const score = tests.length ? Math.round((passed / tests.length) * 100) : 0;
  return { sessionId: "", score, passed, total: tests.length, feedback };
}

export function evaluateMcq(sessionId: string, questions: McqQuestion[], answers: Record<string, string>): Evaluation {
  const feedback: string[] = [];
  let passed = 0;

  for (const question of questions) {
    const selected = answers[question.id];
    const ok = selected === question.answerId;
    if (ok) passed += 1;
    feedback.push(ok ? `✓ ${question.id}` : `✗ ${question.id}`);
  }

  return {
    sessionId,
    score: questions.length ? Math.round((passed / questions.length) * 100) : 0,
    passed,
    total: questions.length,
    feedback,
  };
}

/** Files the candidate is expected to edit — exclude locked reference files from grading. */
export function solutionCodeBlob(
  kind: Exclude<ExamSession["kind"], "mcq">,
  files: Record<string, string>,
): string {
  return Object.entries(files)
    .filter(([name]) => {
      if (kind === "sql" && name === "schema.sql") return false;
      if (kind === "css" && name.endsWith(".html")) return false;
      return true;
    })
    .map(([, code]) => code)
    .join("\n\n");
}

export function evaluatePractical(session: ExamSession, files: Record<string, string>): Evaluation {
  if (session.kind === "mcq") {
    throw new Error("Use evaluateMcq for MCQ sessions");
  }

  const blob = solutionCodeBlob(session.kind, files);
  const result = runHiddenTests(blob, session.hiddenTests);
  return { ...result, sessionId: session.id };
}

export function weightedExamScore(
  sessions: { id: string; weight: number }[],
  results: { sessionId: string; score: number }[],
): number {
  const byId = new Map(results.map((r) => [r.sessionId, r.score]));
  let totalWeight = 0;
  let accrued = 0;

  for (const session of sessions) {
    const score = byId.get(session.id);
    if (score === undefined) continue;
    totalWeight += session.weight;
    accrued += (score / 100) * session.weight;
  }

  if (!totalWeight) return 0;
  return Math.round((accrued / totalWeight) * 100);
}
