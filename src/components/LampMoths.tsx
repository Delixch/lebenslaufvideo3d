import React, { useEffect, useRef } from 'react';

interface LampMothsProps {
  /** Mitte des Laternenglases, relativ zum umgebenden Container. */
  centerX: number;
  centerY: number;
  /** Durchmesser des Leuchtkerns; alle Bahnen werden daran gemessen. */
  bulbSize: number;
  active: boolean;
}

type Moth = {
  /** Bahnradius als Anteil des Kerndurchmessers — mit Stoss und Zittern bleibt alles unter 0.23, und so weit reicht das Glas. */
  radius: number;
  /** Umlauf pro Sekunde; Vorzeichen dreht die Richtung. */
  speed: number;
  angle: number;
  wobbleFreq: number;
  wobblePhase: number;
  /** Flachdrueckung der Ellipse: von vorn gesehen ist das Glas keine Scheibe. */
  tilt: number;
  /** Groesse als Anteil des Kerndurchmessers. */
  size: number;
  /** Sekunden zwischen zwei Stoessen ans Glas. */
  bumpEvery: number;
  bumpAt: number;
  wingFreq: number;
  wingPhase: number;
};

/**
 * Vier Falter, und zwar mit Absicht von Hand gesetzt statt ausgewuerfelt:
 * die Zahlen sind gegeneinander verstimmt (1.35 / 0.95 / 0.62 / 1.70 Umlaeufe,
 * Stoesse alle 3.1 / 4.7 / 6.3 / 8.9 s), damit sich kein gemeinsamer Takt
 * einstellt. Sobald zwei im Gleichschritt laufen, sieht man die Mechanik.
 */
const MOTHS: Moth[] = [
  {
    radius: 0.08,
    speed: 1.35,
    angle: 0,
    wobbleFreq: 3.1,
    wobblePhase: 0,
    tilt: 0.54,
    size: 0.05,
    bumpEvery: 3.1,
    bumpAt: 0.4,
    wingFreq: 22,
    wingPhase: 0,
  },
  {
    radius: 0.12,
    speed: -0.95,
    angle: 2.1,
    wobbleFreq: 4.3,
    wobblePhase: 1.7,
    tilt: 0.7,
    size: 0.042,
    bumpEvery: 4.7,
    bumpAt: 2.2,
    wingFreq: 27,
    wingPhase: 1.2,
  },
  {
    radius: 0.155,
    speed: 0.62,
    angle: 4.0,
    wobbleFreq: 2.3,
    wobblePhase: 3.4,
    tilt: 0.44,
    size: 0.058,
    bumpEvery: 6.3,
    bumpAt: 1.1,
    wingFreq: 19,
    wingPhase: 2.6,
  },
  {
    radius: 0.10,
    speed: -1.7,
    angle: 5.4,
    wobbleFreq: 5.7,
    wobblePhase: 5.1,
    tilt: 0.62,
    size: 0.036,
    bumpEvery: 8.9,
    bumpAt: 3.7,
    wingFreq: 31,
    wingPhase: 4.1,
  },
];

/**
 * Nachtfalter im Laternenglas.
 *
 * Sie fliegen nicht mehr aussen herum, sondern sind drin gefangen: dunkle
 * Silhouetten vor dem Leuchtkern, die ab und zu gegen das Glas stossen und
 * dabei kurz aufblitzen, wenn das Licht von vorn auf die Fluegel faellt. Das
 * Flackern der Laterne selbst bleibt unangetastet — daran haengt das Knistern
 * in LampBuzz.
 *
 * Keine Bilder, keine Physik-Bibliothek: jeder Falter fliegt eine Ellipse, der
 * zwei ungleiche Schwingungen ueberlagert sind. Alles laeuft in einer einzigen
 * Schleife ueber transform und opacity.
 */
export const LampMoths: React.FC<LampMothsProps> = ({ centerX, centerY, bulbSize, active }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const elements = Array.from(container.children) as HTMLElement[];
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const time = (now - start) / 1000;

      MOTHS.forEach((moth, index) => {
        const element = elements[index];
        if (!element) {
          return;
        }

        // Stoss ans Glas: der Radius schnellt kurz nach aussen und faellt
        // zurueck. Jeder Falter hat seinen eigenen Takt dafuer.
        const sinceBump = (time + moth.bumpAt) % moth.bumpEvery;
        const bump = sinceBump < 0.5 ? Math.sin((sinceBump / 0.5) * Math.PI) * 0.04 : 0;

        const wobble = Math.sin(time * moth.wobbleFreq + moth.wobblePhase) * 0.02;
        const jitter = Math.sin(time * 11.3 + index * 2.3) * 0.008;
        const radius = bulbSize * (moth.radius + wobble + jitter + bump);

        const angle = moth.angle + time * moth.speed;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * moth.tilt;

        // Die vordere Haelfte der Bahn liegt zwischen Auge und Gluehfaden:
        // dort ist der Falter am dunkelsten. Hinten verschluckt ihn das Licht.
        const front = (Math.sin(angle) + 1) / 2;
        const wings = 0.5 + Math.abs(Math.sin(time * moth.wingFreq + moth.wingPhase)) * 0.5;
        const size = bulbSize * moth.size;

        element.style.width = `${size.toFixed(2)}px`;
        element.style.height = `${(size * 0.62).toFixed(2)}px`;
        element.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(
          1,
        )}px) translate(-50%, -50%) scaleY(${wings.toFixed(3)})`;
        // Beim Stoss blitzt er auf, sonst bleibt er Schatten.
        element.style.opacity = (0.3 + front * 0.62 + bump * 1.4).toFixed(3);
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, bulbSize, centerX, centerY]);

  if (!active) {
    return null;
  }

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      {MOTHS.map((_, index) => (
        <span
          key={index}
          className="absolute left-0 top-0 rounded-full"
          style={{
            // Gegen das Licht gesehen ist ein Falter fast schwarz; nur der
            // Rand der Fluegel laesst etwas durch.
            background:
              'radial-gradient(circle at 42% 38%, rgba(26,20,14,0.96), rgba(38,28,18,0.92) 58%, rgba(96,74,44,0.55) 100%)',
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
};
