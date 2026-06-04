import { useCallback, useEffect, useRef, useState } from 'react';

const MUSIC_SRC = '/audio/trivia-bg.mp3';
const VOLUME = 0.4;

// Clear legacy keys that forced music off
const LEGACY_KEYS = ['trivia-music-muted', 'trivia-music-enabled'];

export const useBackgroundMusic = () => {
  const audioRef = useRef(null);
  const enabledRef = useRef(true);
  const readyRef = useRef(false);
  const shouldBePlayingRef = useRef(false);

  const [enabled, setEnabled] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    for (const key of LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const attemptPlay = useCallback(async () => {
    if (
      !shouldBePlayingRef.current ||
      !enabledRef.current ||
      loadError ||
      !audioRef.current ||
      !readyRef.current
    ) {
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [loadError]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.muted = false;
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleReady = () => {
      readyRef.current = true;
      if (shouldBePlayingRef.current && enabledRef.current) {
        attemptPlay();
      }
    };

    const handleError = () => setLoadError(true);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('canplaythrough', handleReady);
    audio.addEventListener('loadeddata', handleReady);
    audio.addEventListener('error', handleError);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('canplaythrough', handleReady);
      audio.removeEventListener('loadeddata', handleReady);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.pause();
      audio.src = '';
      readyRef.current = false;
    };
  }, [attemptPlay]);

  const startMusic = useCallback(() => {
    shouldBePlayingRef.current = true;
    enabledRef.current = true;
    setEnabled(true);
    attemptPlay();
  }, [attemptPlay]);

  const stopMusic = useCallback(() => {
    shouldBePlayingRef.current = false;
    pause();
  }, [pause]);

  const toggleMusic = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      enabledRef.current = next;

      if (next && shouldBePlayingRef.current) {
        attemptPlay();
      } else {
        pause();
      }

      return next;
    });
  }, [attemptPlay, pause]);

  return {
    enabled,
    isPlaying,
    loadError,
    toggleMusic,
    startMusic,
    stopMusic,
  };
};
