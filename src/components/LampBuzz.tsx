import React, { useEffect, useRef } from 'react';

interface LampBuzzProps {
  /** Erst wenn die Laterne brennt, gibt es auch etwas zu hören. */
  active: boolean;
}

type Graph = {
  context: AudioContext;
  master: GainNode;
  crackle: (strength: number) => void;
  stop: () => void;
};

// Zeitpunkte in Prozent des sechs Sekunden langen lampFlicker-Durchlaufs, an
// denen das Licht springt. Das Knistern sitzt genau darauf.
const FLICKER_POINTS = [0.05, 0.09, 0.14, 0.2, 0.5, 0.53, 0.56, 0.86, 0.9, 0.94];
const CYCLE_MS = 6000;

const buildGraph = (): Graph => {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  // Trafobrummen: Netzfrequenz plus ihre erste Oberwelle, dumpf gefiltert.
  const hum = context.createGain();
  hum.gain.value = 0.03;
  const humFilter = context.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.value = 260;
  hum.connect(humFilter).connect(master);

  const voices = [50, 100, 150].map((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = index === 0 ? 'sine' : 'sawtooth';
    oscillator.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.value = index === 0 ? 0.7 : 0.18 / index;
    oscillator.connect(gain).connect(hum);
    oscillator.start();
    return oscillator;
  });

  // Knistern: sehr kurze Rauschstösse durch ein Hochpassfilter.
  const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.4, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  const crackle = (strength: number) => {
    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    source.playbackRate.value = 0.8 + Math.random() * 0.8;

    const filter = context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1400 + Math.random() * 2600;

    const gain = context.createGain();
    const now = context.currentTime;
    const peak = 0.05 + strength * 0.14;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03 + Math.random() * 0.05);

    source.connect(filter).connect(gain).connect(master);
    source.start(now);
    source.stop(now + 0.12);
  };

  return {
    context,
    master,
    crackle,
    stop: () => {
      voices.forEach((oscillator) => oscillator.stop());
      void context.close();
    },
  };
};

/**
 * Der Ton der kaputten Laterne: ein leises Netzbrummen, in das genau dann ein
 * Knistern fährt, wenn das Licht oben zuckt. Alles synthetisiert, keine Datei.
 * Läuft nur, wenn der Besucher den Klang eingeschaltet hat.
 */
export const LampBuzz: React.FC<LampBuzzProps> = ({ active }) => {
  const graphRef = useRef<Graph | null>(null);

  useEffect(() => {
    let timers: number[] = [];
    let cycle = 0;

    const start = () => {
      const graph = graphRef.current ?? buildGraph();
      graphRef.current = graph;
      void graph.context.resume();
      graph.master.gain.cancelScheduledValues(graph.context.currentTime);
      graph.master.gain.linearRampToValueAtTime(0.5, graph.context.currentTime + 1.2);

      const schedule = () => {
        FLICKER_POINTS.forEach((point) => {
          timers.push(
            window.setTimeout(() => graph.crackle(Math.random()), point * CYCLE_MS),
          );
        });
      };

      schedule();
      cycle = window.setInterval(schedule, CYCLE_MS);
    };

    const stop = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
      window.clearInterval(cycle);
      const graph = graphRef.current;
      if (graph) {
        graph.master.gain.cancelScheduledValues(graph.context.currentTime);
        graph.master.gain.linearRampToValueAtTime(0, graph.context.currentTime + 0.5);
      }
    };

    const onToggle = (event: Event) => {
      const enabled = (event as CustomEvent<boolean>).detail;
      if (enabled && active) {
        start();
      } else {
        stop();
      }
    };

    if (active && (window as unknown as { isSiteSoundEnabled?: boolean }).isSiteSoundEnabled) {
      start();
    }

    window.addEventListener('siteSoundToggle', onToggle);
    return () => {
      window.removeEventListener('siteSoundToggle', onToggle);
      stop();
    };
  }, [active]);

  useEffect(() => () => graphRef.current?.stop(), []);

  return null;
};
