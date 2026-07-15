"use client";

import { useEffect, useMemo, useState } from "react";
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
  Smartphone,
  Trophy,
} from "lucide-react";
import {
  bankStats,
  buildExam,
  collectUsedContent,
  examMeta,
  pickVariantSelection,
} from "@/content/bancolombia/exam";
import { StudyScreen } from "@/features/study/StudyScreen";
import type {
  AppState,
  Exam,
  ExamAttempt,
  ExamProgress,
  ExamSession,
  SessionResult,
} from "@/domain/exam";
import { MAX_ATTEMPT_SLOTS } from "@/domain/exam";
import {
  evaluateMcq,
  evaluatePractical,
  weightedExamScore,
  type Evaluation,
} from "@/application/evaluation-engine";
import {
  attemptToProgress,
  emptyAppState,
  emptyProgress,
  loadAppState,
  progressToAttempt,
  saveAppState,
} from "@/infrastructure/storage/progress.repository";

type Screen = "home" | "roadmap" | "session" | "results" | "study";

/** Viewport estrecho: modo teoría (MCQ). Las prácticas de código quedan para desktop. */
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
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
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

  const overall = useMemo(
    () => weightedExamScore(exam.sessions, progress.results),
    [exam.sessions, progress.results],
  );

  const activeSession = exam.sessions.find((s) => s.id === activeId) ?? exam.sessions[0];
  const freeSlots = app.slots.filter((slot) => slot === null).length;
  const hasActive = app.activeSlot !== null && Boolean(app.slots[app.activeSlot ?? -1]);
  const sessionMode = screen === "session";
  const studyMode = screen === "study";
  const sidebarCollapsed = (sessionMode && !sidebarPinnedOpen) || studyMode;

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

  function startInSlot(slotIndex: number) {
    // Excluye el slot actual (libre o a reiniciar) para no contar su selección vieja
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
    const freeIndex = app.slots.findIndex((slot) => slot === null);
    if (freeIndex === -1) {
      setScreen("home");
      return;
    }
    startInSlot(freeIndex);
  }

  function selectSlot(slotIndex: number) {
    const attempt = app.slots[slotIndex];
    if (!attempt) {
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
      submissions: submissions
        ? { ...progress.submissions, [result.sessionId]: submissions }
        : progress.submissions,
    };
    const score = weightedExamScore(exam.sessions, nextProgress.results);
    writeActiveProgress(nextProgress, score);
  }

  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100">
      <AttemptsPanel
        collapsed={sidebarCollapsed}
        sessionMode={sessionMode}
        slots={app.slots}
        activeSlot={app.activeSlot}
        passThreshold={examMeta.passThreshold}
        freeSlots={freeSlots}
        onSelect={(index) => {
          selectSlot(index);
          setSidebarPinnedOpen(false);
        }}
        onCollapse={() => setSidebarPinnedOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#09090b]/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            {sessionMode && (
              <button
                onClick={() => setSidebarPinnedOpen((v) => !v)}
                className="rounded-md border border-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                title={sidebarCollapsed ? "Ver corridas" : "Ocultar corridas"}
                aria-label={sidebarCollapsed ? "Mostrar sidebar" : "Ocultar sidebar"}
              >
                {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
              </button>
            )}
            <button
              onClick={() => setScreen("home")}
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="grid size-7 place-items-center rounded-md bg-zinc-100 text-zinc-900">
                <Code2 size={16} />
              </span>
              trial
              <span className="text-zinc-500">.forge</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm sm:gap-4">
            {isMobile && (
              <span className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400">
                <Smartphone size={12} />
                Solo teoría
              </span>
            )}
            {progress.startedAt && (
              <span
                className={`flex items-center gap-2 font-mono text-xs sm:text-sm ${
                  progress.remainingSeconds < 600 ? "text-red-400" : "text-zinc-300"
                }`}
              >
                <Clock3 size={14} />
                {formatTime(progress.remainingSeconds)}
              </span>
            )}
            <button
              onClick={() => setScreen("study")}
              className={`hidden items-center gap-1.5 sm:inline-flex ${
                studyMode ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <BookOpen size={14} />
              Estudiar
            </button>
            <button
              onClick={() => setScreen("roadmap")}
              className="text-zinc-400 hover:text-white"
            >
              Fases
            </button>
            <button onClick={() => setScreen("results")} className="text-zinc-400 hover:text-white">
              Resultado
            </button>
          </div>
        </header>

        {!sessionMode && !studyMode && (
          <div className="border-b border-zinc-800 p-3 lg:hidden">
            <AttemptsStrip
              slots={app.slots}
              activeSlot={app.activeSlot}
              passThreshold={examMeta.passThreshold}
              onSelect={selectSlot}
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {screen === "home" && (
            <Home
              overall={overall}
              hasProgress={hasActive}
              freeSlots={freeSlots}
              isMobile={isMobile}
              onStart={startExam}
              onResume={resumeExam}
              onStudy={() => setScreen("study")}
            />
          )}
          {screen === "study" && <StudyScreen onBack={() => setScreen("home")} />}
          {screen === "roadmap" && (
            <Roadmap
              exam={exam}
              progress={progress}
              overall={overall}
              isMobile={isMobile}
              onOpen={openSession}
              onResults={() => setScreen("results")}
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
            />
          )}
          {screen === "results" && (
            <Results
              exam={exam}
              progress={progress}
              overall={overall}
              isMobile={isMobile}
              onRoadmap={() => setScreen("roadmap")}
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
  onSelect,
  onCollapse,
}: {
  collapsed: boolean;
  sessionMode: boolean;
  slots: (ExamAttempt | null)[];
  activeSlot: number | null;
  passThreshold: number;
  freeSlots: number;
  onSelect: (index: number) => void;
  onCollapse: () => void;
}) {
  const open = !collapsed;

  return (
    <>
      {sessionMode && open && (
        <button
          aria-label="Cerrar sidebar"
          className="fixed inset-0 z-30 bg-black/50"
          onClick={onCollapse}
        />
      )}

      <aside
        className={[
          "z-40 flex h-screen shrink-0 flex-col border-r border-zinc-800 bg-[#0c0c0e]",
          "transition-[width,transform] duration-300 ease-out",
          // Desktop: sidebar real en el flujo. Sesión → width 0 (comprimido/oculto).
          "hidden lg:flex",
          open ? "lg:w-60" : "lg:w-0 lg:border-transparent lg:overflow-hidden",
          // Mobile (solo cuando se reabre en sesión): drawer overlay
          sessionMode && open ? "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:flex max-lg:w-60" : "",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div
          className={[
            "flex h-full w-60 flex-col",
            open ? "opacity-100" : "pointer-events-none opacity-0",
            "transition-opacity duration-200",
          ].join(" ")}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Corridas</p>
              <p className="text-sm font-semibold text-zinc-200">Últimas {MAX_ATTEMPT_SLOTS}</p>
            </div>
            {sessionMode && (
              <button
                onClick={onCollapse}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                aria-label="Comprimir sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3">
            <p className="px-1 text-[11px] leading-4 text-zinc-600">
              {freeSlots > 0
                ? `${freeSlots} slot${freeSlots === 1 ? "" : "s"} libre${freeSlots === 1 ? "" : "s"}`
                : "Sin cupos libres"}
            </p>
            {slots.map((attempt, index) => (
              <AttemptCard
                key={attempt?.id ?? `empty-${index}`}
                attempt={attempt}
                index={index}
                active={activeSlot === index}
                passThreshold={passThreshold}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

function AttemptsStrip({
  slots,
  activeSlot,
  passThreshold,
  onSelect,
}: {
  slots: (ExamAttempt | null)[];
  activeSlot: number | null;
  passThreshold: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {slots.map((attempt, index) => (
        <AttemptCard
          key={attempt?.id ?? `m-empty-${index}`}
          attempt={attempt}
          index={index}
          active={activeSlot === index}
          passThreshold={passThreshold}
          onSelect={onSelect}
          compact
        />
      ))}
    </div>
  );
}

function AttemptCard({
  attempt,
  index,
  active,
  passThreshold,
  onSelect,
  compact = false,
}: {
  attempt: ExamAttempt | null;
  index: number;
  active: boolean;
  passThreshold: number;
  onSelect: (index: number) => void;
  compact?: boolean;
}) {
  if (!attempt) {
    return (
      <button
        onClick={() => onSelect(index)}
        className={`group flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-700/80 text-center transition hover:border-zinc-500 hover:bg-zinc-900/40 ${
          compact ? "min-h-[72px] min-w-[88px] px-2 py-2" : "min-h-[88px] px-3 py-4"
        }`}
      >
        <Plus size={compact ? 14 : 16} className="text-zinc-600 group-hover:text-zinc-300" />
        <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300">Libre</span>
        {!compact && <span className="text-[10px] text-zinc-700">Slot {index + 1}</span>}
      </button>
    );
  }

  const done = attempt.results.length >= 5;
  const passed = done && attempt.overallScore >= passThreshold;
  const label = done ? (passed ? "Aprobado" : "No alcanza") : "En curso";

  return (
    <button
      onClick={() => onSelect(index)}
      className={`rounded-xl border text-left transition ${
        compact ? "min-h-[72px] min-w-[110px] px-2.5 py-2" : "min-h-[88px] px-3 py-3"
      } ${active ? "border-zinc-400 bg-zinc-900" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">#{index + 1}</span>
        <span
          className={`text-[10px] ${
            done ? (passed ? "text-emerald-400" : "text-red-400") : "text-zinc-500"
          }`}
        >
          {label}
        </span>
      </div>
      <p
        className={`mt-1.5 font-semibold tracking-tight ${compact ? "text-xl" : "text-2xl"} ${
          done && passed ? "text-emerald-400" : "text-zinc-100"
        }`}
      >
        {attempt.overallScore}%
      </p>
      {!compact && (
        <p className="mt-1 text-[11px] text-zinc-500">
          {attempt.results.length}/5 fases · {formatShortDate(attempt.startedAt)}
        </p>
      )}
    </button>
  );
}

