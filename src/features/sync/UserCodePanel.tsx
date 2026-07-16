"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Copy, KeyRound, Link2, LoaderCircle } from "lucide-react";
import {
  adoptProgressCode,
  createProgressCode,
  type PersistedState,
} from "@/infrastructure/storage/progress.repository";
import { getStoredUserCode } from "@/infrastructure/sync/sync.client";
import { isValidUserCode, normalizeUserCode } from "@/infrastructure/sync/usercode";

type Props = {
  onProgressLoaded: (state: PersistedState) => void;
  /** Flush in-memory practice state (timer, drafts) before snapshotting a code. */
  flushProgress?: () => Promise<void>;
};

export function UserCodePanel({ onProgressLoaded, flushProgress }: Props) {
  const [code, setCode] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState<"create" | "adopt" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(getStoredUserCode());
  }, []);

  async function handleCreate() {
    setBusy("create");
    setError(null);
    setMessage(null);
    try {
      if (flushProgress) await flushProgress();
      const result = await createProgressCode();
      setCode(result.code);
      onProgressLoaded(result.state);
      setMessage("Progress code ready — includes in-progress practices. Use it on another device to continue.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create progress code");
    } finally {
      setBusy(null);
    }
  }

  async function handleAdopt(event: FormEvent) {
    event.preventDefault();
    const normalized = normalizeUserCode(input);
    if (!isValidUserCode(normalized)) {
      setError("Use a code like TF-7K2M-9HQR");
      return;
    }

    setBusy("adopt");
    setError(null);
    setMessage(null);
    try {
      const state = await adoptProgressCode(normalized);
      setCode(normalized);
      setInput("");
      onProgressLoaded(state);
      setMessage("Progress restored from this code.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load progress code");
    } finally {
      setBusy(null);
    }
  }

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Could not copy the code");
    }
  }

  return (
    <section className="exam-fade-up-delayed mt-5 rounded-2xl border border-[var(--exam-border)] bg-[rgba(23,31,54,0.58)] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgba(103,232,249,0.12)] text-[var(--exam-accent-2)]">
          <KeyRound size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--exam-text)]">Progress code</p>
          <p className="mt-1 text-xs leading-5 text-[var(--exam-muted)]">
            Works mid-practice: saves all Practice slots (timer, answers, code drafts, scores) plus the study checklist.
            Enter the same code on another device to continue exactly where you left off. On Vercel this needs Upstash/KV
            Redis connected to the project.
          </p>
        </div>
      </div>

      {code ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--exam-border)] bg-[rgba(11,16,32,0.55)] px-3 py-2.5">
            <Link2 size={14} className="shrink-0 text-[var(--exam-accent-2)]" />
            <code className="truncate font-mono text-sm tracking-[0.14em] text-[var(--exam-text)]">{code}</code>
          </div>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="exam-btn inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--exam-border)] px-3 py-2.5 text-xs font-medium text-[var(--exam-muted)] hover:border-[var(--exam-accent)] hover:bg-[var(--exam-accent-soft)] hover:text-[var(--exam-text)]"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy code"}
          </button>
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={busy !== null}
            className="exam-btn inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--exam-border)] px-3 py-2.5 text-xs font-medium text-[var(--exam-muted)] hover:border-[var(--exam-accent)] hover:bg-[var(--exam-accent-soft)] hover:text-[var(--exam-text)] disabled:opacity-50"
          >
            {busy === "create" ? <LoaderCircle size={14} className="animate-spin" /> : null}
            New code
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={busy !== null}
            className="exam-btn exam-glow-button inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 sm:w-auto"
          >
            {busy === "create" ? <LoaderCircle size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Create progress code
          </button>
        </div>
      )}

      <form onSubmit={(event) => void handleAdopt(event)} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="progress-code-input">
          Enter progress code
        </label>
        <input
          id="progress-code-input"
          value={input}
          onChange={(event) => setInput(event.target.value.toUpperCase())}
          placeholder="TF-XXXX-XXXX"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-xl border border-[var(--exam-border)] bg-[rgba(11,16,32,0.55)] px-3 py-2.5 font-mono text-sm tracking-[0.12em] text-[var(--exam-text)] outline-none placeholder:tracking-normal placeholder:text-[var(--exam-faint)] focus:border-[var(--exam-accent)]"
        />
        <button
          type="submit"
          disabled={busy !== null || !input.trim()}
          className="exam-btn inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--exam-border)] bg-[rgba(23,31,54,0.7)] px-4 py-2.5 text-sm font-medium text-[var(--exam-text)] hover:border-[var(--exam-accent)] hover:bg-[var(--exam-accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === "adopt" ? <LoaderCircle size={16} className="animate-spin" /> : null}
          Continue with code
        </button>
      </form>

      {message && <p className="mt-3 text-xs leading-5 text-[var(--exam-pass)]">{message}</p>}
      {error && <p className="mt-3 text-xs leading-5 text-[var(--exam-danger)]">{error}</p>}
    </section>
  );
}
