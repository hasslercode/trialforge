import { promises as fs } from "node:fs";
import path from "node:path";
import type { PersistedState } from "@/infrastructure/storage/progress.repository";
import { coercePersistedState } from "@/infrastructure/storage/progress.repository";

export type SyncRecord = {
  code: string;
  updatedAt: string;
  state: PersistedState;
};

const DATA_DIR = process.env.SYNC_DATA_DIR || path.join(process.cwd(), ".data", "sync");

function hasUpstash(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function redisKey(code: string): string {
  return `trialforge:sync:${code}`;
}

async function upstashCommand(command: unknown[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash is not configured");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed (${response.status})`);
  }

  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (payload.error) throw new Error(payload.error);
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
  if (typeof result !== "string" || !result) return null;
  try {
    return normalizeRecord(code, JSON.parse(result));
  } catch {
    return null;
  }
}

async function writeUpstashRecord(record: SyncRecord): Promise<void> {
  await upstashCommand(["SET", redisKey(record.code), JSON.stringify(record)]);
}

export async function getSyncRecord(code: string): Promise<SyncRecord | null> {
  if (hasUpstash()) return readUpstashRecord(code);
  return readFileRecord(code);
}

export async function putSyncRecord(code: string, state: PersistedState): Promise<SyncRecord> {
  const updatedAt = state.updatedAt || new Date().toISOString();
  const record: SyncRecord = {
    code,
    updatedAt,
    state: { ...state, updatedAt },
  };

  if (hasUpstash()) {
    await writeUpstashRecord(record);
  } else {
    await writeFileRecord(record);
  }

  return record;
}

export function syncBackendKind(): "upstash" | "filesystem" {
  return hasUpstash() ? "upstash" : "filesystem";
}
