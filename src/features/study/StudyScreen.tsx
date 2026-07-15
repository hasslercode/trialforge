"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Circle, Code2, Lightbulb, Map, Sparkles } from "lucide-react";
import { loadStudyProgress, saveStudyProgress } from "@/infrastructure/storage/progress.repository";
import {
  allTopicIds,
  getTopic,
  getTrack,
  studyTracks,
  type StudyTopic,
  type StudyTrack,
} from "./curriculum";
import "./study.css";

type StudyProgress = Record<string, boolean>;

function topicKey(trackId: string, topicId: string) {
  return `${trackId}::${topicId}`;
}

export function StudyScreen({ onBack }: { onBack: () => void }) {
  const [progress, setProgress] = useState<StudyProgress>({});
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

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
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        {!loaded ? (
          <p className="font-[family-name:var(--font-study-body)] text-sm text-[var(--study-muted)]">
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

      <header className="study-glass relative mb-6 flex min-h-[420px] overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <img
          src="/illustrations/study-hero.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,32,0.96)_0%,rgba(11,16,32,0.82)_38%,rgba(11,16,32,0.36)_100%)]"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(0deg,rgba(11,16,32,0.94),transparent)]" aria-hidden />
        <div className="relative z-10 flex max-w-2xl flex-col justify-end">
          <p className="study-hand text-lg text-[var(--study-cyan)] sm:text-xl">Modo estudio</p>
          <h1 className="study-hand mt-1 text-4xl leading-none text-[var(--study-text)] sm:text-6xl">
            Estudiar el challenge
          </h1>
          <p className="mt-4 max-w-xl font-[family-name:var(--font-study-body)] text-sm leading-7 text-[var(--study-muted)] sm:text-base">
            Temas del challenge contados con analogías de niño y dibujos de pizarra. Cada tema tiene una
            explicación corta para repasar antes del simulacro. Marca lo que ya entiendes; se guarda en
            este dispositivo.
          </p>

          <div className="study-sticky study-sticky-lemon mt-6 inline-flex w-fit items-center gap-3 px-4 py-3">
            <Sparkles size={18} className="text-[#fde68a]" />
            <div className="font-[family-name:var(--font-study-body)] text-sm text-[#fde68a]">
              <strong className="study-hand text-lg">
                {doneCount}/{total}
              </strong>{" "}
              temas · {pct}% del mapa
            </div>
          </div>
        </div>
      </header>

      <section className="study-glass mb-8 rounded-[1.6rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="study-hand text-2xl text-[var(--study-text)]">Progreso del reto</p>
            <p className="mt-1 font-[family-name:var(--font-study-body)] text-sm text-[var(--study-muted)]">
              {doneCount}/{total} temas · {pct}% del mapa
            </p>
          </div>
          <div className="study-chip-primary font-[family-name:var(--font-study-body)]">{pct}% completado</div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full border border-[var(--study-border)] bg-[rgba(7,11,22,0.62)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--study-accent),var(--study-magenta),var(--study-cyan))] shadow-[0_0_24px_rgba(139,124,246,0.45)] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      {/* Desktop: soft cosmic path */}
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
            stroke="rgba(167, 139, 250, 0.42)"
            strokeWidth="0.8"
            strokeDasharray="4 7"
            opacity="0.55"
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
        <div
          className="absolute bottom-4 left-[1.15rem] top-4 w-px bg-[linear-gradient(var(--study-accent),var(--study-cyan))] opacity-40"
          aria-hidden
        />
        {studyTracks.map((track, i) => {
          const trackDone = track.topics.filter((t) => progress[topicKey(track.id, t.id)]).length;
          return (
            <li key={track.id} className="relative pl-10">
              <span
                className="study-hand absolute left-0 top-5 grid size-9 place-items-center rounded-full border border-[var(--study-border)] bg-[rgba(17,24,43,0.88)] text-sm text-[var(--study-text)]"
                style={{ boxShadow: `0 0 22px ${track.fill}55` }}
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

      <aside className="study-sticky study-sticky-sky mt-12 max-w-lg p-5 sm:mt-16">
        <p className="study-hand flex items-center gap-2 text-xl text-[var(--study-cyan)]">
          <Lightbulb size={20} /> Tip de estudio
        </p>
        <p className="mt-2 font-[family-name:var(--font-study-body)] text-sm leading-6 text-[var(--study-muted)]">
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
  const accentStyle = {
    "--track-accent": track.fill,
    "--track-ink": track.ink,
  } as CSSProperties;

  return (
    <button
      onClick={onOpen}
      className={`study-glass group relative w-full overflow-hidden rounded-[1.5rem] text-left transition duration-300 hover:-translate-y-1 hover:border-[rgba(167,139,250,0.5)] hover:shadow-[0_24px_70px_rgba(139,124,246,0.22)] ${
        compact ? "p-4" : "p-5"
      }`}
      style={accentStyle}
    >
      <span
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-35 blur-3xl transition duration-300 group-hover:opacity-55"
        style={{ background: track.fill }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-x-5 top-0 h-px opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${track.fill}, transparent)` }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <span
          className="study-hand grid size-11 place-items-center rounded-2xl border border-[var(--study-border)] bg-[rgba(7,11,22,0.45)] text-2xl"
          style={{ boxShadow: `0 0 24px ${track.fill}44` }}
        >
          {track.emoji}
        </span>
        <span className="study-hand rounded-full border border-[var(--study-border)] bg-[rgba(17,24,43,0.68)] px-2.5 py-1 text-xs text-[var(--study-text)]">
          {complete ? "listo ✓" : `${done}/${track.topics.length}`}
        </span>
      </div>
      <p className="study-hand mt-4 text-xs uppercase tracking-wide text-[var(--study-cyan)]">Tramo {index}</p>
      <h2 className="study-hand mt-1 text-2xl leading-none text-[var(--study-text)] sm:text-3xl">{track.title}</h2>
      <p className="mt-2 font-[family-name:var(--font-study-body)] text-sm leading-6 text-[var(--study-muted)]">
        {track.tagline}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 font-[family-name:var(--font-study-body)] text-xs font-semibold text-[var(--study-text)] opacity-0 transition group-hover:opacity-100">
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

      <div className="study-glass relative mb-8 overflow-hidden rounded-[2rem] p-5 sm:p-7">
        <span
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full opacity-30 blur-3xl"
          style={{ background: track.fill }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative grid size-28 shrink-0 place-items-center sm:size-36">
            <span
              className="absolute inset-3 rounded-full blur-2xl"
              style={{ background: `${track.fill}55` }}
              aria-hidden
            />
            <img
              src="/illustrations/study-crystal.png"
              alt=""
              aria-hidden
              className="relative h-full w-full object-contain drop-shadow-[0_18px_32px_rgba(139,124,246,0.25)]"
            />
          </div>
          <div>
            <p className="study-hand text-3xl">{track.emoji}</p>
            <h1 className="study-hand mt-2 text-3xl text-[var(--study-text)] sm:text-5xl">{track.title}</h1>
            <p className="mt-2 max-w-2xl font-[family-name:var(--font-study-body)] text-sm text-[var(--study-muted)] sm:text-base">
              {track.tagline}
            </p>
          </div>
        </div>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2">
        {track.topics.map((topic, i) => {
          const done = Boolean(progress[topicKey(track.id, topic.id)]);
          return (
            <li key={topic.id}>
              <div
                className={`study-glass flex h-full flex-col rounded-[1.35rem] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(103,232,249,0.42)] ${
                  done ? "border-[rgba(134,239,172,0.38)] shadow-[0_0_32px_rgba(134,239,172,0.12)]" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onToggle(topic.id)}
                    className="mt-0.5 shrink-0 rounded-full p-0.5 text-[var(--study-muted)] transition hover:text-[var(--study-cyan)]"
                    aria-label={done ? "Marcar como pendiente" : "Marcar como entendido"}
                  >
                    {done ? <Check size={20} className="text-[#bbf7d0]" /> : <Circle size={20} />}
                  </button>
                  <button type="button" onClick={() => onOpenTopic(topic.id)} className="min-w-0 flex-1 text-left">
                    <p className="study-hand text-xs text-[var(--study-cyan)]">Tema {i + 1}</p>
                    <h3 className="study-hand text-xl leading-tight text-[var(--study-text)] sm:text-2xl">{topic.title}</h3>
                    <p className="mt-2 line-clamp-2 font-[family-name:var(--font-study-body)] text-sm leading-6 text-[var(--study-muted)]">
                      {topic.kidAnalogy}
                    </p>
                    <span className="mt-3 inline-block font-[family-name:var(--font-study-body)] text-xs font-semibold text-[var(--study-text)]">
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

      <p className="study-hand text-sm text-[var(--study-cyan)]">
        {track.emoji} · tema {idx + 1}/{track.topics.length}
      </p>
      <h1 className="study-hand mt-1 text-3xl text-[var(--study-text)] sm:text-5xl">{topic.title}</h1>
      <p className="mt-3 font-[family-name:var(--font-study-body)] text-sm leading-7 text-[var(--study-muted)] sm:text-base">
        {topic.summary}
      </p>

      <div className="study-glass mt-8 rounded-[1.5rem] p-5 sm:p-6">
        <p className="study-hand text-xl text-[#fdba74]">Como si tuvieras 8 años…</p>
        <p className="mt-3 font-[family-name:var(--font-study-body)] text-base leading-7 text-[var(--study-text)] sm:text-lg">
          {topic.kidAnalogy}
        </p>
      </div>

      <section className="study-glass mt-8 rounded-[1.5rem] p-5 sm:p-6">
        <h2 className="study-hand text-2xl text-[var(--study-text)]">Puntos clave</h2>
        <ul className="mt-4 space-y-3 font-[family-name:var(--font-study-body)] text-sm leading-6 text-[var(--study-muted)]">
          {topic.keyPoints.map((point) => (
            <li key={point} className="flex gap-3">
              <span className="study-hand mt-0.5 text-[var(--study-cyan)]" aria-hidden>
                →
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        {topic.remember && (
          <p className="study-sticky study-sticky-lemon mt-6 inline-block px-3 py-2 font-[family-name:var(--font-study-body)] text-sm text-[#fde68a]">
            <strong className="study-hand">Recuerda:</strong> {topic.remember}
          </p>
        )}
      </section>

      {topic.examples.length > 0 && (
        <section className="study-glass mt-8 rounded-[1.5rem] p-5 sm:p-6">
          <h2 className="study-hand flex items-center gap-2 text-2xl text-[var(--study-text)]">
            <Code2 size={22} className="text-[var(--study-cyan)]" />
            Ejemplos
          </h2>
          <p className="mt-1 font-[family-name:var(--font-study-body)] text-sm text-[var(--study-muted)]">
            Código y casos concretos para este tema.
          </p>
          <ol className="mt-4 space-y-4">
            {topic.examples.map((example, i) => (
              <li
                key={`${example.title}-${i}`}
                className="rounded-[1.15rem] border border-[var(--study-border-soft)] bg-[rgba(7,11,22,0.28)] p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="study-hand text-lg text-[var(--study-text)]">{example.title}</h3>
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
                  <p className="mt-3 font-[family-name:var(--font-study-body)] text-xs leading-5 text-[var(--study-muted)]">
                    {example.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 font-[family-name:var(--font-study-body)] text-sm font-semibold transition ${
            done
              ? "study-glass rounded-full border-[rgba(134,239,172,0.38)] text-[#bbf7d0] shadow-[0_0_28px_rgba(134,239,172,0.14)]"
              : "study-cta"
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
