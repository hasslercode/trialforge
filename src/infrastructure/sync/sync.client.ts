import type { PersistedState } from "@/infrastructure/storage/progress.repository";
import {
  coercePersistedState,
  mergePersistedStates,
} from "@/infrastructure/storage/progress.repository";
import { isValidUserCode, normalizeUserCode } from "@/infrastructure/sync/usercode";

const USERCODE_KEY = "trialforge-usercode-v1";
const SYNC_DEBOUNCE_MS = 2500;
const MAX_PAYLOAD_CHARS = 1_500_000;

type SyncApiError = {
  error?: string;
};

let pendingState: PersistedState | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let inflight: Promise<void> | null = null;

export function getStoredUserCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USERCODE_KEY);
    if (!raw) return null;
    const code = normalizeUserCode(raw);
    return isValidUserCode(code) ? code : null;
  } catch {
    return null;
  }
}

export function setStoredUserCode(code: string): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeUserCode(code);
  if (!isValidUserCode(normalized)) return;
  try {
    localStorage.setItem(USERCODE_KEY, normalized);
  } catch {
    /* ignore */
  }
}

export function clearStoredUserCode(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USERCODE_KEY);
  } catch {
    /* ignore */
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as SyncApiError;
    if (body.error) return body.error;
  } catch {
    /* ignore */
  }
  return `Sync failed (${response.status})`;
}

export async function pullRemoteState(code: string): Promise<PersistedState | null> {
  const normalized = normalizeUserCode(code);
  if (!isValidUserCode(normalized)) throw new Error("Invalid progress code");

  const response = await fetch(`/api/sync/${encodeURIComponent(normalized)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await parseError(response));

  const body = (await response.json()) as { state?: unknown };
  return coercePersistedState(body.state);
}

export async function pushRemoteState(code: string, state: PersistedState): Promise<void> {
  const normalized = normalizeUserCode(code);
  if (!isValidUserCode(normalized)) throw new Error("Invalid progress code");

  const payload = JSON.stringify({ state: coercePersistedState(state) });
  if (payload.length > MAX_PAYLOAD_CHARS) {
    throw new Error("Progress payload is too large to sync");
  }

  const response = await fetch(`/api/sync/${encodeURIComponent(normalized)}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: payload,
  });

  if (!response.ok) throw new Error(await parseError(response));
}

export async function claimRemoteState(state: PersistedState): Promise<string> {
  const payload = JSON.stringify({ state: coercePersistedState(state) });
  if (payload.length > MAX_PAYLOAD_CHARS) {
    throw new Error("Progress payload is too large to sync");
  }

  const response = await fetch("/api/sync", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: payload,
  });

  if (!response.ok) throw new Error(await parseError(response));

  const body = (await response.json()) as { code?: string };
  if (!body.code || !isValidUserCode(body.code)) {
    throw new Error("Server did not return a valid progress code");
  }
  return normalizeUserCode(body.code);
}

async function runPush(state: PersistedState): Promise<void> {
  const code = getStoredUserCode();
  if (!code) return;

  // Merge with remote first so a mid-progress tab cannot downgrade a richer snapshot.
  let next = coercePersistedState(state);
  try {
    const remote = await pullRemoteState(code);
    if (remote) next = mergePersistedStates(next, remote);
  } catch {
    /* push local best-effort if remote read fails */
  }
  await pushRemoteState(code, next);
}

export function scheduleSyncPush(state: PersistedState): void {
  if (typeof window === "undefined") return;
  if (!getStoredUserCode()) return;

  pendingState = state;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    const snapshot = pendingState;
    pendingState = null;
    if (!snapshot) return;
    inflight = runPush(snapshot)
      .catch(() => {
        /* keep local; next save retries */
      })
      .finally(() => {
        inflight = null;
      });
  }, SYNC_DEBOUNCE_MS);
}

export async function flushSyncPush(): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  const snapshot = pendingState;
  pendingState = null;
  if (inflight) await inflight;
  if (snapshot) {
    try {
      await runPush(snapshot);
    } catch {
      /* ignore */
    }
  }
}
