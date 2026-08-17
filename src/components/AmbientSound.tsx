import React, { useCallback, useEffect, useRef, useState } from 'react';

const MUSIC_SRC = '/audio/background.mp3';
const MUSIC_VOLUME = 0.04;
const VIDEO_VOLUME = 0.12;
const FADE_MS = 1200;

/**
 * Ein Schalter für den Ton der Seite: er startet die Hintergrundmusik und
 * nimmt gleichzeitig die Stummschaltung vom Hero-Video. Beides blendet weich
 * ein, damit niemand erschrickt. Ohne Klick bleibt alles still — Browser
 * erlauben Ton ohne Nutzergeste ohnehin nicht.
 */
export const AmbientSound: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);

  const fadeTo = useCallback((element: HTMLMediaElement, target: number, onDone?: () => void) => {
    if (fadeRef.current) {
      window.clearInterval(fadeRef.current);
    }

    const start = element.volume;
    const startedAt = performance.now();
    fadeRef.current = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - startedAt) / FADE_MS);
      element.volume = start + (target - start) * progress;
      if (progress === 1) {
        window.clearInterval(fadeRef.current ?? 0);
        fadeRef.current = null;
        onDone?.();
      }
    }, 40);
  }, []);

  useEffect(() => {
    const video = document.querySelector('video');

    if (!enabled) {
      if (video) {
        video.muted = true;
      }
      const audio = audioRef.current;
      if (audio) {
        fadeTo(audio, 0, () => audio.pause());
      }
      return;
    }

    const audio =
      audioRef.current ??
      (() => {
        const element = new Audio(MUSIC_SRC);
        element.loop = true;
        element.preload = 'none';
        audioRef.current = element;
        return element;
      })();

    audio.volume = 0;
    void audio.play().catch(() => undefined);
    fadeTo(audio, MUSIC_VOLUME);

    if (video) {
      video.muted = false;
      video.volume = VIDEO_VOLUME;
      void video.play().catch(() => undefined);
    }
  }, [enabled, fadeTo]);

  useEffect(
    () => () => {
      if (fadeRef.current) {
        window.clearInterval(fadeRef.current);
      }
      audioRef.current?.pause();
    },
    [],
  );

  return (
    <button
      type="button"
      onClick={() => setEnabled((value) => !value)}
      aria-pressed={enabled}
      aria-label={enabled ? 'Klang ausschalten' : 'Klang einschalten'}
      title={enabled ? 'Klang aus' : 'Klang an'}
      className="fixed bottom-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#8C6D4F]/60 bg-black/60 text-[#E8DFD8] backdrop-blur-sm transition-all duration-300 hover:border-[#D4AF37] hover:text-[#F7E7C4] lg:bottom-10 lg:left-12"
    >
      <span
        className={`block h-2.5 w-2.5 rounded-full transition-all duration-500 ${
          enabled
            ? 'bg-[#D4AF37] shadow-[0_0_14px_rgba(212,175,55,0.9)] animate-pulse'
            : 'bg-[#8C6D4F]'
        }`}
      />
    </button>
  );
};
