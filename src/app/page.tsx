"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  Code2,
  Lock,
  Monitor,
  PanelLeft,
  PanelLeftClose,
  BookOpen,
  Play,
  Plus,
  RotateCcw,
  Smartphone,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { bankStats, buildExam, collectUsedContent, examMeta, pickVariantSelection } from "@/content/bancolombia/exam";
import { StudyScreen } from "@/features/study/StudyScreen";
import { useQuestionAmbience } from "@/features/exam/useQuestionAmbience";
import { useStudyAmbience } from "@/features/study/useStudyAmbience";
import type { AppState, Exam, ExamAttempt, ExamProgress, ExamSession, SessionResult } from "@/domain/exam";
import { MAX_ATTEMPT_SLOTS } from "@/domain/exam";
import { evaluateMcq, evaluatePractical, weightedExamScore, type Evaluation } from "@/application/evaluation-engine";
import {
  attemptToProgress,
  emptyAppState,
  emptyProgress,
  loadAppState,
  progressToAttempt,
  saveAppState,
} from "@/infrastructure/storage/progress.repository";

type Screen = "home" | "roadmap" | "session" | "results" | "study";

/** Narrow viewport: theory mode (MCQ). Code practice remains desktop-only. */
function useIsMobile(breakpointPx = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpointPx]);
  return mobile;
}

