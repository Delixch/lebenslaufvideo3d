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
  radius: number;
  angle: number;
  speed: number;
  wobbleFreq: number;
  wobblePhase: number;
  tilt: number;
  size: number;
  diveAt: number;
  wingPhase: number;
};

const MOTH_COUNT = 6;

const createMoths = (): Moth[] =>
  Array.from({ length: MOTH_COUNT }, (_, index) => ({
    radius: 1.1 + Math.random() * 2.2,
    angle: Math.random() * Math.PI * 2,
    // Halbe fliegen herum, halbe dagegen; sonst wirkt es wie ein Karussell.
    speed: (0.25 + Math.random() * 0.5) * (index % 2 === 0 ? 1 : -1),
    wobbleFreq: 2.5 + Math.random() * 3.5,
    wobblePhase: Math.random() * Math.PI * 2,
    tilt: 0.45 + Math.random() * 0.35,
    size: 3 + Math.random() * 3,
    diveAt: 3 + Math.random() * 7,
    wingPhase: Math.random() * Math.PI * 2,
  }));

/**
 * Nachtfalter um die Laterne.
 *
 * Keine Bilder, keine Physik-Bibliothek: jede Motte fliegt eine Ellipse, der
 * zwei ungleiche Schwingungen überlagert sind — daraus entsteht das zittrige,
 * unentschlossene Flattern. Ab und zu stösst eine kurz zum Licht vor und kehrt
 * wieder um. Alles läuft in einer einzigen Schleife über transform.
 */
export const LampMoths: React.FC<LampMothsProps> = ({ centerX, centerY, bulbSize, active }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mothsRef = useRef<Moth[]>(createMoths());

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

      mothsRef.current.forEach((moth, index) => {
        const element = elements[index];
        if (!element) {
          return;
        }

        // Anflug ans Licht: kurzes Einatmen des Radius, dann zurück.
        const sinceDive = (time + moth.diveAt) % 9;
        const dive = sinceDive < 0.9 ? Math.sin((sinceDive / 0.9) * Math.PI) * 0.55 : 0;

        const wobble = Math.sin(time * moth.wobbleFreq + moth.wobblePhase) * 0.22;
        const jitter = Math.sin(time * 11.3 + index) * 0.05;
        const radius = bulbSize * (moth.radius + wobble + jitter - dive);

        const angle = moth.angle + time * moth.speed;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * moth.tilt;

        // Näher am Licht heller — Falter fangen den Schein auf ihren Flügeln.
        const closeness = Math.max(0, 1 - radius / (bulbSize * 3.4));
        const wings = 0.55 + Math.abs(Math.sin(time * 26 + moth.wingPhase)) * 0.45;

        element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scaleY(${wings.toFixed(
          3,
        )})`;
        element.style.opacity = (0.35 + closeness * 0.5).toFixed(3);
        element.style.filter = `blur(${(0.6 - closeness * 0.4).toFixed(2)}px) brightness(${(
          0.5 +
          closeness * 1.6
        ).toFixed(2)})`;
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
      {mothsRef.current.map((moth, index) => (
        <span
          key={index}
          className="absolute left-0 top-0 rounded-full"
          style={{
            width: `${moth.size}px`,
            height: `${moth.size * 0.62}px`,
            background:
              'radial-gradient(circle at 40% 40%, rgba(232,220,196,0.9), rgba(120,104,82,0.75) 55%, rgba(40,34,26,0.9) 100%)',
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
};
