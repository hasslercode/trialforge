import type { AppState, ExamAttempt, ExamProgress } from "@/domain/exam";
import { MAX_ATTEMPT_SLOTS } from "@/domain/exam";

const DATABASE = "bancolombia-exam-v3";
const STORE = "state";
const KEY = "app";
const TOTAL_SECONDS = 180 * 60;

export const emptyProgress = (): ExamProgress => ({
  startedAt: null,
  remainingSeconds: TOTAL_SECONDS,
  selection: null,
  results: [],
  answers: {},
  submissions: {},
});

export const emptySlots = (): (ExamAttempt | null)[] =>
  Array.from({ length: MAX_ATTEMPT_SLOTS }, () => null);

export const emptyAppState = (): AppState => ({
  slots: emptySlots(),
  activeSlot: null,
});

export function attemptToProgress(attempt: ExamAttempt | null): ExamProgress {
  if (!attempt) return emptyProgress();
  return {
    startedAt: attempt.startedAt,
    remainingSeconds: attempt.remainingSeconds,
    selection: attempt.selection,
    results: attempt.results,
    answers: attempt.answers,
    submissions: attempt.submissions,
  };
}

export function progressToAttempt(
  progress: ExamProgress,
  overallScore: number,
  existingId?: string,
): ExamAttempt | null {
  if (!progress.startedAt || !progress.selection) return null;
  return {
    id: existingId ?? crypto.randomUUID(),
    startedAt: progress.startedAt,
    remainingSeconds: progress.remainingSeconds,
    selection: progress.selection,
    results: progress.results,
    answers: progress.answers,
    submissions: progress.submissions,
    overallScore,
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function normalizeState(value: Partial<AppState> | undefined): AppState {
  const slots = emptySlots();
  if (!value) return { slots, activeSlot: null };
  const incoming = Array.isArray(value.slots) ? value.slots : [];
  for (let i = 0; i < MAX_ATTEMPT_SLOTS; i += 1) {
    slots[i] = incoming[i] ?? null;
  }
  const activeSlot =
    typeof value.activeSlot === "number" && value.activeSlot >= 0 && value.activeSlot < MAX_ATTEMPT_SLOTS
      ? value.activeSlot
      : null;
  return { slots, activeSlot };
}

export async function loadAppState(): Promise<AppState> {
  if (typeof window === "undefined" || !window.indexedDB) return emptyAppState();
  try {
    const db = await openDatabase();
    return await new Promise<AppState>((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY);
      request.onsuccess = () => resolve(normalizeState(request.result as Partial<AppState> | undefined));
      request.onerror = () => reject(request.error);
    });
  } catch {
    return emptyAppState();
  }
}

export async function saveAppState(state: AppState): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).put(normalizeState(state), KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
