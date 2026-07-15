"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "trialforge-study-music-muted";

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
 * Focus / learning ambience — distinct from exam Monument Valley crystal tones.
 * Soft warm pads + gentle breath swells + quiet air bed.
 * Designed to stay in the background and support calm attention (no melody earworms).
 */
function startStudyFocusAmbience(ctx: AudioContext, master: GainNode) {
  const now = ctx.currentTime;

  const bus = ctx.createGain();
  bus.gain.value = 1;
  bus.connect(master);

  // Quiet air/noise bed (concentration mask, very low)
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.4;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 420;
  noiseFilter.Q.value = 0.6;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.012;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(bus);
  noise.start(now);

  // Warm focus pads (open fifths / soft fifths — no piano attack)
  const padSpecs = [
    { freq: 146.83, gain: 0.03, type: "sine" as OscillatorType }, // D3
    { freq: 220.0, gain: 0.024, type: "sine" as OscillatorType }, // A3
    { freq: 293.66, gain: 0.018, type: "triangle" as OscillatorType }, // D4
  ];

  const padNodes: Array<{ osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode }> = [];

  padSpecs.forEach((spec, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = spec.type;
    osc.frequency.value = spec.freq;
    osc.detune.value = index === 2 ? 6 : -2;

    filter.type = "lowpass";
    filter.frequency.value = 900 - index * 80;

    // Soft ~8–10 Hz shimmer (calm alertness), very subtle
    lfo.type = "sine";
    lfo.frequency.value = 8.5 + index * 0.4;
    lfoGain.gain.value = spec.gain * 0.12;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(spec.gain, now + 2.8);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    osc.start(now);
    lfo.start(now);
    padNodes.push({ osc, gain, lfo });
  });

  // Slow breath swell — motivates “open” attention without grabbing it
  const breath = ctx.createOscillator();
  const breathGain = ctx.createGain();
  const breathFilter = ctx.createBiquadFilter();
  breath.type = "sine";
  breath.frequency.value = 174.61; // F3
  breathFilter.type = "lowpass";
  breathFilter.frequency.value = 600;
  breathGain.gain.value = 0.0001;
  breath.connect(breathFilter);
  breathFilter.connect(breathGain);
  breathGain.connect(bus);
  breath.start(now);

  let nextBreath = now + 6;
  const breathTimer = window.setInterval(() => {
    const t = ctx.currentTime;
    if (nextBreath <= t + 0.15) {
      const start = Math.max(t + 0.05, nextBreath);
      breathGain.gain.cancelScheduledValues(start);
      breathGain.gain.setValueAtTime(0.0001, start);
      breathGain.gain.exponentialRampToValueAtTime(0.022, start + 2.2);
      breathGain.gain.exponentialRampToValueAtTime(0.0001, start + 5.5);
      nextBreath = start + 9.5;
    }
  }, 200);

  return () => {
    window.clearInterval(breathTimer);
    try {
      noise.stop();
    } catch {
      // ignore
    }
    try {
      breath.stop();
    } catch {
      // ignore
    }
    for (const node of padNodes) {
      try {
        node.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
        node.osc.stop(ctx.currentTime + 0.4);
        node.lfo.stop(ctx.currentTime + 0.4);
      } catch {
        // ignore
      }
    }
    try {
      noise.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
      breath.disconnect();
      breathFilter.disconnect();
      breathGain.disconnect();
      bus.disconnect();
    } catch {
      // ignore
    }
  };
}

export function useStudyAmbience(active: boolean) {
  const [muted, setMuted] = useState(readMutedPreference);
  const [playing, setPlaying] = useState(false);
  const mutedRef = useRef(muted);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const applyVolume = useCallback((isMuted: boolean) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (master && ctx) {
      master.gain.setTargetAtTime(isMuted ? 0 : 0.8, ctx.currentTime, 0.1);
    }
  }, []);

  const ensureGraph = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctx();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = mutedRef.current ? 0 : 0.8;
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
    if (!stopRef.current) {
      stopRef.current = startStudyFocusAmbience(ctx, masterRef.current);
    }
    applyVolume(false);
    setPlaying(true);
  }, [active, ensureGraph, applyVolume]);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
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
