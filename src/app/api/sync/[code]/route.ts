import { NextResponse } from "next/server";
import { coercePersistedState } from "@/infrastructure/storage/progress.repository";
import { getSyncRecord, putSyncRecord, syncBackendKind } from "@/infrastructure/sync/sync-store";
import { isValidUserCode, normalizeUserCode } from "@/infrastructure/sync/usercode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_500_000;

type RouteContext = {
  params: Promise<{ code: string }>;
};

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

    return NextResponse.json({
      code: record.code,
      updatedAt: record.updatedAt,
      state: coercePersistedState(record.state),
      backend: syncBackendKind(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected sync error";
    return NextResponse.json({ error: message }, { status: 500 });
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
    const state = coercePersistedState(body.state);
    const stamped = {
      ...state,
      updatedAt: state.updatedAt || new Date().toISOString(),
    };

    const record = await putSyncRecord(code, stamped);
    return NextResponse.json({
      code: record.code,
      updatedAt: record.updatedAt,
      backend: syncBackendKind(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected sync error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