function Home({
  overall,
  hasProgress,
  freeSlots,
  isMobile,
  onStart,
  onResume,
  onStudy,
}: {
  overall: number;
  hasProgress: boolean;
  freeSlots: number;
  isMobile: boolean;
  onStart: () => void;
  onResume: () => void;
  onStudy: () => void;
}) {
  return (
    <section className="px-4 pb-24 pt-10 sm:px-10 sm:pt-24">
      {isMobile && (
        <div className="mb-6 flex gap-3 rounded-xl border border-sky-900/60 bg-sky-950/30 p-4">
          <Smartphone size={18} className="mt-0.5 shrink-0 text-sky-400" />
          <div>
            <p className="text-sm font-medium text-sky-200">Modo celular · solo teoría</p>
            <p className="mt-1 text-xs leading-5 text-sky-200/70">
              En el teléfono puedes resolver las sesiones de selección múltiple. Las prácticas de
              código (JS, SQL, CSS, Angular) se desbloquean en escritorio o tablet ancha.
            </p>
          </div>
        </div>
      )}

      <p className="text-sm text-zinc-500">TrialForge · Pruebas técnicas · Cliente: Bancolombia</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-6xl">
        {examMeta.title}
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:mt-6 sm:text-base">
        Hasta <strong className="text-zinc-200">5 corridas</strong> en el historial. Cada una arma un
        set distinto del banco. Ideal para practicar teoría en móvil y código en PC.
      </p>

      <button
        type="button"
        onClick={onStudy}
        className="mt-6 flex w-full items-center gap-3 rounded-xl border border-amber-900/50 bg-gradient-to-r from-amber-950/40 to-rose-950/30 p-4 text-left transition hover:border-amber-700/60 sm:max-w-md"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-950">
          <BookOpen size={18} />
        </span>
        <span>
          <span className="block text-sm font-medium text-amber-100">Estudiar el banco</span>
          <span className="mt-0.5 block text-xs leading-5 text-amber-100/60">
            Roadmap estilo pizarra · analogías simples · móvil y desktop
          </span>
        </span>
      </button>

      <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
        {[
          ["180 min", "Tiempo"],
          ["70%", "Aprobar"],
          [`${freeSlots}/${MAX_ATTEMPT_SLOTS}`, "Libres"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-5">
            <strong className="block text-xl tracking-tight sm:text-2xl">{value}</strong>
            <span className="mt-1 block text-[11px] text-zinc-500 sm:text-xs">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-6">
        {[
          [`${bankStats.mcqFundamentos}`, "MCQ fundamentos"],
          [`${bankStats.mcqWeb}`, "MCQ web+SQL"],
          [`${bankStats.mcqSql}`, "Conceptos SQL"],
          [`${bankStats.logic}`, "Práctica JS/SQL"],
          [`${bankStats.css}`, "Variantes CSS"],
          [`${bankStats.angular}`, "Variantes Angular"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg border border-zinc-800/80 px-3 py-3 text-center">
            <strong className="block text-lg">{value}</strong>
            <span className="mt-1 block text-[11px] leading-4 text-zinc-500">{label}</span>
          </div>
        ))}
      </div>

      {!isMobile && (
        <ul className="mt-10 space-y-3 border-t border-zinc-800 pt-8">
          {examMeta.rules.map((rule) => (
            <li key={rule} className="flex gap-3 text-sm leading-6 text-zinc-400">
              <CheckCircle2 size={16} className="mt-1 shrink-0 text-zinc-600" />
              {rule}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
        <button
          onClick={onStart}
          disabled={freeSlots === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-3.5 text-sm font-medium text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          <Play size={16} fill="currentColor" />
          {freeSlots === 0 ? "Sin slots libres" : isMobile ? "Nueva corrida (teoría)" : "Nueva corrida"}
        </button>
        {hasProgress && (
          <button
            onClick={onResume}
            className="w-full rounded-lg border border-zinc-700 px-5 py-3.5 text-sm font-medium sm:w-auto"
          >
            Continuar ({overall}%)
          </button>
        )}
        <button
          onClick={onStudy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 px-5 py-3.5 text-sm font-medium sm:hidden"
        >
          <BookOpen size={16} />
          Estudiar
        </button>
      </div>
    </section>
  );
}

function Roadmap({
  exam,
  progress,
  overall,
  isMobile,
  onOpen,
  onResults,
}: {
  exam: Exam;
  progress: ExamProgress;
  overall: number;
  isMobile: boolean;
  onOpen: (id: string) => void;
  onResults: () => void;
}) {
  const byId = new Map(progress.results.map((r) => [r.sessionId, r]));
  const theorySessions = exam.sessions.filter(isMobileFriendlySession);
  const theoryDone = theorySessions.filter((s) => byId.has(s.id)).length;

  if (!progress.selection) {
    return (
      <section className="px-4 py-16 text-sm text-zinc-500 sm:px-10">
        {isMobile
          ? "Elige un slot libre arriba para iniciar una corrida."
          : "Selecciona un slot libre en el panel lateral para iniciar una corrida."}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Roadmap de esta corrida</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Las 5 fases</h2>
          <p className="mt-2 text-sm text-zinc-500">
            {isMobile
              ? `En celular: ${theoryDone}/${theorySessions.length} sesiones de teoría. El código espera el PC.`
              : "Contenido fijado al iniciar este slot. Un slot libre = otra mezcla del banco."}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-zinc-500">Puntaje ponderado</p>
          <p
            className={`text-2xl font-semibold ${
              overall >= exam.passThreshold ? "text-emerald-400" : "text-zinc-100"
            }`}
          >
            {overall}%
            <span className="ml-2 text-sm font-normal text-zinc-500">/ {exam.passThreshold}%</span>
          </p>
        </div>
      </div>

      <ol className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
        {exam.sessions.map((session) => {
          const result = byId.get(session.id);
          const done = Boolean(result);
          const mobileOk = isMobileFriendlySession(session);
          const lockedOnMobile = isMobile && !mobileOk;

          return (
            <li key={session.id}>
              <button
                onClick={() => onOpen(session.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition sm:gap-4 sm:p-5 ${
                  lockedOnMobile
                    ? "border-zinc-800/80 bg-zinc-950/40 opacity-90"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900"
                }`}
              >
                <span className="mt-0.5 text-zinc-500">
                  {done ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : lockedOnMobile ? (
                    <Monitor size={20} className="text-zinc-600" />
                  ) : (
                    <Circle size={20} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-zinc-500">{session.phase}</span>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{session.weight}%</span>
                    {mobileOk ? (
                      <span className="flex items-center gap-1 rounded bg-sky-950/50 px-2 py-0.5 text-xs text-sky-300 md:hidden">
                        <Smartphone size={11} /> móvil
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500 md:hidden">
                        <Monitor size={11} /> PC
                      </span>
                    )}
                    {session.kind !== "mcq" && (
                      <span className="hidden items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 sm:flex">
                        <Lock size={11} /> tests bloqueados
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium sm:text-base">{session.title}</h3>
                  <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{session.subtitle}</p>
                  {lockedOnMobile && (
                    <p className="mt-2 text-xs text-zinc-600">Disponible en escritorio / tablet ancha.</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {result ? (
                    <strong className={result.score >= 70 ? "text-emerald-400" : "text-zinc-300"}>
                      {result.score}%
                    </strong>
                  ) : lockedOnMobile ? (
                    <Lock size={14} className="ml-auto text-zinc-600" />
                  ) : (
                    <span className="text-sm text-zinc-600">Abrir →</span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <button onClick={onResults} className="mt-8 text-sm text-zinc-400 underline underline-offset-4">
        Ver resultado final
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
}: {
  session: ExamSession;
  progress: ExamProgress;
  isMobile: boolean;
  onBack: () => void;
  onComplete: (result: SessionResult, answers?: Record<string, string>, submissions?: Record<string, string>) => void;
}) {
  if (session.kind === "mcq") {
    return (
      <McqSessionView
        session={session}
        progress={progress}
        isMobile={isMobile}
        onBack={onBack}
        onComplete={onComplete}
      />
    );
  }
  if (isMobile) {
    return <DesktopRequiredGate session={session} onBack={onBack} />;
  }
  return <PracticalSessionView session={session} progress={progress} onBack={onBack} onComplete={onComplete} />;
}

function DesktopRequiredGate({
  session,
  onBack,
}: {
  session: ExamSession;
  onBack: () => void;
}) {
  return (
    <section className="mx-auto flex max-w-lg flex-col px-4 py-12">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
        <ArrowLeft size={15} /> Volver a fases
      </button>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-zinc-800 text-zinc-300">
          <Monitor size={22} />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">{session.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{session.subtitle}</p>
        <p className="mt-5 text-sm leading-6 text-zinc-400">
          Esta fase incluye un editor de código y tests ocultos. En celular no es cómodo ni fiel al
          entorno real: ábrela desde un computador o tablet en horizontal ancha.
        </p>
        <p className="mt-4 text-xs text-zinc-600">
          Mientras tanto puedes completar las sesiones de selección múltiple desde este dispositivo.
        </p>
        <button
          onClick={onBack}
          className="mt-8 w-full rounded-lg bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-950"
        >
          Ir a fases de teoría
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
}: {
  session: Extract<ExamSession, { kind: "mcq" }>;
  progress: ExamProgress;
  isMobile: boolean;
  onBack: () => void;
  onComplete: (result: SessionResult, answers?: Record<string, string>) => void;
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

  const total = session.questions.length;
  const answered = session.questions.filter((q) => answers[q.id]).length;
  const question = session.questions[Math.min(step, total - 1)];

  function submit() {
    const evaluation = evaluateMcq(session.id, session.questions, answers);
    const stamped: SessionResult = { ...evaluation, completedAt: new Date().toISOString() };
    setResult(evaluation);
    const namespaced = Object.fromEntries(Object.entries(answers).map(([k, v]) => [`${prefix}${k}`, v]));
    onComplete(stamped, namespaced);
  }

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (isMobile && step < total - 1) {
      window.setTimeout(() => setStep((s) => Math.min(s + 1, total - 1)), 180);
    }
  }

  if (isMobile) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-7.5rem)] max-w-lg flex-col px-4 pb-28 pt-6">
        <button onClick={onBack} className="mb-5 flex items-center gap-2 text-sm text-zinc-400">
          <ArrowLeft size={15} /> Fases
        </button>
        <p className="text-xs uppercase tracking-wider text-zinc-500">{session.phase}</p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">{session.title}</h1>
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Pregunta {step + 1} / {total}
          </span>
          <span>
            {answered}/{total} respondidas
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-zinc-200 transition-all"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>

        <fieldset className="mt-6 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <legend className="sr-only">Pregunta {step + 1}</legend>
          <p className="text-base font-medium leading-7 text-zinc-100">{question.prompt}</p>
          <div className="mt-5 space-y-2.5">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectOption(question.id, option.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                    selected ? "border-zinc-400 bg-zinc-800" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                      selected ? "border-zinc-200 bg-zinc-100 text-zinc-900" : "border-zinc-600 text-zinc-500"
                    }`}
                  >
                    {option.id.toUpperCase()}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
          {result && <p className="mt-4 text-xs leading-5 text-zinc-500">{question.explanation}</p>}
        </fieldset>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-800 bg-[#09090b]/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-lg gap-2">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="rounded-lg border border-zinc-700 px-4 py-3 text-sm disabled:opacity-30"
            >
              Anterior
            </button>
            {step < total - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                className="flex-1 rounded-lg bg-zinc-100 py-3 text-sm font-medium text-zinc-950"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={answered < total && !result}
                className="flex-1 rounded-lg bg-zinc-100 py-3 text-sm font-medium text-zinc-950 disabled:opacity-40"
              >
                {result ? `Enviado · ${result.score}%` : "Enviar sesión"}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-8">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
        <ArrowLeft size={15} /> Volver a fases
      </button>
      <p className="text-xs uppercase tracking-wider text-zinc-500">{session.phase}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{session.title}</h1>
      <p className="mt-2 text-sm text-zinc-500">{session.subtitle}</p>

      <div className="mt-8 space-y-6">
        {session.questions.map((q, index) => (
          <fieldset key={q.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <legend className="px-1 text-sm font-medium text-zinc-200">
              {index + 1}. {q.prompt}
            </legend>
            <div className="mt-4 space-y-2">
              {q.options.map((option) => {
                const selected = answers[q.id] === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                      selected ? "border-zinc-500 bg-zinc-800" : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      className="mt-0.5"
                      name={q.id}
                      checked={selected}
                      onChange={() => selectOption(q.id, option.id)}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
            {result && <p className="mt-3 text-xs text-zinc-500">{q.explanation}</p>}
          </fieldset>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button onClick={submit} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950">
          Enviar sesión
        </button>
        {result && (
          <span className="text-sm text-zinc-400">
            Resultado: <strong className="text-zinc-100">{result.score}%</strong> ({result.passed}/{result.total})
          </span>
        )}
      </div>
    </section>
  );
}

function PracticalSessionView({
  session,
  progress,
  onBack,
  onComplete,
}: {
  session: Extract<ExamSession, { kind: "javascript" | "css" | "angular" | "sql" }>;
  progress: ExamProgress;
  onBack: () => void;
  onComplete: (result: SessionResult, _answers?: Record<string, string>, submissions?: Record<string, string>) => void;
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

  const fileLocked =
    (session.kind === "css" && activeFile.endsWith(".html")) ||
    (session.kind === "sql" && activeFile === "schema.sql");

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
          <ArrowLeft size={15} /> Volver a fases
        </button>
        <p className="text-xs uppercase tracking-wider text-zinc-500">{session.phase}</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">{session.title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{session.story}</p>

        <h2 className="mt-6 text-sm font-medium">Requisitos</h2>
        <ul className="mt-2 space-y-2 text-sm text-zinc-400">
          {session.requirements.map((item) => (
            <li key={item}>— {item}</li>
          ))}
        </ul>

        <h2 className="mt-6 text-sm font-medium">Restricciones</h2>
        <ul className="mt-2 space-y-2 text-sm text-zinc-400">
          {session.restrictions.map((item) => (
            <li key={item} className="flex gap-2">
              <Lock size={13} className="mt-1 shrink-0 text-zinc-600" />
              {item}
            </li>
          ))}
        </ul>

        <details className="mt-6 rounded-lg border border-zinc-800 p-3">
          <summary className="cursor-pointer text-sm">Pistas (modo práctica)</summary>
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
              <Lock size={11} /> *.spec.ts (bloqueado)
            </span>
          </div>
          <button onClick={submit} className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950">
            Ejecutar tests ocultos
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
                {result.passed}/{result.total} tests ocultos
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
  isMobile,
  onRoadmap,
}: {
  exam: Exam;
  progress: ExamProgress;
  overall: number;
  isMobile: boolean;
  onRoadmap: () => void;
}) {
  const theory = exam.sessions.filter(isMobileFriendlySession);
  const theoryDone = theory.filter((s) => progress.results.some((r) => r.sessionId === s.id)).length;
  const passed = overall >= exam.passThreshold && progress.results.length === exam.sessions.length;

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
      <p className="text-sm text-zinc-500">Resultado del simulacro</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        {!progress.startedAt
          ? "Ninguna corrida activa"
          : progress.results.length === 0
            ? "Aún no hay fases enviadas"
            : passed
              ? "Aprobado (≥ 70%)"
              : progress.results.length < exam.sessions.length
                ? "Simulación en curso"
                : "No alcanza el umbral"}
      </h1>
      {isMobile && (
        <p className="mt-3 text-sm text-zinc-500">
          Teoría en este dispositivo: {theoryDone}/{theory.length}. Completa código en PC para el
          puntaje final completo.
        </p>
      )}

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-xs text-zinc-500">Puntaje ponderado</p>
        <p
          className={`mt-2 text-4xl font-semibold tracking-tight sm:text-5xl ${
            overall >= exam.passThreshold ? "text-emerald-400" : ""
          }`}
        >
          {overall}%
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Umbral: {exam.passThreshold}% · Fases: {progress.results.length}/{exam.sessions.length}
        </p>
      </div>

      <ul className="mt-6 space-y-2">
        {exam.sessions.map((session) => {
          const result = progress.results.find((r) => r.sessionId === session.id);
          return (
            <li
              key={session.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 px-4 py-3 text-sm"
            >
              <span className="min-w-0 text-zinc-300">
                {session.order}. {session.kind === "mcq" ? session.title : session.subtitle}
              </span>
              <strong className="shrink-0">{result ? `${result.score}%` : "—"}</strong>
            </li>
          );
        })}
      </ul>

      <button onClick={onRoadmap} className="mt-8 rounded-lg border border-zinc-700 px-4 py-2 text-sm">
        Volver a fases
      </button>
    </section>
  );
}
