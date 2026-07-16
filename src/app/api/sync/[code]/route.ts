import { NextResponse } from "next/server";
import {
  coercePersistedState,
  mergePersistedStates,
  resolveActiveSlot,
} from "@/infrastructure/storage/progress.repository";
import {
  getSyncRecord,
  putSyncRecord,
  SyncBackendError,
  syncBackendKind,
  syncBackendStatus,
} from "@/infrastructure/sync/sync-store";
import { isValidUserCode, normalizeUserCode } from "@/infrastructure/sync/usercode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_500_000;

type RouteContext = {
  params: Promise<{ code: string }>;
};

function errorResponse(error: unknown) {
  if (error instanceof SyncBackendError) {
    return NextResponse.json({ error: error.message, ...syncBackendStatus() }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected sync error";
  return NextResponse.json({ error: message, ...syncBackendStatus() }, { status: 500 });
}

async function readCode(context: RouteContext): Promise<string | null> {
  const { code: raw } = await context.params;
  const code = normalizeUserCode(raw ?? "");
  return isValidUserCode(code) ? code : null;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const code = await readCode(context);
    if (!code) {
      return NextResponse.json({ error: "Invalid progress code" }, { status: 400 });
    }

    const record = await getSyncRecord(code);
    if (!record) {
      return NextResponse.json({ error: "Progress code not found" }, { status: 404 });
    }

    const state = coercePersistedState(record.state);
    // Stale tabs often leave activeSlot on Practice #1 after Practice #2 finished.
    state.app.activeSlot = resolveActiveSlot(state.app.slots);

    return NextResponse.json({
      code: record.code,
      updatedAt: record.updatedAt,
      state,
      backend: syncBackendKind(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const code = await readCode(context);
    if (!code) {
      return NextResponse.json({ error: "Invalid progress code" }, { status: 400 });
    }

    const existing = await getSyncRecord(code);
    if (!existing) {
      return NextResponse.json({ error: "Progress code not found" }, { status: 404 });
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const body = (parsed && typeof parsed === "object" ? parsed : {}) as { state?: unknown };
    const incoming = coercePersistedState(body.state);
    // Server-side merge: stale browser tabs must not downgrade richer progress.
    const merged = mergePersistedStates(existing.state, incoming);
    const stamped = {
      ...merged,
      updatedAt: new Date().toISOString(),
    };

    const record = await putSyncRecord(code, stamped);
    return NextResponse.json({
      code: record.code,
      updatedAt: record.updatedAt,
      backend: syncBackendKind(),
      merged: true,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
