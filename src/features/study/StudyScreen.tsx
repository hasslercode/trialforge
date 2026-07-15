"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Circle, Code2, Lightbulb, Map, Sparkles, Volume2, VolumeX } from "lucide-react";
import { loadStudyProgress, saveStudyProgress } from "@/infrastructure/storage/progress.repository";
import { useStudyAmbience } from "@/features/study/useStudyAmbience";
import {
  allTopicIds,
  getTopic,
  getTrack,
  studyTracks,
  type ExamCoverage,
  type StudyTopic,
  type StudyTrack,
} from "./curriculum";
import { COVERAGE_KIND_LABEL, type ExamCoverageKind } from "./exam-coverage";
import "./study.css";

type StudyProgress = Record<string, boolean>;

function topicKey(trackId: string, topicId: string) {
  return `${trackId}::${topicId}`;
}

function ExamCoverageBadge({ coverage, compact }: { coverage: ExamCoverage; compact?: boolean }) {
  const tone: Record<ExamCoverageKind, string> = {
    mcq: "study-coverage-mcq",
    practical: "study-coverage-practical",
    both: "study-coverage-both",
    meta: "study-coverage-meta",
  };
  return (
    <span className={`study-coverage-badge ${tone[coverage.kind]} ${compact ? "text-[10px]" : ""}`}>
      {COVERAGE_KIND_LABEL[coverage.kind]}
      {!compact && <span className="opacity-80"> · {coverage.label}</span>}
    </span>
  );
}

