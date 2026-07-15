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
 * Monument Valley–like ambience: soft synth drones + sparse crystalline tones.
 * No guitar, no piano — only sine/triangle pads and airy high notes.
 */
function startMonumentValleyAmbience(ctx: AudioContext, master: GainNode) {
  const now = ctx.currentTime;

  // Wide airy filter into master
  const air = ctx.createBiquadFilter();
  air.type = "lowpass";
  air.frequency.value = 1400;
  air.Q.value = 0.4;
  air.connect(master);

  // Soft drifting drone cluster (pure synth)
  const droneFreqs = [110, 164.81, 220, 277.18]; // A2 E3 A3 C#4
  const droneNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  droneFreqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = index % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    // Tiny detune for shimmer
    osc.detune.value = index * 3 - 4;

    lfo.type = "sine";
    lfo.frequency.value = 0.05 + index * 0.02;
    lfoGain.gain.value = 0.008 + index * 0.002;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.028 - index * 0.003, now + 2.4);

    osc.connect(gain);
    gain.connect(air);
    osc.start(now);
    lfo.start(now);
    droneNodes.push({ osc, gain });
  });

  // Sparse crystalline motif (bell-soft sine, not piano)
  const motif = [329.63, 392.0, 493.88, 587.33, 523.25, 392.0]; // E G B D C G
  let motifIndex = 0;
  let nextChime = now + 2.8;

  function chime(time: number, freq: number) {
    const osc = ctx.createOscillator();
    const partial = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const env = ctx.createGain();

    osc.type = "sine";
    partial.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    partial.frequency.setValueAtTime(freq * 2.01, time);

    filt.type = "lowpass";
    filt.frequency.setValueAtTime(2400, time);
    filt.frequency.exponentialRampToValueAtTime(900, time + 2.2);

    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(0.03, time + 0.08);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 2.6);

    const partialGain = ctx.createGain();
    partialGain.gain.value = 0.35;

    osc.connect(filt);
    partial.connect(partialGain);
    partialGain.connect(filt);
    filt.connect(env);
    env.connect(air);

    osc.start(time);
    partial.start(time);
    osc.stop(time + 2.8);
    partial.stop(time + 2.8);
  }

  const timer = window.setInterval(() => {
    const t = ctx.currentTime;
    while (nextChime < t + 0.2) {
      chime(nextChime, motif[motifIndex % motif.length]);
      motifIndex += 1;
      // Irregular, contemplative spacing
      nextChime += 2.4 + (motifIndex % 3) * 0.55;
    }
  }, 80);

  return () => {
    window.clearInterval(timer);
    for (const node of droneNodes) {
      try {
        node.gain.gain.cancelScheduledValues(ctx.currentTime);
        node.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
        node.osc.stop(ctx.currentTime + 0.5);
      } catch {
        // ignore
      }
      try {
        node.osc.disconnect();
        node.gain.disconnect();
      } catch {
        // ignore
      }
    }
    try {
      air.disconnect();
    } catch {
      // ignore
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
      master.gain.setTargetAtTime(isMuted ? 0 : 0.85, ctx.currentTime, 0.08);
    }
  }, []);

  const ensureGraph = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctx();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = mutedRef.current ? 0 : 0.85;
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
      stopLoopRef.current = startMonumentValleyAmbience(ctx, masterRef.current);
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