function isMobileFriendlySession(session: ExamSession) {
  return session.kind === "mcq";
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatShortDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

const PHASES_PER_PRACTICE = 5;

function isPracticeComplete(attempt: ExamAttempt | null): boolean {
  return Boolean(attempt && attempt.results.length >= PHASES_PER_PRACTICE);
}

/** Next empty Practice index only if every previous Practice is finished. */
function nextStartablePracticeIndex(slots: (ExamAttempt | null)[]): number {
  const freeIndex = slots.findIndex((slot) => slot === null);
  if (freeIndex === -1) return -1;
  for (let i = 0; i < freeIndex; i += 1) {
    if (!isPracticeComplete(slots[i])) return -1;
  }
  return freeIndex;
}

function canStartPracticeAt(slots: (ExamAttempt | null)[], index: number): boolean {
  if (slots[index] !== null) return false;
  for (let i = 0; i < index; i += 1) {
    if (!isPracticeComplete(slots[i])) return false;
  }
  return true;
}

function firstIncompletePracticeIndex(slots: (ExamAttempt | null)[]): number {
  return slots.findIndex((slot) => slot !== null && !isPracticeComplete(slot));
}

/** Phase N unlocks only after phases 0..N-1 are submitted. */
function canOpenPhase(sessions: ExamSession[], results: SessionResult[], sessionId: string): boolean {
  const index = sessions.findIndex((session) => session.id === sessionId);
  if (index <= 0) return index === 0;
  for (let i = 0; i < index; i += 1) {
    if (!results.some((result) => result.sessionId === sessions[i].id)) return false;
  }
  return true;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [app, setApp] = useState<AppState>(emptyAppState);
  const [activeId, setActiveId] = useState("s1-mcq");
  const [examRunning, setExamRunning] = useState(false);
  const [sidebarPinnedOpen, setSidebarPinnedOpen] = useState(false);
  const isMobile = useIsMobile();

  const progress: ExamProgress = useMemo(() => {
    if (app.activeSlot === null) return emptyProgress();
    return attemptToProgress(app.slots[app.activeSlot]);
  }, [app]);

  const exam: Exam = useMemo(() => buildExam(progress.selection), [progress.selection]);

  const overall = useMemo(() => weightedExamScore(exam.sessions, progress.results), [exam.sessions, progress.results]);

  const activeSession = exam.sessions.find((s) => s.id === activeId) ?? exam.sessions[0];
  const freeSlots = app.slots.filter((slot) => slot === null).length;
  const hasActive = app.activeSlot !== null && Boolean(app.slots[app.activeSlot ?? -1]);
  const nextPracticeIndex = nextStartablePracticeIndex(app.slots);
  const canStartNewPractice = nextPracticeIndex !== -1;
  const blockedByIncomplete = firstIncompletePracticeIndex(app.slots);
  const sessionMode = screen === "session";
  const studyMode = screen === "study";
  const sidebarCollapsed = (sessionMode && !sidebarPinnedOpen) || studyMode;
  const studyAmbience = useStudyAmbience(studyMode);

  useEffect(() => {
    void loadAppState().then((stored) => {
      setApp(stored);
      if (stored.activeSlot !== null) {
        const current = stored.slots[stored.activeSlot];
        if (current && current.remainingSeconds > 0) setExamRunning(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!sessionMode) setSidebarPinnedOpen(false);
  }, [sessionMode]);

  useEffect(() => {
    if (!examRunning || app.activeSlot === null) return;

    const timer = setInterval(() => {
      setApp((prev) => {
        if (prev.activeSlot === null) return prev;
        const attempt = prev.slots[prev.activeSlot];
        if (!attempt || attempt.remainingSeconds <= 0) return prev;
        const slots = [...prev.slots] as (ExamAttempt | null)[];
        slots[prev.activeSlot] = {
          ...attempt,
          remainingSeconds: Math.max(0, attempt.remainingSeconds - 1),
        };
        const next = { ...prev, slots };
        void saveAppState(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examRunning, app.activeSlot]);

  function persist(next: AppState) {
    setApp(next);
    void saveAppState(next);
  }

  function writeActiveProgress(nextProgress: ExamProgress, score: number) {
    if (app.activeSlot === null) return;
    const existing = app.slots[app.activeSlot];
    const attempt = progressToAttempt(nextProgress, score, existing?.id);
    if (!attempt) return;
    const slots = [...app.slots] as (ExamAttempt | null)[];
    slots[app.activeSlot] = attempt;
    persist({ ...app, slots });
  }

  function saveDraftAnswers(answers: Record<string, string>) {
    setApp((prev) => {
      if (prev.activeSlot === null) return prev;
      const existing = prev.slots[prev.activeSlot];
      if (!existing) return prev;
      const currentProgress = attemptToProgress(existing);
      const nextProgress: ExamProgress = {
        ...currentProgress,
        answers: { ...currentProgress.answers, ...answers },
      };
      const examForSlot = buildExam(nextProgress.selection);
      const score = weightedExamScore(examForSlot.sessions, nextProgress.results);
      const attempt = progressToAttempt(nextProgress, score, existing.id);
      if (!attempt) return prev;
      const slots = [...prev.slots] as (ExamAttempt | null)[];
      slots[prev.activeSlot] = attempt;
      const next = { ...prev, slots };
      void saveAppState(next);
      return next;
    });
  }

  function saveDraftSubmission(sessionId: string, files: Record<string, string>) {
    setApp((prev) => {
      if (prev.activeSlot === null) return prev;
      const existing = prev.slots[prev.activeSlot];
      if (!existing) return prev;
      const currentProgress = attemptToProgress(existing);
      const nextProgress: ExamProgress = {
        ...currentProgress,
        submissions: { ...currentProgress.submissions, [sessionId]: files },
      };
      const examForSlot = buildExam(nextProgress.selection);
      const score = weightedExamScore(examForSlot.sessions, nextProgress.results);
      const attempt = progressToAttempt(nextProgress, score, existing.id);
      if (!attempt) return prev;
      const slots = [...prev.slots] as (ExamAttempt | null)[];
      slots[prev.activeSlot] = attempt;
      const next = { ...prev, slots };
      void saveAppState(next);
      return next;
    });
  }

  function startInSlot(slotIndex: number) {
    // Exclude the current slot (free or restarting) so its old selection is not counted.
    const others = app.slots.map((slot, index) => (index === slotIndex ? null : slot));
    const selection = pickVariantSelection(collectUsedContent(others));
    const attempt: ExamAttempt = {
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      remainingSeconds: examMeta.totalMinutes * 60,
      selection,
      results: [],
      answers: {},
      submissions: {},
      overallScore: 0,
    };
    const slots = [...app.slots] as (ExamAttempt | null)[];
    slots[slotIndex] = attempt;
    persist({ slots, activeSlot: slotIndex });
    setActiveId("s1-mcq");
    setExamRunning(true);
    setScreen("roadmap");
  }

  function startExam() {
    const freeIndex = nextStartablePracticeIndex(app.slots);
    if (freeIndex === -1) {
      const incomplete = firstIncompletePracticeIndex(app.slots);
      if (incomplete !== -1) {
        persist({ ...app, activeSlot: incomplete });
        setExamRunning((app.slots[incomplete]?.remainingSeconds ?? 0) > 0);
        setScreen("roadmap");
        return;
      }
      setScreen("home");
      return;
    }
    startInSlot(freeIndex);
  }

  function resetAllAttempts() {
    const ok = window.confirm(
      `Reset all Practice slots? This stops the current timer and clears all ${MAX_ATTEMPT_SLOTS} Practice runs on this device, so you can start over and practice ${MAX_ATTEMPT_SLOTS} more times with fresh mixes. Continue?`,
    );
    if (!ok) return;
    persist(emptyAppState());
    setExamRunning(false);
    setScreen("home");
  }

  function restartSlot(slotIndex: number) {
    if (!isPracticeComplete(app.slots[slotIndex])) {
      window.alert(`Finish Practice #${slotIndex + 1} before replacing it with a new mix.`);
      return;
    }
    const ok = window.confirm(
      `Practice #${slotIndex + 1} will be replaced with a new random mix from the bank. Continue?`,
    );
    if (!ok) return;
    startInSlot(slotIndex);
  }

  function restartActiveSlot() {
    if (app.activeSlot === null) return;
    restartSlot(app.activeSlot);
  }

  function selectSlot(slotIndex: number) {
    const attempt = app.slots[slotIndex];
    if (!attempt) {
      if (!canStartPracticeAt(app.slots, slotIndex)) {
        const incomplete = firstIncompletePracticeIndex(app.slots);
        const prior = incomplete !== -1 ? incomplete + 1 : slotIndex;
        window.alert(`Finish Practice #${prior} before starting Practice #${slotIndex + 1}.`);
        return;
      }
      startInSlot(slotIndex);
      return;
    }
    persist({ ...app, activeSlot: slotIndex });
    setExamRunning(attempt.remainingSeconds > 0);
    setScreen("roadmap");
  }

  function resumeExam() {
    if (app.activeSlot === null || !app.slots[app.activeSlot]) {
      startExam();
      return;
    }
    setExamRunning((app.slots[app.activeSlot]?.remainingSeconds ?? 0) > 0);
    setScreen("roadmap");
  }

  function openSession(sessionId: string) {
    if (!canOpenPhase(exam.sessions, progress.results, sessionId)) {
      const index = exam.sessions.findIndex((session) => session.id === sessionId);
      const prior = exam.sessions[Math.max(0, index - 1)];
      window.alert(
        prior
          ? `Finish ${prior.phase} before opening the next phase.`
          : "Finish the previous phases before opening this one.",
      );
      return;
    }
    setActiveId(sessionId);
    setScreen("session");
  }

  function saveSessionResult(
    result: SessionResult,
    answers?: Record<string, string>,
    submissions?: Record<string, string>,
  ) {
    const without = progress.results.filter((r) => r.sessionId !== result.sessionId);
    const nextProgress: ExamProgress = {
      ...progress,
      results: [...without, result],
      answers: answers ? { ...progress.answers, ...answers } : progress.answers,
      submissions: submissions ? { ...progress.submissions, [result.sessionId]: submissions } : progress.submissions,
    };
    const score = weightedExamScore(exam.sessions, nextProgress.results);
    writeActiveProgress(nextProgress, score);
  }

  return (
    <div className={`exam-shell flex min-h-screen ${studyMode ? "" : "text-[var(--exam-text)]"}`}>
      <AttemptsPanel
        collapsed={sidebarCollapsed}
        sessionMode={sessionMode}
        slots={app.slots}
        activeSlot={app.activeSlot}
        passThreshold={examMeta.passThreshold}
        freeSlots={freeSlots}
        nextPracticeIndex={nextPracticeIndex}
        onSelect={(index) => {
          selectSlot(index);
          setSidebarPinnedOpen(false);
        }}
        onResetAll={resetAllAttempts}
        onCollapse={() => setSidebarPinnedOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-[var(--exam-border)] bg-[rgba(11,16,32,0.72)] px-4 shadow-[0_18px_60px_rgba(2,6,23,0.22)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2">
            {sessionMode && (
              <button
                onClick={() => setSidebarPinnedOpen((v) => !v)}
                className="exam-btn rounded-xl border border-[var(--exam-border)] bg-[rgba(23,31,54,0.68)] p-1.5 text-[var(--exam-muted)] hover:border-[var(--exam-accent)] hover:bg-[var(--exam-accent-soft)] hover:text-[var(--exam-text)]"
                title={sidebarCollapsed ? "View runs" : "Hide runs"}
                aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
              >
                {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
              </button>
            )}
            <button
              onClick={() => setScreen("home")}
              className="group flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="grid size-7 place-items-center rounded-xl border border-[var(--exam-border)] bg-[var(--exam-accent-soft)] text-[var(--exam-accent-2)] shadow-[0_0_24px_rgba(139,124,246,0.26)] transition group-hover:border-[var(--exam-accent)]">
                <Code2 size={16} />
              </span>
              Trial
              <span className="text-[var(--exam-muted)]">Forge</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm sm:gap-4">
            {studyMode && (
              <button
                type="button"
                onClick={() => studyAmbience.toggleMuted()}
                className="exam-btn inline-flex items-center gap-1.5 rounded-full border border-[var(--exam-border)] bg-[rgba(23,31,54,0.78)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--exam-muted)] hover:border-[var(--exam-accent)] hover:text-[var(--exam-text)] sm:px-3"
                aria-label={studyAmbience.muted ? "Activar ambiente de estudio" : "Silenciar ambiente de estudio"}
                title="Ambiente de foco para estudiar"
              >
                {studyAmbience.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span className="max-[360px]:hidden">{studyAmbience.muted ? "Mute" : "Ambiente"}</span>
              </button>
            )}
            {progress.startedAt && (
              <span
                className={`flex items-center gap-1.5 font-mono text-xs tabular-nums sm:gap-2 sm:text-sm ${
                  progress.remainingSeconds < 600 ? "text-[var(--exam-danger)]" : "text-[var(--exam-muted)]"
                }`}
              >
                <Clock3 size={14} className="exam-glow-dot shrink-0" />
                {formatTime(progress.remainingSeconds)}
              </span>
            )}
            <button
              onClick={() => setScreen("study")}
              className={`hidden items-center gap-1.5 sm:inline-flex ${
                studyMode ? "text-white" : "text-[var(--exam-muted)] hover:text-[var(--exam-text)]"
              }`}
            >
              <BookOpen size={14} />
              Modo estudio
            </button>
            <button
              onClick={() => setScreen("roadmap")}
              className="hidden text-[var(--exam-muted)] hover:text-[var(--exam-text)] sm:inline"
            >
              Phases
            </button>
            <button
              onClick={() => setScreen("results")}
              className="hidden text-[var(--exam-muted)] hover:text-[var(--exam-text)] sm:inline"
            >
              Results
            </button>
          </div>
        </header>

        {!sessionMode && !studyMode && (
          <div className="exam-soft-in border-b border-[var(--exam-border)] bg-[rgba(11,16,32,0.34)] px-3 py-3 backdrop-blur-md lg:hidden">
            <AttemptsStrip
              slots={app.slots}
              activeSlot={app.activeSlot}
              passThreshold={examMeta.passThreshold}
              nextPracticeIndex={nextPracticeIndex}
              onSelect={selectSlot}
              onResetAll={resetAllAttempts}
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {screen === "home" && (
            <Home
              overall={overall}
              hasProgress={hasActive}
              freeSlots={freeSlots}
              canStartNewPractice={canStartNewPractice}
              blockedPracticeNumber={blockedByIncomplete === -1 ? null : blockedByIncomplete + 1}
              isMobile={isMobile}
              onStart={startExam}
              onResume={resumeExam}
              onStudy={() => setScreen("study")}
              onResetAll={resetAllAttempts}
            />
          )}
          {screen === "study" && <StudyScreen onBack={() => setScreen("home")} />}
          {screen === "roadmap" && (
            <Roadmap
              exam={exam}
              progress={progress}
              overall={overall}
              freeSlots={freeSlots}
              isMobile={isMobile}
              onOpen={openSession}
              onResults={() => setScreen("results")}
              onNewRun={startExam}
              onResetAll={resetAllAttempts}
              onRestartSlot={restartActiveSlot}
            />
          )}
          {screen === "session" && (
            <SessionView
              key={`${app.activeSlot}-${activeSession.variantId ?? activeSession.id}`}
              session={activeSession}
              progress={progress}
              isMobile={isMobile}
              onBack={() => setScreen("roadmap")}
              onComplete={saveSessionResult}
              onDraftAnswers={saveDraftAnswers}
              onDraftSubmission={saveDraftSubmission}
            />
          )}
          {screen === "results" && (
            <Results
              exam={exam}
              progress={progress}
              overall={overall}
              freeSlots={freeSlots}
              isMobile={isMobile}
              onRoadmap={() => setScreen("roadmap")}
              onNewRun={startExam}
              onResetAll={resetAllAttempts}
              onRestartSlot={restartActiveSlot}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AttemptsPanel({
  collapsed,
  sessionMode,
  slots,
  activeSlot,
  passThreshold,
  freeSlots,
  nextPracticeIndex,
  onSelect,
  onResetAll,
  onCollapse,
}: {
  collapsed: boolean;
  sessionMode: boolean;
  slots: (ExamAttempt | null)[];
  activeSlot: number | null;
  passThreshold: number;
  freeSlots: number;
  nextPracticeIndex: number;
  onSelect: (index: number) => void;
  onResetAll: () => void;
  onCollapse: () => void;
}) {
  const open = !collapsed;
  const hasAnyRun = slots.some(Boolean);

  return (
    <>
      {sessionMode && open && (
        <button aria-label="Close sidebar" className="fixed inset-0 z-30 bg-black/50" onClick={onCollapse} />
      )}

      <aside
        className={[
          "z-40 flex h-screen shrink-0 flex-col border-r border-[var(--exam-border)] bg-[rgba(11,16,32,0.74)] shadow-[24px_0_80px_rgba(2,6,23,0.28)] backdrop-blur-xl",
          "transition-[width,transform] duration-300 ease-out",
          // Desktop: real sidebar in the flow. Session -> width 0 (collapsed/hidden).
          "hidden lg:flex",
          open ? "lg:w-64" : "lg:w-0 lg:border-transparent lg:overflow-hidden",
          // Mobile (only when reopened in a session): drawer overlay.
          sessionMode && open ? "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:flex max-lg:w-64" : "",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div
          className={[
            "flex h-full w-64 flex-col",
            open ? "opacity-100" : "pointer-events-none opacity-0",
            "transition-opacity duration-200",
          ].join(" ")}
        >
          <div className="flex min-h-24 shrink-0 items-center justify-between border-b border-[var(--exam-border)] px-4 py-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--exam-muted)]">
                {MAX_ATTEMPT_SLOTS} practice runs
              </p>
              <p className="text-sm font-semibold text-[var(--exam-text)]">Full challenge loop</p>
              <p className="mt-1 max-w-48 text-[11px] leading-4 text-[var(--exam-muted)]">
                Each Practice is one full challenge. Use all {MAX_ATTEMPT_SLOTS} to cover the bank, then reset and start
                again.
              </p>
            </div>
            {sessionMode && (
              <button
                onClick={onCollapse}
                className="exam-btn rounded-xl p-1.5 text-[var(--exam-muted)] hover:bg-[var(--exam-surface)] hover:text-[var(--exam-text)]"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3">
            <p className="px-1 text-[11px] leading-4 text-[var(--exam-faint)]">
              {freeSlots > 0
                ? nextPracticeIndex === -1
                  ? "Finish the open Practice before unlocking the next slot"
                  : `${freeSlots} left · next unlock: Practice #${nextPracticeIndex + 1}`
                : "All Practice slots are full"}
            </p>
            <p className="px-1 text-[11px] leading-5 text-[var(--exam-muted)]">
              Finish one Practice before unlocking the next. Cover the bank with all {MAX_ATTEMPT_SLOTS}, then Reset all.
            </p>
            {slots.map((attempt, index) => (
              <AttemptCard
                key={attempt?.id ?? `empty-${index}`}
                attempt={attempt}
                index={index}
                active={activeSlot === index}
                passThreshold={passThreshold}
                locked={attempt === null && index !== nextPracticeIndex}
                onSelect={onSelect}
              />
            ))}
          </div>

          {hasAnyRun && (
            <div className="shrink-0 border-t border-[var(--exam-border)] p-3">
              <button
                type="button"
                onClick={onResetAll}
                className="exam-btn flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--exam-border)] px-3 py-2 text-[11px] text-[var(--exam-muted)] hover:border-[var(--exam-accent)] hover:bg-[var(--exam-accent-soft)] hover:text-[var(--exam-text)]"
              >
                <RotateCcw size={12} />
                Reset all · start over
              </button>
              {freeSlots === 0 && (
                <p className="mt-2 px-1 text-center text-[10px] leading-4 text-[var(--exam-faint)]">
                  Reset when you are ready for {MAX_ATTEMPT_SLOTS} more Practice runs.
                </p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function AttemptsStrip({
  slots,
  activeSlot,
  passThreshold,
  nextPracticeIndex,
  onSelect,
  onResetAll,
}: {
  slots: (ExamAttempt | null)[];
  activeSlot: number | null;
  passThreshold: number;
  nextPracticeIndex: number;
  onSelect: (index: number) => void;
  onResetAll: () => void;
}) {
  const hasAnyRun = slots.some(Boolean);
  return (
    <div className="exam-card exam-glass-card space-y-3 rounded-2xl p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--exam-muted)]">
            {MAX_ATTEMPT_SLOTS} practice runs
          </p>
          <p className="mt-1 text-[11px] leading-5 text-[var(--exam-faint)]">
            Finish each Practice before unlocking the next. Cover the bank with all {MAX_ATTEMPT_SLOTS}, then Reset all.
          </p>
        </div>
        {hasAnyRun && (
          <button
            type="button"
            onClick={onResetAll}
            className="exam-btn inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--exam-border)] bg-[rgba(23,31,54,0.72)] px-2.5 py-1 text-[11px] font-medium text-[var(--exam-muted)] hover:border-[var(--exam-accent)] hover:bg-[var(--exam-accent-soft)] hover:text-[var(--exam-text)]"
          >
            <RotateCcw size={11} />
            Reset all · start over
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {slots.map((attempt, index) => (
          <AttemptCard
            key={attempt?.id ?? `m-empty-${index}`}
            attempt={attempt}
            index={index}
            active={activeSlot === index}
            passThreshold={passThreshold}
            locked={attempt === null && index !== nextPracticeIndex}
            onSelect={onSelect}
            compact
          />
        ))}
      </div>
    </div>
  );
}

function AttemptCard({
  attempt,
  index,
  active,
  passThreshold,
  onSelect,
  locked = false,
  compact = false,
}: {
  attempt: ExamAttempt | null;
  index: number;
  active: boolean;
  passThreshold: number;
  onSelect: (index: number) => void;
  locked?: boolean;
  compact?: boolean;
}) {
  const practiceLabel = `Practice #${index + 1}`;

  if (!attempt) {
    return (
      <button
        type="button"
        onClick={() => onSelect(index)}
        disabled={locked}
        title={locked ? `Finish previous Practice before unlocking ${practiceLabel}` : `Start ${practiceLabel}`}
        className={`exam-card group flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-center ${
          compact ? "min-h-[72px] min-w-[96px] px-2 py-2" : "min-h-[88px] px-3 py-4"
        } ${
          locked
            ? "cursor-not-allowed border-[var(--exam-border-soft)] bg-[rgba(17,24,43,0.45)] opacity-55"
            : "border-[var(--exam-border)] bg-[rgba(23,31,54,0.58)] hover:border-[var(--exam-accent)] hover:bg-[var(--exam-accent-soft)]"
        }`}
      >
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--exam-faint)] group-hover:text-[var(--exam-muted)]">
          {practiceLabel}
        </span>
        {locked ? (
          <Lock size={compact ? 14 : 16} className="text-[var(--exam-faint)]" />
        ) : (
          <Plus size={compact ? 14 : 16} className="text-[var(--exam-faint)] group-hover:text-[var(--exam-accent)]" />
        )}
        <span className="text-xs font-medium text-[var(--exam-muted)] group-hover:text-[var(--exam-text)]">
          {locked ? "Locked" : "Available"}
        </span>
      </button>
    );
  }

  const done = isPracticeComplete(attempt);
  const passed = done && attempt.overallScore >= passThreshold;
  const label = done ? (passed ? "Passed" : "Below threshold") : "In progress";
  const statusClass = done
    ? passed
      ? "text-[var(--exam-pass)]"
      : "text-[var(--exam-danger)]"
    : "text-[var(--exam-accent-2)]";
  const scoreClass = done
    ? passed
      ? "text-[var(--exam-pass)]"
      : "text-[var(--exam-danger)]"
    : "text-[var(--exam-muted)]";
  const stateClass = active
    ? "border-[var(--exam-accent)] bg-[var(--exam-accent-soft)] shadow-[0_0_0_1px_rgba(139,124,246,0.2),0_18px_50px_rgba(139,124,246,0.18)]"
    : done
      ? passed
        ? "border-[rgba(134,239,172,0.24)] bg-[var(--exam-pass-soft)] hover:border-[rgba(134,239,172,0.42)]"
        : "border-[rgba(253,164,175,0.24)] bg-[var(--exam-danger-soft)] hover:border-[rgba(253,164,175,0.42)]"
      : "border-[var(--exam-border-soft)] bg-[rgba(23,31,54,0.64)] hover:border-[var(--exam-border)] hover:bg-[var(--exam-surface-hover)]";

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={`exam-card rounded-2xl border text-left ${
        compact ? "min-h-[72px] min-w-[118px] px-2.5 py-2" : "min-h-[88px] px-3 py-3"
      } ${stateClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--exam-muted)]">
          {practiceLabel}
        </span>
        <span className={`shrink-0 text-[10px] ${statusClass}`}>{label}</span>
      </div>
      <p className={`mt-1.5 font-semibold tracking-tight ${compact ? "text-xl" : "text-2xl"} ${scoreClass}`}>
        {attempt.overallScore}%
      </p>
      {!compact && (
        <p className="mt-1 text-[11px] text-[var(--exam-faint)]">
          {attempt.results.length}/{PHASES_PER_PRACTICE} phases · {formatShortDate(attempt.startedAt)}
        </p>
      )}
    </button>
  );
}

function Home({
  overall,
  hasProgress,
  freeSlots,
  canStartNewPractice,
  blockedPracticeNumber,
  isMobile,
  onStart,
  onResume,
  onStudy,
  onResetAll,
}: {
  overall: number;
  hasProgress: boolean;
  freeSlots: number;
  canStartNewPractice: boolean;
  blockedPracticeNumber: number | null;
  isMobile: boolean;
  onStart: () => void;
  onResume: () => void;
  onStudy: () => void;
  onResetAll: () => void;
}) {
  return (
    <section className="px-4 pb-24 pt-6 sm:px-8 sm:pt-12 lg:px-10">
      {isMobile && (
        <div className="exam-soft-in mb-6 flex gap-3 rounded-2xl border border-[rgba(103,232,249,0.24)] bg-[linear-gradient(135deg,rgba(103,232,249,0.12),rgba(139,124,246,0.14))] p-4 shadow-[0_18px_50px_rgba(103,232,249,0.08)]">
          <Smartphone size={18} className="mt-0.5 shrink-0 text-[var(--exam-accent-2)]" />
          <div>
            <p className="text-sm font-medium text-[var(--exam-text)]">Mobile mode · theory only</p>
            <p className="mt-1 text-xs leading-5 text-[var(--exam-muted)]">
              On a phone, you can complete the multiple-choice sessions. Code practice (JS, SQL, CSS, Angular) unlocks
              on desktop or a wide tablet.
            </p>
          </div>
        </div>
      )}

      <div className="exam-fade-up exam-glass-card relative overflow-hidden rounded-[2rem] p-5 sm:p-8 lg:p-10">
        <div className="absolute inset-x-8 top-10 h-40 rounded-full bg-[rgba(139,124,246,0.18)] blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--exam-border)] bg-[rgba(139,124,246,0.12)] px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-[var(--exam-accent-2)]">
              <span className="exam-glow-dot size-1.5 rounded-full bg-[var(--exam-accent-2)]" />
              TrialForge · Client challenge
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[var(--exam-text)] sm:text-6xl lg:text-7xl">
              Frontend Technical Challenge
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--exam-muted)] sm:text-base">
              Practice the full challenge in calm, focused runs.{" "}
              <strong className="font-semibold text-[var(--exam-text)]">Practice #1</strong> through{" "}
              <strong className="font-semibold text-[var(--exam-text)]">Practice #{MAX_ATTEMPT_SLOTS}</strong> unlock in
              order — finish one completely before starting the next. The full set covers the question bank. Then use
              Reset all · start over and repeat the loop.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={onStart}
                disabled={freeSlots === 0 && !hasProgress}
                className="exam-btn exam-glow-button flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                <Play size={16} fill="currentColor" />
                {freeSlots === 0
                  ? "No Practice slots"
                  : !canStartNewPractice && blockedPracticeNumber
                    ? `Finish Practice #${blockedPracticeNumber} first`
                    : isMobile
                      ? "New Practice (theory)"
                      : "New Practice"}
              </button>
              {hasProgress && (
                <button
                  onClick={onResume}
                  className="exam-btn w-full rounded-2xl border border-[var(--exam-border)] bg-[rgba(23,31,54,0.7)] px-5 py-3.5 text-sm font-medium text-[var(--exam-text)] hover:border-[var(--exam-accent)] hover:bg-[var(--exam-accent-soft)] sm:w-auto"
                >
                  Continue ({overall}%)
                </button>
              )}
              {freeSlots < MAX_ATTEMPT_SLOTS && (
                <button
                  onClick={onResetAll}
                  className="exam-btn flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--exam-border)] bg-[rgba(23,31,54,0.6)] px-5 py-3.5 text-sm font-medium text-[var(--exam-muted)] hover:border-[var(--exam-magenta)] hover:bg-[var(--exam-magenta-soft)] hover:text-[var(--exam-text)] sm:w-auto"
                >
                  <RotateCcw size={16} />
                  Reset all · start over
                </button>
              )}
            </div>
            {!canStartNewPractice && blockedPracticeNumber && freeSlots > 0 && (
              <p className="mt-3 text-xs leading-5 text-[var(--exam-muted)]">
                Complete all 5 phases of Practice #{blockedPracticeNumber} to unlock the next Practice slot.
              </p>
            )}
          </div>

          <div className="exam-float relative">
            <div className="absolute inset-6 rounded-[2rem] bg-[linear-gradient(135deg,rgba(139,124,246,0.2),rgba(103,232,249,0.13),rgba(232,121,249,0.16))] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--exam-border)] bg-[rgba(11,16,32,0.44)] shadow-[0_28px_90px_rgba(2,6,23,0.34)]">
              <img
                src="/illustrations/hero-mountain.png"
                alt="Cosmic mountain path illustration"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="exam-fade-up-delayed mt-5 grid gap-3 lg:grid-cols-[1fr_0.7fr]">
        <button
          type="button"
          onClick={onStudy}
          className="exam-card flex w-full items-center gap-3 rounded-2xl border border-[rgba(253,230,138,0.22)] bg-[linear-gradient(135deg,rgba(253,230,138,0.12),rgba(139,124,246,0.08))] p-4 text-left hover:border-[rgba(253,230,138,0.42)]"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgba(253,230,138,0.14)] text-[var(--exam-warn)]">
            <BookOpen size={18} />
          </span>
          <span>
            <span className="block text-sm font-medium text-[var(--exam-text)]">Estudiar el challenge</span>
            <span className="mt-0.5 block text-xs leading-5 text-[var(--exam-muted)]">
              Modo estudio · pizarra, analogías y roadmap
            </span>
          </span>
        </button>

        <div className="exam-card rounded-2xl border border-[var(--exam-border)] bg-[rgba(23,31,54,0.58)] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--exam-accent-2)]">Practice loop</p>
          <p className="mt-2 text-sm leading-6 text-[var(--exam-muted)]">
            One Practice = one full challenge. Finish it before the next unlocks. Use up to {MAX_ATTEMPT_SLOTS}, then
            Reset all and start over.
          </p>
        </div>
      </div>

      <div className="exam-fade-up-delayed mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ["180 min", "Time"],
          ["70%", "Pass"],
          [`${freeSlots}/${MAX_ATTEMPT_SLOTS}`, "Free practices"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="exam-card rounded-2xl border border-[var(--exam-border)] bg-[rgba(23,31,54,0.62)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-5"
          >
            <strong className="block text-xl tracking-tight text-[var(--exam-text)] sm:text-2xl">{value}</strong>
            <span className="mt-1 block text-[11px] text-[var(--exam-muted)] sm:text-xs">{label}</span>
          </div>
        ))}
      </div>

      <div className="exam-fade-up-delayed mt-6 hidden gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-6">
        {[
          [`${bankStats.mcqFundamentos}`, "MCQ fundamentals"],
          [`${bankStats.mcqWeb}`, "Web+SQL+Eng MCQ"],
          [`${bankStats.mcqEngineering}`, "Engineering"],
          [`${bankStats.logic}`, "JS/SQL practice"],
          [`${bankStats.css}`, "CSS variants"],
          [`${bankStats.angular}`, "Angular variants"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="exam-card rounded-2xl border border-[var(--exam-border-soft)] bg-[rgba(17,24,43,0.62)] px-3 py-3 text-center"
          >
            <strong className="block text-lg text-[var(--exam-text)]">{value}</strong>
            <span className="mt-1 block text-[11px] leading-4 text-[var(--exam-muted)]">{label}</span>
          </div>
        ))}
      </div>

      {!isMobile && (
        <ul className="mt-8 grid gap-3 border-t border-[var(--exam-border)] pt-8 md:grid-cols-2">
          {examMeta.rules.map((rule) => (
            <li key={rule} className="flex gap-3 text-sm leading-6 text-[var(--exam-muted)]">
              <CheckCircle2 size={16} className="mt-1 shrink-0 text-[var(--exam-accent-2)]" />
              {rule}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Roadmap({
  exam,
  progress,
  overall,
  freeSlots,
  isMobile,
  onOpen,
  onResults,
  onNewRun,
  onResetAll,
  onRestartSlot,
}: {
  exam: Exam;
  progress: ExamProgress;
  overall: number;
  freeSlots: number;
  isMobile: boolean;
  onOpen: (id: string) => void;
  onResults: () => void;
  onNewRun: () => void;
  onResetAll: () => void;
  onRestartSlot: () => void;
}) {
  const byId = new Map(progress.results.map((r) => [r.sessionId, r]));
  const theorySessions = exam.sessions.filter(isMobileFriendlySession);
  const theoryDone = theorySessions.filter((s) => byId.has(s.id)).length;

  if (!progress.selection) {
    return (
      <section className="px-4 py-16 text-sm text-[var(--exam-muted)] sm:px-10">
        {isMobile
          ? "Choose an available Practice slot above to start a run."
          : "Select an available Practice slot in the side panel to start a run."}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="exam-fade-up exam-card exam-glass-card overflow-hidden rounded-[1.75rem]">
        <div className="relative">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,32,0.15)_0%,rgba(11,16,32,0.55)_55%,rgba(11,16,32,0.92)_100%)]" />
          <img
            src="/illustrations/roadmap-path.png"
            alt="Mountain path toward the challenge peak"
            className="h-40 w-full object-cover sm:h-52"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-[var(--exam-muted)]">Roadmap for this Practice run</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--exam-text)] sm:text-3xl">
                  The 5 phases
                </h2>
                <p className="mt-2 max-w-xl text-sm text-[var(--exam-muted)]">
                  {isMobile
                    ? `On mobile: ${theoryDone}/${theorySessions.length} theory sessions. Code waits for PC. Phases unlock in order.`
                    : "Phases unlock in order — finish one before opening the next. An available Practice slot unlocks only after this run is complete."}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--exam-border)] bg-[rgba(11,16,32,0.72)] px-4 py-3 text-left backdrop-blur-md sm:text-right">
                <p className="text-xs text-[var(--exam-muted)]">Weighted score</p>
                <p
                  className={`text-2xl font-semibold ${
                    overall >= exam.passThreshold ? "text-[var(--exam-pass)]" : "text-[var(--exam-text)]"
                  }`}
                >
                  {overall}%
                  <span className="ml-2 text-sm font-normal text-[var(--exam-muted)]">/ {exam.passThreshold}%</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ol className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
        {exam.sessions.map((session, sessionIndex) => {
          const result = byId.get(session.id);
          const done = Boolean(result);
          const mobileOk = isMobileFriendlySession(session);
          const lockedOnMobile = isMobile && !mobileOk;
          const lockedByOrder = !done && !canOpenPhase(exam.sessions, progress.results, session.id);
          const locked = lockedOnMobile || lockedByOrder;

          return (
            <li key={session.id}>
              <button
                type="button"
                onClick={() => onOpen(session.id)}
                disabled={lockedByOrder}
                className={`exam-card flex w-full items-start gap-3 rounded-2xl border p-4 text-left sm:gap-4 sm:p-5 ${
                  locked
                    ? "cursor-not-allowed border-[var(--exam-border-soft)] bg-[rgba(17,24,43,0.58)] opacity-80"
                    : "border-[var(--exam-border-soft)] bg-[rgba(23,31,54,0.7)] hover:border-[var(--exam-border)] hover:bg-[var(--exam-surface-hover)]"
                }`}
              >
                <span className="mt-0.5 text-[var(--exam-muted)]">
                  {done ? (
                    <CheckCircle2 size={20} className="text-[var(--exam-pass)]" />
                  ) : lockedOnMobile || lockedByOrder ? (
                    <Lock size={20} className="text-[var(--exam-faint)]" />
                  ) : (
                    <Circle size={20} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-[var(--exam-muted)]">{session.phase}</span>
                    <span className="rounded bg-[var(--exam-bg-soft)] px-2 py-0.5 text-xs text-[var(--exam-muted)]">
                      {session.weight}%
                    </span>
                    {lockedByOrder && !lockedOnMobile && (
                      <span className="rounded bg-[rgba(139,124,246,0.12)] px-2 py-0.5 text-[10px] text-[var(--exam-accent-2)]">
                        Finish phase {sessionIndex} first
                      </span>
                    )}
                    {mobileOk ? (
                      <span className="flex items-center gap-1 rounded bg-[var(--exam-accent-soft)] px-2 py-0.5 text-xs text-[var(--exam-accent)] md:hidden">
                        <Smartphone size={11} /> mobile
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-[var(--exam-bg-soft)] px-2 py-0.5 text-xs text-[var(--exam-faint)] md:hidden">
                        <Monitor size={11} /> PC
                      </span>
                    )}
                    {session.kind !== "mcq" && (
                      <span className="hidden items-center gap-1 rounded bg-[var(--exam-bg-soft)] px-2 py-0.5 text-xs text-[var(--exam-muted)] sm:flex">
                        <Lock size={11} /> locked tests
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium sm:text-base">{session.title}</h3>
                  <p className="mt-1 text-xs text-[var(--exam-muted)] sm:text-sm">{session.subtitle}</p>
                  {lockedOnMobile && (
                    <p className="mt-2 text-xs text-[var(--exam-faint)]">Available on desktop / wide tablet.</p>
                  )}
                  {lockedByOrder && !lockedOnMobile && (
                    <p className="mt-2 text-xs text-[var(--exam-faint)]">
                      Complete the previous phase before opening this one.
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {result ? (
                    <strong className={result.score >= 70 ? "text-[var(--exam-pass)]" : "text-[var(--exam-danger)]"}>
                      {result.score}%
                    </strong>
                  ) : locked ? (
                    <Lock size={14} className="ml-auto text-[var(--exam-faint)]" />
                  ) : (
                    <span className="text-sm text-[var(--exam-faint)]">Open →</span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <RunNextSteps
        className="exam-card exam-glass-card mt-10 rounded-2xl p-5"
        allPhasesDone={progress.results.length === exam.sessions.length}
        freeSlots={freeSlots}
        onNewRun={onNewRun}
        onResetAll={onResetAll}
        onRestartSlot={onRestartSlot}
      />

      <button
        onClick={onResults}
        className="mt-8 text-sm text-[var(--exam-muted)] underline underline-offset-4 hover:text-[var(--exam-text)]"
      >
        View final results
      </button>
    </section>
  );
}

function SessionView({
  session,
  progress,
  isMobile,
  onBack,
  onComplete,
  onDraftAnswers,
  onDraftSubmission,
}: {
  session: ExamSession;
  progress: ExamProgress;
  isMobile: boolean;
  onBack: () => void;
  onComplete: (result: SessionResult, answers?: Record<string, string>, submissions?: Record<string, string>) => void;
  onDraftAnswers: (answers: Record<string, string>) => void;
  onDraftSubmission: (sessionId: string, files: Record<string, string>) => void;
}) {
  if (session.kind === "mcq") {
    return (
      <McqSessionView
        session={session}
        progress={progress}
        isMobile={isMobile}
        onBack={onBack}
        onComplete={onComplete}
        onDraftAnswers={onDraftAnswers}
      />
    );
  }
  if (isMobile) {
    return <DesktopRequiredGate session={session} onBack={onBack} />;
  }
  return (
    <PracticalSessionView
      session={session}
      progress={progress}
      onBack={onBack}
      onComplete={onComplete}
      onDraftSubmission={onDraftSubmission}
    />
  );
}

function DesktopRequiredGate({ session, onBack }: { session: ExamSession; onBack: () => void }) {
  return (
    <section className="mx-auto flex max-w-lg flex-col px-4 py-12">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
        <ArrowLeft size={15} /> Back to phases
      </button>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-zinc-800 text-zinc-300">
          <Monitor size={22} />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">{session.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{session.subtitle}</p>
        <p className="mt-5 text-sm leading-6 text-zinc-400">
          This phase includes a code editor and hidden tests. On mobile it is not comfortable or faithful to the real
          environment: open it from a computer or a wide landscape tablet.
        </p>
        <p className="mt-4 text-xs text-zinc-600">
          Meanwhile, you can complete the multiple-choice sessions from this device.
        </p>
        <button
          onClick={onBack}
          className="mt-8 w-full rounded-lg bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-950"
        >
          Go to theory phases
        </button>
      </div>
    </section>
  );
}

function McqSessionView({
  session,
  progress,
  isMobile,
  onBack,
  onComplete,
  onDraftAnswers,
}: {
  session: Extract<ExamSession, { kind: "mcq" }>;
  progress: ExamProgress;
  isMobile: boolean;
  onBack: () => void;
  onComplete: (result: SessionResult, answers?: Record<string, string>) => void;
  onDraftAnswers: (answers: Record<string, string>) => void;
}) {
  const prefix = `${session.id}:`;
  const initial = Object.fromEntries(
    Object.entries(progress.answers)
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, value]) => [key.slice(prefix.length), value]),
  );
  const [answers, setAnswers] = useState<Record<string, string>>(initial);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Evaluation | null>(
    progress.results.find((r) => r.sessionId === session.id) ?? null,
  );
  const ambience = useQuestionAmbience(!result);

  const total = session.questions.length;
  const answered = session.questions.filter((q) => answers[q.id]).length;
  const safeStep = Math.min(Math.max(step, 0), Math.max(total - 1, 0));
  const question = session.questions[safeStep];
  const isLast = safeStep >= total - 1;
  const currentAnswered = Boolean(question && answers[question.id]);
  const progressPct = total > 0 ? ((safeStep + 1) / total) * 100 : 0;

  function persistAnswers(next: Record<string, string>) {
    const namespaced = Object.fromEntries(Object.entries(next).map(([key, value]) => [`${prefix}${key}`, value]));
    onDraftAnswers(namespaced);
  }

  function submit() {
    const evaluation = evaluateMcq(session.id, session.questions, answers);
    const stamped: SessionResult = { ...evaluation, completedAt: new Date().toISOString() };
    setResult(evaluation);
    const namespaced = Object.fromEntries(Object.entries(answers).map(([k, v]) => [`${prefix}${k}`, v]));
    onComplete(stamped, namespaced);
  }

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: optionId };
      persistAnswers(next);
      return next;
    });
    if (!result && !isLast) {
      window.setTimeout(() => setStep((s) => Math.min(s + 1, total - 1)), 180);
    }
  }

  return (
    <section
      className={`exam-session-scene exam-fade-up mx-auto flex max-w-3xl flex-col px-4 pt-6 sm:px-5 sm:pt-8 ${
        isMobile ? "min-h-[calc(100vh-7.5rem)] pb-28" : "pb-10"
      }`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[var(--exam-muted)] hover:text-[var(--exam-text)]"
        >
          <ArrowLeft size={15} /> {isMobile ? "Phases" : "Back to phases"}
        </button>
        <button
          type="button"
          onClick={() => ambience.toggleMuted()}
          className="exam-btn inline-flex items-center gap-1.5 rounded-full border border-[var(--exam-border)] bg-[rgba(23,31,54,0.72)] px-3 py-1.5 text-[11px] font-medium text-[var(--exam-muted)] hover:border-[var(--exam-accent)] hover:text-[var(--exam-text)] sm:text-xs"
          aria-label={ambience.muted ? "Unmute question music" : "Mute question music"}
          title="Ambient music"
        >
          {ambience.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span className="hidden sm:inline">{ambience.muted ? "Music off" : "Ambience"}</span>
          <span className="sm:hidden">{ambience.muted ? "Off" : "Music"}</span>
        </button>
      </div>

      <header className="text-left">
        <p className="text-xs uppercase tracking-wider text-[var(--exam-faint)]">{session.phase}</p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight text-[var(--exam-text)] sm:mt-2 sm:text-2xl">
          {session.title}
        </h1>
        <p className="mt-2 hidden text-sm text-[var(--exam-muted)] sm:block">{session.subtitle}</p>
      </header>

      <div className="mt-5 sm:mt-6">
        <div className="flex items-center justify-between text-xs text-[var(--exam-muted)] sm:text-sm">
          <span className="font-medium text-[var(--exam-text)]">
            Question {safeStep + 1} of {total}
          </span>
          <span>
            {answered}/{total} answered
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(23,31,54,0.7)]"
          role="progressbar"
          aria-valuenow={safeStep + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Question ${safeStep + 1} of ${total}`}
        >
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--exam-accent),var(--exam-accent-2))] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {question ? (
        <article
          key={question.id}
          className="exam-glass-card mt-6 flex flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-[var(--exam-border)] shadow-[0_24px_70px_rgba(2,6,23,0.28)] sm:mt-8"
        >
          <div className="border-b border-[var(--exam-border-soft)] px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--exam-faint)]">
              Step {safeStep + 1}
            </p>
            <h2 className="mt-2 text-pretty text-base font-semibold leading-7 text-[var(--exam-text)] sm:text-lg sm:leading-8">
              {question.prompt}
            </h2>
          </div>

          <fieldset className="m-0 flex flex-1 flex-col border-0 p-0">
            <legend className="sr-only">{question.prompt}</legend>
            <div className="space-y-2.5 p-4 sm:space-y-3 sm:p-6">
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectOption(question.id, option.id)}
                    disabled={Boolean(result)}
                    className={`exam-btn flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm transition disabled:cursor-default ${
                      selected
                        ? "border-[var(--exam-accent)] bg-[var(--exam-accent-soft)] shadow-[0_0_24px_rgba(139,124,246,0.18)]"
                        : "border-[var(--exam-border-soft)] bg-[rgba(17,24,43,0.55)] hover:border-[var(--exam-border)]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                        selected
                          ? "border-[var(--exam-accent-2)] bg-[var(--exam-accent-2)] text-[#070b16]"
                          : "border-[var(--exam-faint)] text-[var(--exam-muted)]"
                      }`}
                    >
                      {option.id.toUpperCase()}
                    </span>
                    <span className="leading-6 text-[var(--exam-text)]">{option.label}</span>
                  </button>
                );
              })}
            </div>
            {result ? (
              <p className="border-t border-[var(--exam-border-soft)] px-5 py-4 text-xs leading-5 text-[var(--exam-muted)] sm:px-6">
                {question.explanation}
              </p>
            ) : null}
          </fieldset>
        </article>
      ) : null}

      <div
        className={
          isMobile
            ? "fixed inset-x-0 bottom-0 z-20 border-t border-[var(--exam-border)] bg-[rgba(11,16,32,0.82)] px-4 py-3 backdrop-blur-xl"
            : "mt-8"
        }
      >
        <div className={`flex gap-2 ${isMobile ? "mx-auto max-w-3xl" : "flex-wrap items-center"}`}>
          <button
            type="button"
            disabled={safeStep === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="exam-btn rounded-xl border border-[var(--exam-border)] px-4 py-3 text-sm text-[var(--exam-muted)] disabled:opacity-30"
          >
            Previous
          </button>
          {!isLast ? (
            <button
              type="button"
              disabled={!result && !currentAnswered}
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              className="exam-btn exam-glow-button flex-1 rounded-xl py-3 text-sm font-semibold disabled:opacity-40 sm:flex-none sm:min-w-[9rem]"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={(answered < total && !result) || Boolean(result)}
              className="exam-btn exam-glow-button flex-1 rounded-xl py-3 text-sm font-semibold disabled:opacity-40 sm:flex-none sm:min-w-[11rem]"
            >
              {result ? `Submitted · ${result.score}%` : "Submit session"}
            </button>
          )}
          {result && !isMobile ? (
            <span className="text-sm text-[var(--exam-muted)]">
              Result: <strong className="text-[var(--exam-text)]">{result.score}%</strong> ({result.passed}/
              {result.total})
            </span>
          ) : null}
        </div>
        {result && isMobile ? (
          <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-[var(--exam-muted)]">
            Result: {result.score}% ({result.passed}/{result.total}) · use Previous/Next to review
          </p>
        ) : null}
      </div>
    </section>
  );
}

function PracticalSessionView({
  session,
  progress,
  onBack,
  onComplete,
  onDraftSubmission,
}: {
  session: Extract<ExamSession, { kind: "javascript" | "css" | "angular" | "sql" }>;
  progress: ExamProgress;
  onBack: () => void;
  onComplete: (result: SessionResult, _answers?: Record<string, string>, submissions?: Record<string, string>) => void;
  onDraftSubmission: (sessionId: string, files: Record<string, string>) => void;
}) {
  const saved = progress.submissions[session.id];
  const [files, setFiles] = useState<Record<string, string>>(() => {
    const base = Object.fromEntries(session.starterFiles.map((f) => [f.name, f.code]));
    return { ...base, ...saved };
  });
  const [activeFile, setActiveFile] = useState(session.starterFiles[session.starterFiles.length - 1]?.name ?? "");
  const [result, setResult] = useState<Evaluation | null>(
    progress.results.find((r) => r.sessionId === session.id) ?? null,
  );
  const skipDraftSave = useRef(true);

  const fileLocked =
    (session.kind === "css" && activeFile.endsWith(".html")) || (session.kind === "sql" && activeFile === "schema.sql");

  useEffect(() => {
    if (skipDraftSave.current) {
      skipDraftSave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      onDraftSubmission(session.id, files);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [files, onDraftSubmission, session.id]);

  useEffect(() => {
    const flush = () => onDraftSubmission(session.id, files);
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [files, onDraftSubmission, session.id]);

  function submit() {
    const evaluation = evaluatePractical(session, files);
    const stamped: SessionResult = { ...evaluation, completedAt: new Date().toISOString() };
    setResult(evaluation);
    onComplete(stamped, undefined, files);
  }

  return (
    <section className="grid min-h-[calc(100vh-56px)] lg:grid-cols-[360px_1fr]">
      <aside className="border-b border-zinc-800 p-5 lg:border-b-0 lg:border-r">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
          <ArrowLeft size={15} /> Back to phases
        </button>
        <p className="text-xs uppercase tracking-wider text-zinc-500">{session.phase}</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">{session.title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{session.story}</p>

        <h2 className="mt-6 text-sm font-medium">Requirements</h2>
        <ul className="mt-2 space-y-2 text-sm text-zinc-400">
          {session.requirements.map((item) => (
            <li key={item}>— {item}</li>
          ))}
        </ul>

        <h2 className="mt-6 text-sm font-medium">Restrictions</h2>
        <ul className="mt-2 space-y-2 text-sm text-zinc-400">
          {session.restrictions.map((item) => (
            <li key={item} className="flex gap-2">
              <Lock size={13} className="mt-1 shrink-0 text-zinc-600" />
              {item}
            </li>
          ))}
        </ul>

        <details className="mt-6 rounded-lg border border-zinc-800 p-3">
          <summary className="cursor-pointer text-sm">Hints (practice mode)</summary>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {session.hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </details>
      </aside>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {session.starterFiles.map((file) => (
              <button
                key={file.name}
                onClick={() => setActiveFile(file.name)}
                className={`rounded px-2.5 py-1 text-xs ${
                  activeFile === file.name ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {file.name}
                {((session.kind === "css" && file.name.endsWith(".html")) ||
                  (session.kind === "sql" && file.name === "schema.sql")) && (
                  <Lock size={10} className="ml-1 inline opacity-60" />
                )}
              </button>
            ))}
            <span className="ml-2 flex items-center gap-1 rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-600">
              <Lock size={11} /> *.spec.ts (locked)
            </span>
          </div>
          <button onClick={submit} className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950">
            Run hidden tests
          </button>
        </div>

        <textarea
          spellCheck={false}
          value={files[activeFile] ?? ""}
          onChange={(event) => setFiles((prev) => ({ ...prev, [activeFile]: event.target.value }))}
          readOnly={fileLocked}
          className="min-h-[420px] flex-1 resize-none bg-[#0d0d0f] p-5 font-mono text-sm leading-6 text-zinc-200 outline-none"
        />

        {result && (
          <div className="border-t border-zinc-800 bg-zinc-950 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Trophy size={18} className="text-zinc-300" />
              <strong>{result.score}/100</strong>
              <span className="text-sm text-zinc-500">
                {result.passed}/{result.total} hidden tests
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.feedback.map((item) => (
                <span
                  key={item}
                  className={`rounded px-2 py-1 text-xs ${
                    item.startsWith("✓") ? "bg-emerald-950/40 text-emerald-400" : "bg-red-950/30 text-red-400"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Results({
  exam,
  progress,
  overall,
  freeSlots,
  isMobile,
  onRoadmap,
  onNewRun,
  onResetAll,
  onRestartSlot,
}: {
  exam: Exam;
  progress: ExamProgress;
  overall: number;
  freeSlots: number;
  isMobile: boolean;
  onRoadmap: () => void;
  onNewRun: () => void;
  onResetAll: () => void;
  onRestartSlot: () => void;
}) {
  const theory = exam.sessions.filter(isMobileFriendlySession);
  const theoryDone = theory.filter((s) => progress.results.some((r) => r.sessionId === s.id)).length;
  const passed = overall >= exam.passThreshold && progress.results.length === exam.sessions.length;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--exam-muted)]">Exam results</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {!progress.startedAt
              ? "No active run"
              : progress.results.length === 0
                ? "No submitted phases yet"
                : passed
                  ? "Passed (>= 70%)"
                  : progress.results.length < exam.sessions.length
                    ? "Simulation in progress"
                    : "Below threshold"}
          </h1>
        </div>
        <div className="hidden size-20 overflow-hidden rounded-2xl border border-[var(--exam-border)] bg-[rgba(139,124,246,0.1)] sm:block">
          <img
            src="/illustrations/trophy-glow.png"
            alt="Glowing trophy accent"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      {isMobile && (
        <p className="mt-3 text-sm text-[var(--exam-muted)]">
          Theory on this device: {theoryDone}/{theory.length}. Complete code on PC for the full final score.
        </p>
      )}

      <div className="exam-card exam-glass-card mt-8 grid items-center gap-5 rounded-[1.75rem] p-6 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs text-[var(--exam-muted)]">Weighted score</p>
          <p
            className={`mt-2 text-4xl font-semibold tracking-tight sm:text-5xl ${
              overall >= exam.passThreshold ? "text-[var(--exam-pass)]" : ""
            }`}
          >
            {overall}%
          </p>
          <p className="mt-2 text-sm text-[var(--exam-muted)]">
            Threshold: {exam.passThreshold}% · Phases: {progress.results.length}/{exam.sessions.length}
          </p>
        </div>
        <div className="relative hidden size-28 overflow-hidden rounded-[1.5rem] border border-[var(--exam-border)] bg-[rgba(103,232,249,0.08)] sm:block">
          <img
            src="/illustrations/trophy-glow.png"
            alt=""
            className={`h-full w-full object-cover ${passed ? "opacity-100" : "opacity-70"}`}
          />
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {exam.sessions.map((session) => {
          const result = progress.results.find((r) => r.sessionId === session.id);
          return (
            <li
              key={session.id}
              className="exam-card flex items-center justify-between gap-3 rounded-2xl border border-[var(--exam-border-soft)] bg-[rgba(17,24,43,0.62)] px-4 py-3 text-sm"
            >
              <span className="min-w-0 text-[var(--exam-text)]">
                {session.order}. {session.kind === "mcq" ? session.title : session.subtitle}
              </span>
              <strong className="shrink-0">{result ? `${result.score}%` : "—"}</strong>
            </li>
          );
        })}
      </ul>

      <RunNextSteps
        className="exam-card exam-glass-card mt-8 rounded-2xl p-5"
        allPhasesDone={progress.results.length === exam.sessions.length}
        freeSlots={freeSlots}
        onNewRun={onNewRun}
        onResetAll={onResetAll}
        onRestartSlot={onRestartSlot}
      />

      <button
        onClick={onRoadmap}
        className="exam-btn mt-8 rounded-xl border border-[var(--exam-border)] px-4 py-2 text-sm text-[var(--exam-muted)] hover:bg-[var(--exam-surface)] hover:text-[var(--exam-text)]"
      >
        Back to phases
      </button>
    </section>
  );
}

function RunNextSteps({
  allPhasesDone,
  freeSlots,
  onNewRun,
  onResetAll,
  onRestartSlot,
  className = "",
}: {
  allPhasesDone: boolean;
  freeSlots: number;
  onNewRun: () => void;
  onResetAll: () => void;
  onRestartSlot?: () => void;
  className?: string;
}) {
  if (!allPhasesDone) return null;

  return (
    <div className={className}>
      <p className="text-sm font-medium text-[var(--exam-text)]">You completed the 5 phases of this Practice run</p>
      <p className="mt-1 text-sm text-[var(--exam-muted)]">
        {freeSlots > 0
          ? "You can start another Practice with a different mix of questions and practice tasks."
          : `Your ${MAX_ATTEMPT_SLOTS} Practice slots are full. Reset all or replace this slot.`}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {freeSlots > 0 ? (
          <button
            type="button"
            onClick={onNewRun}
            className="exam-btn exam-glow-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <Plus size={16} />
            New Practice
            <span className="text-[rgba(7,11,22,0.72)]">
              ({freeSlots} available slot{freeSlots === 1 ? "" : "s"})
            </span>
          </button>
        ) : (
          <>
            {onRestartSlot && (
              <button
                type="button"
                onClick={onRestartSlot}
                className="exam-btn inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--exam-border)] px-4 py-2.5 text-sm font-medium text-[var(--exam-muted)] hover:bg-[var(--exam-surface)] hover:text-[var(--exam-text)]"
              >
                <RotateCcw size={16} />
                This Practice · new mix
              </button>
            )}
            <button
              type="button"
              onClick={onResetAll}
              className="exam-btn inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--exam-border)] bg-[rgba(23,31,54,0.68)] px-4 py-2.5 text-sm font-medium text-[var(--exam-muted)] hover:border-[var(--exam-magenta)] hover:bg-[var(--exam-magenta-soft)] hover:text-[var(--exam-text)]"
            >
              <RotateCcw size={16} />
              Reset all · start over
            </button>
          </>
        )}
      </div>
    </div>
  );
}
