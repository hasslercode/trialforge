import type { AppState, ExamAttempt, ExamProgress } from "@/domain/exam";
import { MAX_ATTEMPT_SLOTS } from "@/domain/exam";

const DATABASE = "bancolombia-exam-v3";
const STORE = "state";
const KEY = "app";
const LEGACY_STUDY_KEY = "trialforge-study-v1";
const TOTAL_SECONDS = 180 * 60;

export type StudyProgress = Record<string, boolean>;

export type PersistedState = {
  app: AppState;
  study: StudyProgress;
};

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

export const emptyPersistedState = (): PersistedState => ({
  app: emptyAppState(),
  study: {},
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

function normalizeAppState(value: Partial<AppState> | undefined): AppState {
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

function normalizeStudyProgress(value: unknown): StudyProgress {
  if (!value || typeof value !== "object") return {};
  const out: StudyProgress = {};
  for (const [key, done] of Object.entries(value as Record<string, unknown>)) {
    if (done === true) out[key] = true;
  }
  return out;
}

function readLegacyStudyFromLocalStorage(): StudyProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LEGACY_STUDY_KEY);
    return raw ? normalizeStudyProgress(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function isLegacyAppPayload(value: unknown): value is Partial<AppState> {
  return Boolean(value && typeof value === "object" && "slots" in value && !("app" in value));
}

function normalizePersisted(value: unknown): PersistedState {
  if (!value || typeof value !== "object") {
    return { app: emptyAppState(), study: readLegacyStudyFromLocalStorage() };
  }

  if (isLegacyAppPayload(value)) {
    return {
      app: normalizeAppState(value),
      study: readLegacyStudyFromLocalStorage(),
    };
  }

  const wrapped = value as Partial<PersistedState>;
  const study = normalizeStudyProgress(wrapped.study);
  const legacyStudy = Object.keys(study).length === 0 ? readLegacyStudyFromLocalStorage() : study;

  return {
    app: normalizeAppState(wrapped.app),
    study: legacyStudy,
  };
}

async function readPersistedState(): Promise<PersistedState> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return { app: emptyAppState(), study: readLegacyStudyFromLocalStorage() };
  }

  try {
    const db = await openDatabase();
    return await new Promise<PersistedState>((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY);
      request.onsuccess = () => resolve(normalizePersisted(request.result));
      request.onerror = () => reject(request.error);
    });
  } catch {
    return { app: emptyAppState(), study: readLegacyStudyFromLocalStorage() };
  }
}

async function writePersistedState(state: PersistedState): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) return;

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const request = db
        .transaction(STORE, "readwrite")
        .objectStore(STORE)
        .put(
          {
            app: normalizeAppState(state.app),
            study: normalizeStudyProgress(state.study),
          },
          KEY,
        );
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Limpia copia legacy una vez migrada a IndexedDB.
    try {
      localStorage.removeItem(LEGACY_STUDY_KEY);
    } catch {
      /* ignore */
    }
  } catch {
    /* IndexedDB no disponible (modo privado, cuota, etc.) */
  }
}

export async function loadPersistedState(): Promise<PersistedState> {
  return readPersistedState();
}

export async function loadAppState(): Promise<AppState> {
  const persisted = await readPersistedState();
  return persisted.app;
}

export async function saveAppState(state: AppState): Promise<void> {
  const persisted = await readPersistedState();
  await writePersistedState({ ...persisted, app: normalizeAppState(state) });
}

export async function loadStudyProgress(): Promise<StudyProgress> {
  const persisted = await readPersistedState();
  return persisted.study;
}

export async function saveStudyProgress(study: StudyProgress): Promise<void> {
  const persisted = await readPersistedState();
  await writePersistedState({ ...persisted, study: normalizeStudyProgress(study) });
}
