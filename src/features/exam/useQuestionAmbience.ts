"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "trialforge-question-music-muted";
/** Kahoot Lobby Music (Official OST) — looped during MCQ practice sessions. */
const QUIZ_MUSIC_SRC = "/audio/kahoot-lobby.mp3";

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

export function useQuestionAmbience(active: boolean) {
  const [muted, setMuted] = useState(readMutedPreference);
  const [playing, setPlaying] = useState(false);
  const mutedRef = useRef(muted);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const audio = new Audio(QUIZ_MUSIC_SRC);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.55;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const start = useCallback(async () => {
    if (!active || mutedRef.current) return;
    const audio = ensureAudio();
    if (!audio) return;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      // Autoplay may be blocked until a user gesture; mute toggle / UI click retries.
      setPlaying(false);
    }
  }, [active, ensureAudio]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
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
    const audio = audioRef.current;
    if (muted) {
      if (audio) audio.pause();
      setPlaying(false);
      return;
    }
    if (active) void start();
  }, [muted, active, start]);

  useEffect(() => {
    return () => {
      stop();
      audioRef.current = null;
    };
  }, [stop]);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  return { muted, playing, toggleMuted, start };
}
