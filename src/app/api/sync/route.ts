import { NextResponse } from "next/server";
import { coercePersistedState } from "@/infrastructure/storage/progress.repository";
import {
  getSyncRecord,
  putSyncRecord,
  SyncBackendError,
  syncBackendKind,
  syncBackendStatus,
} from "@/infrastructure/sync/sync-store";
import { generateUserCode, isValidUserCode } from "@/infrastructure/sync/usercode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_500_000;
const MAX_CLAIM_ATTEMPTS = 8;

function errorResponse(error: unknown) {
  if (error instanceof SyncBackendError) {
    return NextResponse.json({ error: error.message, ...syncBackendStatus() }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected sync error";
  return NextResponse.json({ error: message, ...syncBackendStatus() }, { status: 500 });
}

/** Health/diagnostics (no secrets). */
export async function GET() {
  return NextResponse.json(syncBackendStatus());
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    let parsed: unknown = {};
    if (raw.trim()) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
    }

    const body = (parsed && typeof parsed === "object" ? parsed : {}) as { state?: unknown };
    const state = coercePersistedState(body.state);
    const stamped = {
      ...state,
      updatedAt: state.updatedAt || new Date().toISOString(),
    };

    for (let attempt = 0; attempt < MAX_CLAIM_ATTEMPTS; attempt += 1) {
      const code = generateUserCode();
      if (!isValidUserCode(code)) continue;
      if (await getSyncRecord(code)) continue;
      const record = await putSyncRecord(code, stamped);
      return NextResponse.json({
        code: record.code,
        updatedAt: record.updatedAt,
        backend: syncBackendKind(),
      });
    }

    return NextResponse.json({ error: "Could not allocate a progress code" }, { status: 500 });
  } catch (error) {
    return errorResponse(error);
  }
}