export function StudyScreen({ onBack }: { onBack: () => void }) {
  const [progress, setProgress] = useState<StudyProgress>({});
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const ambience = useStudyAmbience(true);

  useEffect(() => {
    void loadStudyProgress().then((stored) => {
      setProgress(stored);
      setLoaded(true);
      if (Object.keys(stored).length > 0) {
        void saveStudyProgress(stored);
      }
    });
  }, []);

  const keys = useMemo(() => allTopicIds(), []);
  const doneCount = keys.filter((k) => progress[k]).length;
  const pct = keys.length ? Math.round((doneCount / keys.length) * 100) : 0;

  const activeTrack = activeTrackId ? getTrack(activeTrackId) : null;
  const activeTopic =
    activeTrackId && activeTopicId ? getTopic(activeTrackId, activeTopicId) : null;

  function toggleDone(trackId: string, topicId: string) {
    const key = topicKey(trackId, topicId);
    setProgress((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      void saveStudyProgress(next);
      return next;
    });
  }

  function openTopic(trackId: string, topicId: string) {
    setActiveTrackId(trackId);
    setActiveTopicId(topicId);
  }

  function closeTopic() {
    setActiveTopicId(null);
  }

  function closeTrack() {
    setActiveTrackId(null);
    setActiveTopicId(null);
  }

  return (
    <div className="study-board min-h-[calc(100vh-3.5rem)]">
      <div className="study-noise" aria-hidden />
      <button
        type="button"
        onClick={() => ambience.toggleMuted()}
        className="study-music-btn"
        aria-label={ambience.muted ? "Activar ambiente de estudio" : "Silenciar ambiente de estudio"}
        title="Ambiente de foco para estudiar"
      >
        {ambience.muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        <span>{ambience.muted ? "Sin música" : "Ambiente foco"}</span>
      </button>
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        {!loaded ? (
          <p className="font-[family-name:var(--font-study-body)] text-sm text-[#57534e]">
            Cargando tu progreso guardado…
          </p>
        ) : null}
        {loaded && !activeTrack && (
          <RoadmapHome
            doneCount={doneCount}
            total={keys.length}
            pct={pct}
            progress={progress}
            onBack={onBack}
            onOpenTrack={setActiveTrackId}
          />
        )}

        {loaded && activeTrack && !activeTopic && (
          <TrackView
            track={activeTrack}
            progress={progress}
            onBack={closeTrack}
            onOpenTopic={(topicId) => openTopic(activeTrack.id, topicId)}
            onToggle={(topicId) => toggleDone(activeTrack.id, topicId)}
          />
        )}

        {loaded && activeTrack && activeTopic && (
          <TopicView
            track={activeTrack}
            topic={activeTopic}
            done={Boolean(progress[topicKey(activeTrack.id, activeTopic.id)])}
            onBack={closeTopic}
            onToggle={() => toggleDone(activeTrack.id, activeTopic.id)}
            onPrevNext={(dir) => {
              const idx = activeTrack.topics.findIndex((t) => t.id === activeTopic.id);
              const next = activeTrack.topics[idx + dir];
              if (next) setActiveTopicId(next.id);
            }}
          />
        )}
      </div>
    </div>
  );
}

function RoadmapHome({
  doneCount,
  total,
  pct,
  progress,
  onBack,
  onOpenTrack,
}: {
  doneCount: number;
  total: number;
  pct: number;
  progress: StudyProgress;
  onBack: () => void;
  onOpenTrack: (id: string) => void;
}) {
  return (
    <div className="study-fade-in">
      <button onClick={onBack} className="study-ghost-btn mb-6">
        <ArrowLeft size={15} /> Volver al simulacro
      </button>

      <header className="relative mb-10 max-w-2xl sm:mb-14">
        <p className="study-hand text-lg text-[#5c5346] sm:text-xl">Modo estudio</p>
        <h1 className="study-hand mt-1 text-4xl leading-none text-[#1c1917] sm:text-6xl">
          Estudiar el challenge
        </h1>
        <p className="mt-4 max-w-xl font-[family-name:var(--font-study-body)] text-sm leading-7 text-[#44403c] sm:text-base">
          Temas del challenge contados con analogías de niño y dibujos de pizarra. Cada tema tiene una
          pregunta o variante 1:1 en el simulacro — mira el badge de evaluación. Marca lo que ya
          entiendes; se guarda en este dispositivo.
        </p>

        <div className="study-sticky study-sticky-lemon mt-6 inline-flex rotate-[-1.5deg] items-center gap-3 px-4 py-3">
          <Sparkles size={18} className="text-[#854d0e]" />
          <div className="font-[family-name:var(--font-study-body)] text-sm text-[#422006]">
            <strong className="study-hand text-lg">
              {doneCount}/{total}
            </strong>{" "}
            temas · {pct}% del mapa
          </div>
        </div>
      </header>

      {/* Desktop: zigzag path */}
      <div className="relative hidden md:block">
        <svg
          className="pointer-events-none absolute inset-x-4 top-6 h-[calc(100%-1.5rem)] w-[calc(100%-2rem)]"
          viewBox="0 0 120 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 20 12 C 40 12, 55 28, 75 34 S 100 48, 100 58 S 70 72, 45 82 S 20 98, 22 110 S 55 125, 78 138 S 105 155, 95 168 S 55 180, 40 190"
            fill="none"
            stroke="#1c1917"
            strokeWidth="0.8"
            strokeDasharray="2.5 2"
            opacity="0.28"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <ol className="relative grid grid-cols-2 gap-x-10 gap-y-8">
          {studyTracks.map((track, i) => {
            const trackDone = track.topics.filter((t) => progress[topicKey(track.id, t.id)]).length;
            const shiftRight = i % 2 === 1;
            return (
              <li
                key={track.id}
                className={`${shiftRight ? "col-start-2" : "col-start-1"} ${
                  i > 0 ? (shiftRight ? "-mt-4" : "mt-2") : ""
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <TrackCard
                  track={track}
                  done={trackDone}
                  index={i + 1}
                  onOpen={() => onOpenTrack(track.id)}
                />
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile: vertical trail */}
      <ol className="relative space-y-4 md:hidden">
        <div className="absolute bottom-4 left-[1.15rem] top-4 w-px bg-[#1c1917]/25" aria-hidden />
        {studyTracks.map((track, i) => {
          const trackDone = track.topics.filter((t) => progress[topicKey(track.id, t.id)]).length;
          return (
            <li key={track.id} className="relative pl-10">
              <span
                className="absolute left-0 top-5 grid size-9 place-items-center rounded-full border-2 border-[#1c1917] bg-[#faf6ee] study-hand text-sm"
                style={{ boxShadow: `3px 3px 0 ${track.fill}` }}
              >
                {i + 1}
              </span>
              <TrackCard
                track={track}
                done={trackDone}
                index={i + 1}
                onOpen={() => onOpenTrack(track.id)}
                compact
              />
            </li>
          );
        })}
      </ol>

      <aside className="study-sticky study-sticky-sky mt-12 max-w-lg rotate-[1deg] p-5 sm:mt-16">
        <p className="study-hand flex items-center gap-2 text-xl text-[#0c4a6e]">
          <Lightbulb size={20} /> Tip de estudio
        </p>
        <p className="mt-2 font-[family-name:var(--font-study-body)] text-sm leading-6 text-[#0c4a6e]/90">
          Lee la analogía en voz alta, luego los puntos clave, y abre una corrida de teoría en el
          simulacro. Si fallas un MCQ, vuelve aquí al tema y márcalo cuando ya lo puedas explicar sin
          mirar.
        </p>
      </aside>
    </div>
  );
}

function TrackCard({
  track,
  done,
  index,
  onOpen,
  compact,
}: {
  track: StudyTrack;
  done: number;
  index: number;
  onOpen: () => void;
  compact?: boolean;
}) {
  const complete = done === track.topics.length;
  return (
    <button
      onClick={onOpen}
      className={`study-rough group w-full text-left transition duration-300 hover:-translate-y-1 hover:rotate-[-0.5deg] ${
        compact ? "p-4" : "p-5"
      }`}
      style={{
        background: track.fill,
        color: track.ink,
        ["--study-ink" as string]: track.ink,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="study-hand text-2xl opacity-80">{track.emoji}</span>
        <span className="study-hand rounded-md border border-black/20 bg-white/45 px-2 py-0.5 text-xs">
          {complete ? "listo ✓" : `${done}/${track.topics.length}`}
        </span>
      </div>
      <p className="study-hand mt-2 text-xs uppercase tracking-wide opacity-70">Tramo {index}</p>
      <h2 className="study-hand mt-1 text-2xl leading-none sm:text-3xl">{track.title}</h2>
      <p className="mt-2 font-[family-name:var(--font-study-body)] text-sm leading-6 opacity-80">
        {track.tagline}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 font-[family-name:var(--font-study-body)] text-xs font-semibold underline decoration-wavy underline-offset-4 opacity-0 transition group-hover:opacity-100">
        <Map size={12} /> Abrir tramo
      </span>
    </button>
  );
}

function TrackView({
  track,
  progress,
  onBack,
  onOpenTopic,
  onToggle,
}: {
  track: StudyTrack;
  progress: StudyProgress;
  onBack: () => void;
  onOpenTopic: (topicId: string) => void;
  onToggle: (topicId: string) => void;
}) {
  return (
    <div className="study-fade-in">
      <button onClick={onBack} className="study-ghost-btn mb-6">
        <ArrowLeft size={15} /> Todo el roadmap
      </button>

      <div
        className="study-rough mb-8 p-5 sm:p-7"
        style={{ background: track.fill, color: track.ink }}
      >
        <p className="study-hand text-3xl">{track.emoji}</p>
        <h1 className="study-hand mt-2 text-3xl sm:text-5xl">{track.title}</h1>
        <p className="mt-2 max-w-2xl font-[family-name:var(--font-study-body)] text-sm opacity-85 sm:text-base">
          {track.tagline}
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2">
        {track.topics.map((topic, i) => {
          const done = Boolean(progress[topicKey(track.id, topic.id)]);
          return (
            <li key={topic.id}>
              <div className="study-rough flex h-full flex-col bg-[#fffdf8] p-4 text-[#1c1917]">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onToggle(topic.id)}
                    className="mt-0.5 shrink-0 rounded-full p-0.5 text-[#57534e] hover:text-[#1c1917]"
                    aria-label={done ? "Marcar como pendiente" : "Marcar como entendido"}
                  >
                    {done ? <Check size={20} className="text-emerald-700" /> : <Circle size={20} />}
                  </button>
                  <button type="button" onClick={() => onOpenTopic(topic.id)} className="min-w-0 flex-1 text-left">
                    <p className="study-hand text-xs text-[#78716c]">Tema {i + 1}</p>
                    <h3 className="study-hand text-xl leading-tight sm:text-2xl">{topic.title}</h3>
                    <div className="mt-2">
                      <ExamCoverageBadge coverage={topic.examCoverage} compact />
                    </div>
                    <p className="mt-2 line-clamp-2 font-[family-name:var(--font-study-body)] text-sm leading-6 text-[#57534e]">
                      {topic.kidAnalogy}
                    </p>
                    <span className="mt-3 inline-block font-[family-name:var(--font-study-body)] text-xs font-semibold text-[#1c1917] underline decoration-wavy underline-offset-4">
                      Estudiar →
                    </span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TopicView({
  track,
  topic,
  done,
  onBack,
  onToggle,
  onPrevNext,
}: {
  track: StudyTrack;
  topic: StudyTopic;
  done: boolean;
  onBack: () => void;
  onToggle: () => void;
  onPrevNext: (dir: -1 | 1) => void;
}) {
  const idx = track.topics.findIndex((t) => t.id === topic.id);

  return (
    <div className="study-fade-in mx-auto max-w-3xl">
      <button onClick={onBack} className="study-ghost-btn mb-6">
        <ArrowLeft size={15} /> {track.title}
      </button>

      <p className="study-hand text-sm text-[#78716c]">
        {track.emoji} · tema {idx + 1}/{track.topics.length}
      </p>
      <h1 className="study-hand mt-1 text-3xl text-[#1c1917] sm:text-5xl">{topic.title}</h1>
      <p className="mt-3 font-[family-name:var(--font-study-body)] text-sm leading-7 text-[#44403c] sm:text-base">
        {topic.summary}
      </p>

      <div className="study-sticky study-sticky-sky mt-6 rotate-[0.5deg] p-4 sm:p-5">
        <ExamCoverageBadge coverage={topic.examCoverage} />
        <p className="mt-3 font-[family-name:var(--font-study-body)] text-sm text-[#0c4a6e]">
          <strong className="study-hand">Ítem 1:1 en el simulacro:</strong>{" "}
          <code className="study-inline-code">{topic.examCoverage.primaryId}</code>
        </p>
        <p className="mt-1 font-[family-name:var(--font-study-body)] text-xs text-[#0c4a6e]/80">
          Si sale en tu corrida (10 MCQ por sesión o 1 variante práctica), este ID evalúa directamente
          este tema.
        </p>
      </div>

      <div className="study-sticky study-sticky-peach mt-8 rotate-[-1deg] p-5 sm:p-6">
        <p className="study-hand text-xl text-[#7c2d12]">Como si tuvieras 8 años…</p>
        <p className="mt-3 font-[family-name:var(--font-study-body)] text-base leading-7 text-[#431407] sm:text-lg">
          {topic.kidAnalogy}
        </p>
      </div>

      <section className="study-rough mt-8 bg-[#fffdf8] p-5 text-[#1c1917] sm:p-6">
        <h2 className="study-hand text-2xl">Puntos clave</h2>
        <ul className="mt-4 space-y-3 font-[family-name:var(--font-study-body)] text-sm leading-6">
          {topic.keyPoints.map((point) => (
            <li key={point} className="flex gap-3">
              <span className="study-hand mt-0.5 text-[#b45309]" aria-hidden>
                →
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        {topic.remember && (
          <p className="study-sticky study-sticky-lemon mt-6 inline-block rotate-[1deg] px-3 py-2 font-[family-name:var(--font-study-body)] text-sm text-[#422006]">
            <strong className="study-hand">Recuerda:</strong> {topic.remember}
          </p>
        )}
      </section>

      {topic.examples.length > 0 && (
        <section className="mt-8">
          <h2 className="study-hand flex items-center gap-2 text-2xl text-[#1c1917]">
            <Code2 size={22} className="text-[#57534e]" />
            Ejemplos
          </h2>
          <p className="mt-1 font-[family-name:var(--font-study-body)] text-sm text-[#78716c]">
            Código y casos concretos para este tema.
          </p>
          <ol className="mt-4 space-y-4">
            {topic.examples.map((example, i) => (
              <li key={`${example.title}-${i}`} className="study-rough bg-[#fffdf8] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="study-hand text-lg text-[#1c1917]">{example.title}</h3>
                  {example.language && example.language !== "text" && (
                    <span className="study-chip font-[family-name:var(--font-study-body)] uppercase">
                      {example.language}
                    </span>
                  )}
                </div>
                <pre className="study-code-block mt-3 overflow-x-auto">
                  <code>{example.code}</code>
                </pre>
                {example.note && (
                  <p className="mt-3 font-[family-name:var(--font-study-body)] text-xs leading-5 text-[#78716c]">
                    {example.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-8">
        <h2 className="study-hand text-2xl text-[#1c1917]">En el challenge</h2>
        <p className="mt-1 font-[family-name:var(--font-study-body)] text-sm text-[#78716c]">
          El chip resaltado es la evaluación 1:1; el resto refuerza el mismo tema.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {topic.bankLinks.map((id) => {
            const isPrimary = id === topic.examCoverage.primaryId;
            return (
              <span
                key={id}
                className={`font-[family-name:var(--font-study-body)] ${
                  isPrimary ? "study-chip-primary" : "study-chip"
                }`}
              >
                {isPrimary ? "★ " : ""}
                {id}
              </span>
            );
          })}
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onToggle}
          className={`study-rough inline-flex items-center justify-center gap-2 px-5 py-3 font-[family-name:var(--font-study-body)] text-sm font-semibold ${
            done ? "bg-[#bbf7d0] text-[#14532d]" : "bg-[#1c1917] text-[#faf6ee]"
          }`}
        >
          {done ? (
            <>
              <Check size={16} /> Entendido
            </>
          ) : (
            <>
              <Circle size={16} /> Marcar como entendido
            </>
          )}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => onPrevNext(-1)}
            className="study-ghost-btn flex-1 disabled:opacity-30 sm:flex-none"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={idx >= track.topics.length - 1}
            onClick={() => onPrevNext(1)}
            className="study-ghost-btn flex-1 disabled:opacity-30 sm:flex-none"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
