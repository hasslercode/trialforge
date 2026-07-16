import { promises as fs } from "node:fs";
import path from "node:path";
import type { PersistedState } from "@/infrastructure/storage/progress.repository";
import { coercePersistedState } from "@/infrastructure/storage/progress.repository";

export type SyncRecord = {
  code: string;
  updatedAt: string;
  state: PersistedState;
};

export class SyncBackendError extends Error {
  status: number;

  constructor(message: string, status = 503) {
    super(message);
    this.name = "SyncBackendError";
    this.status = status;
  }
}

const DATA_DIR = process.env.SYNC_DATA_DIR || path.join(process.cwd(), ".data", "sync");

type RedisCredentials = {
  url: string;
  token: string;
  source: "UPSTASH_REDIS_REST_*" | "KV_REST_API_*";
};

/**
 * Vercel Marketplace / Upstash injects either:
 * - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * - KV_REST_API_URL + KV_REST_API_TOKEN  (what this project has)
 */
function resolveRedisCredentials(): RedisCredentials | null {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (upstashUrl && upstashToken) {
    return { url: upstashUrl, token: upstashToken, source: "UPSTASH_REDIS_REST_*" };
  }

  const kvUrl = process.env.KV_REST_API_URL?.trim();
  const kvToken = process.env.KV_REST_API_TOKEN?.trim();
  if (kvUrl && kvToken) {
    return { url: kvUrl, token: kvToken, source: "KV_REST_API_*" };
  }

  return null;
}

function hasRedis(): boolean {
  return Boolean(resolveRedisCredentials());
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

function assertDurableBackend(): void {
  if (isVercelRuntime() && !hasRedis()) {
    throw new SyncBackendError(
      "Progress sync is not configured on this deployment. Connect Upstash/KV Redis in Vercel (KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN), then redeploy.",
      503,
    );
  }
}

function redisKey(code: string): string {
  return `trialforge:sync:${code}`;
}

async function upstashCommand(command: unknown[]): Promise<unknown> {
  const credentials = resolveRedisCredentials();
  if (!credentials) {
    throw new SyncBackendError("Upstash/KV Redis is not configured", 503);
  }

  const response = await fetch(credentials.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new SyncBackendError(`Upstash request failed (${response.status})`, 502);
  }

  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (payload.error) throw new SyncBackendError(payload.error, 502);
  return payload.result;
}

function filePathFor(code: string): string {
  return path.join(DATA_DIR, `${code}.json`);
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function normalizeRecord(code: string, value: unknown): SyncRecord | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<SyncRecord> & { state?: unknown };
  const state = coercePersistedState(raw.state);
  const updatedAt =
    typeof raw.updatedAt === "string" && raw.updatedAt
      ? raw.updatedAt
      : state.updatedAt || new Date(0).toISOString();

  return {
    code,
    updatedAt,
    state: { ...state, updatedAt },
  };
}

async function readFileRecord(code: string): Promise<SyncRecord | null> {
  try {
    const raw = await fs.readFile(filePathFor(code), "utf8");
    return normalizeRecord(code, JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function writeFileRecord(record: SyncRecord): Promise<void> {
  await ensureDataDir();
  const tmp = `${filePathFor(record.code)}.tmp`;
  const body = JSON.stringify(record);
  await fs.writeFile(tmp, body, "utf8");
  await fs.rename(tmp, filePathFor(record.code));
}

async function readUpstashRecord(code: string): Promise<SyncRecord | null> {
  const result = await upstashCommand(["GET", redisKey(code)]);
  if (result == null) return null;

  if (typeof result === "string") {
    if (!result) return null;
    try {
      return normalizeRecord(code, JSON.parse(result));
    } catch {
      return null;
    }
  }

  if (typeof result === "object") {
    return normalizeRecord(code, result);
  }

  return null;
}

async function writeUpstashRecord(record: SyncRecord): Promise<void> {
  await upstashCommand(["SET", redisKey(record.code), JSON.stringify(record)]);
}

export async function getSyncRecord(code: string): Promise<SyncRecord | null> {
  assertDurableBackend();
  if (hasRedis()) return readUpstashRecord(code);
  return readFileRecord(code);
}

export async function putSyncRecord(code: string, state: PersistedState): Promise<SyncRecord> {
  assertDurableBackend();
  const updatedAt = state.updatedAt || new Date().toISOString();
  const record: SyncRecord = {
    code,
    updatedAt,
    state: { ...state, updatedAt },
  };

  if (hasRedis()) {
    await writeUpstashRecord(record);
  } else {
    await writeFileRecord(record);
  }

  return record;
}

export function syncBackendKind(): "upstash" | "filesystem" | "unconfigured" {
  if (hasRedis()) return "upstash";
  if (isVercelRuntime()) return "unconfigured";
  return "filesystem";
}

/** Safe diagnostics (no secrets). */
export function syncBackendStatus() {
  const credentials = resolveRedisCredentials();
  return {
    backend: syncBackendKind(),
    vercel: isVercelRuntime(),
    redisEnv: credentials?.source ?? null,
    hasUpstashNamedEnv: Boolean(
      process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
    ),
    hasKvNamedEnv: Boolean(process.env.KV_REST_API_URL?.trim() && process.env.KV_REST_API_TOKEN?.trim()),
  };
}
