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
 * Soft Kahoot-like "waiting for answer" loop:
 * warm pad + gentle arpeggio plucks + light pulse.
 */
function startThinkingLoop(ctx: AudioContext, master: GainNode) {
  const tempo = 92;
  const beat = 60 / tempo;
  const pattern = [261.63, 329.63, 392.0, 440.0, 392.0, 329.63];
  let note = 0;
  let beatCount = 0;
  const scheduleAhead = 0.12;
  let nextTime = ctx.currentTime + 0.05;

  function pluck(time: number, freq: number, gain = 0.045) {
    const osc = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const env = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);
    filt.type = "lowpass";
    filt.frequency.setValueAtTime(1800, time);
    filt.Q.setValueAtTime(0.7, time);
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(gain, time + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, time + beat * 0.9);
    osc.connect(filt);
    filt.connect(env);
    env.connect(master);
    osc.start(time);
    osc.stop(time + beat);
  }

  function softTick(time: number) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, time);
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(0.012, time + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
    osc.connect(env);
    env.connect(master);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  const pad = ctx.createOscillator();
  const pad2 = ctx.createOscillator();
  const padGain = ctx.createGain();
  const padFilter = ctx.createBiquadFilter();
  pad.type = "sine";
  pad2.type = "sine";
  pad.frequency.value = 130.81;
  pad2.frequency.value = 196.0;
  padFilter.type = "lowpass";
  padFilter.frequency.value = 520;
  padGain.gain.value = 0.035;
  pad.connect(padFilter);
  pad2.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(master);
  pad.start();
  pad2.start();

  const timer = window.setInterval(() => {
    const now = ctx.currentTime;
    while (nextTime < now + scheduleAhead) {
      const freq = pattern[note % pattern.length];
      pluck(nextTime, freq, beatCount % 4 === 0 ? 0.055 : 0.038);
      if (beatCount % 2 === 0) softTick(nextTime);
      note += 1;
      beatCount += 1;
      nextTime += beat;
    }
  }, 40);

  return () => {
    window.clearInterval(timer);
    try {
      pad.stop();
      pad2.stop();
    } catch {
      // ignore
    }
    pad.disconnect();
    pad2.disconnect();
    padFilter.disconnect();
    padGain.disconnect();
  };
}

export function useQuestionAmbience(active: boolean) {
  const [muted, setMuted] = useState(readMutedPreference);
  const [playing, setPlaying] = useState(false);
  const mutedRef = useRef(muted);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const stopLoopRef = useRef<(() => void) | null>(null);
  const bedRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const applyVolume = useCallback((isMuted: boolean) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (master && ctx) {
      master.gain.setTargetAtTime(isMuted ? 0 : 0.7, ctx.currentTime, 0.05);
    }
    if (bedRef.current) {
      bedRef.current.volume = isMuted ? 0 : 0.22;
    }
  }, []);

  const ensureGraph = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctx();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = mutedRef.current ? 0 : 0.7;
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
      stopLoopRef.current = startThinkingLoop(ctx, masterRef.current);
    }

    if (!bedRef.current) {
      const bed = new Audio("/audio/calm-theme.ogg");
      bed.loop = true;
      bed.volume = 0.22;
      bedRef.current = bed;
    }

    try {
      await bedRef.current.play();
    } catch {
      // Needs a gesture on some browsers; toggle control covers it.
    }

    applyVolume(false);
    setPlaying(true);
  }, [active, ensureGraph, applyVolume]);

  const stop = useCallback(() => {
    stopLoopRef.current?.();
    stopLoopRef.current = null;
    if (bedRef.current) {
      bedRef.current.pause();
      bedRef.current.currentTime = 0;
    }
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
      bedRef.current?.pause();
      setPlaying(false);
      return;
    }
    if (active) void start();
  }, [muted, active, applyVolume, start]);

  useEffect(() => {
    return () => {
      stop();
      bedRef.current = null;
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
