"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "trialforge-question-music-muted";

function readMutedPreference() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMutedPreference(muted: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // ignore
  }
}

/**
 * Quiz-show tension bed (Kahoot / Who Wants to Be a Millionaire energy):
 * heartbeat bass, tense minor pad, clock ticks — urgent, not relaxing.
 */
function startQuizShowTension(ctx: AudioContext, master: GainNode) {
  const now = ctx.currentTime;
  const nodes: AudioNode[] = [];
  const oscillators: OscillatorNode[] = [];

  const bus = ctx.createGain();
  bus.gain.value = 1;
  bus.connect(master);
  nodes.push(bus);

  // Dark low shelf so the pulse reads as pressure, not chill pad.
  const tone = ctx.createBiquadFilter();
  tone.type = "lowshelf";
  tone.frequency.value = 180;
  tone.gain.value = 3.5;
  tone.connect(bus);
  nodes.push(tone);

  // --- Heartbeat / countdown bass pulse (~100 BPM feel) ---
  const pulseLfo = ctx.createOscillator();
  const pulseDepth = ctx.createGain();
  const pulseOsc = ctx.createOscillator();
  const pulseGain = ctx.createGain();
  const pulseFilter = ctx.createBiquadFilter();

  pulseOsc.type = "triangle";
  pulseOsc.frequency.value = 55; // A1
  pulseFilter.type = "lowpass";
  pulseFilter.frequency.value = 220;
  pulseFilter.Q.value = 0.7;

  pulseLfo.type = "sine";
  pulseLfo.frequency.value = 1.67; // ~100 BPM
  // Keep pulseGain above silence so modulation never crosses into negative gain.
  pulseDepth.gain.value = 0.03;
  pulseGain.gain.value = 0.045;

  pulseLfo.connect(pulseDepth);
  pulseDepth.connect(pulseGain.gain);
  pulseOsc.connect(pulseFilter);
  pulseFilter.connect(pulseGain);
  pulseGain.connect(tone);

  pulseOsc.start(now);
  pulseLfo.start(now);
  oscillators.push(pulseOsc, pulseLfo);
  nodes.push(pulseDepth, pulseGain, pulseFilter);

  // --- Tense minor pad (A minor–ish cluster) ---
  const padFreqs = [110, 130.81, 164.81, 196.0]; // A2 C3 E3 G3
  padFreqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const filt = ctx.createBiquadFilter();

    osc.type = index % 2 === 0 ? "sawtooth" : "triangle";
    osc.frequency.value = freq;
    osc.detune.value = index * 4 - 6;

    filt.type = "lowpass";
    filt.frequency.value = 480 + index * 40;
    filt.Q.value = 1.1;

    lfo.type = "sine";
    lfo.frequency.value = 0.12 + index * 0.03;
    lfoGain.gain.value = 0.012;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.022 - index * 0.002, now + 0.9);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(filt);
    filt.connect(gain);
    gain.connect(bus);

    osc.start(now);
    lfo.start(now);
    oscillators.push(osc, lfo);
    nodes.push(gain, filt, lfoGain);
  });

  // --- High tension shimmer (thin, slightly dissonant) ---
  const shimmer = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  const shimmerLfo = ctx.createOscillator();
  const shimmerLfoGain = ctx.createGain();
  shimmer.type = "triangle";
  shimmer.frequency.value = 880; // A5
  shimmerLfo.type = "sine";
  shimmerLfo.frequency.value = 4.5;
  shimmerLfoGain.gain.value = 0.01;
  shimmerGain.gain.value = 0.012;
  shimmerLfo.connect(shimmerLfoGain);
  shimmerLfoGain.connect(shimmerGain.gain);
  shimmer.connect(shimmerGain);
  shimmerGain.connect(bus);
  shimmer.start(now);
  shimmerLfo.start(now);
  oscillators.push(shimmer, shimmerLfo);
  nodes.push(shimmerGain, shimmerLfoGain);

  // --- Clock / quiz tick ---
  let nextTick = now + 0.15;

  function tick(time: number, accent: boolean) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    osc.type = "square";
    osc.frequency.setValueAtTime(accent ? 920 : 740, time);
    filt.type = "bandpass";
    filt.frequency.setValueAtTime(accent ? 1400 : 1100, time);
    filt.Q.value = 6;
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(accent ? 0.04 : 0.025, time + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
    osc.connect(filt);
    filt.connect(env);
    env.connect(bus);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  // Occasional rising "final answer?" sting
  let nextSting = now + 6.5;

  function sting(time: number) {
    const freqs = [220, 277.18, 329.63, 440]; // rising A C# E A
    freqs.forEach((freq, i) => {
      const t = time + i * 0.14;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.035, t + 0.04);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      osc.connect(env);
      env.connect(bus);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  let beat = 0;
  const timer = window.setInterval(() => {
    const t = ctx.currentTime;
    while (nextTick < t + 0.25) {
      tick(nextTick, beat % 4 === 0);
      beat += 1;
      nextTick += 0.6; // steady quiz clock
    }
    while (nextSting < t + 0.25) {
      sting(nextSting);
      nextSting += 8.5 + (beat % 3) * 1.2;
    }
  }, 50);

  return () => {
    window.clearInterval(timer);
    const stopAt = ctx.currentTime;
    for (const osc of oscillators) {
      try {
        osc.stop(stopAt + 0.35);
      } catch {
        // ignore
      }
      try {
        osc.disconnect();
      } catch {
        // ignore
      }
    }
    for (const node of nodes) {
      try {
        node.disconnect();
      } catch {
        // ignore
      }
    }
  };
}

export function useQuestionAmbience(active: boolean) {
  const [muted, setMuted] = useState(readMutedPreference);
  const [playing, setPlaying] = useState(false);
  const mutedRef = useRef(muted);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const stopLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const applyVolume = useCallback((isMuted: boolean) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (master && ctx) {
      master.gain.setTargetAtTime(isMuted ? 0 : 0.78, ctx.currentTime, 0.08);
    }
  }, []);

  const ensureGraph = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctx();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = mutedRef.current ? 0 : 0.78;
      masterRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const start = useCallback(async () => {
    if (!active || mutedRef.current) return;
    const ctx = await ensureGraph();
    if (!ctx || !masterRef.current) return;

    if (!stopLoopRef.current) {
      stopLoopRef.current = startQuizShowTension(ctx, masterRef.current);
    }

    applyVolume(false);
    setPlaying(true);
  }, [active, ensureGraph, applyVolume]);

  const stop = useCallback(() => {
    stopLoopRef.current?.();
    stopLoopRef.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!active) {
      stop();
      return;
    }
    void start();
    return () => stop();
  }, [active, start, stop]);

  useEffect(() => {
    writeMutedPreference(muted);
    applyVolume(muted);
    if (muted) {
      setPlaying(false);
      return;
    }
    if (active) void start();
  }, [muted, active, applyVolume, start]);

  useEffect(() => {
    return () => {
      stop();
      void ctxRef.current?.close();
      ctxRef.current = null;
      masterRef.current = null;
    };
  }, [stop]);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  return { muted, playing, toggleMuted, start };
}
