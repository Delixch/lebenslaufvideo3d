import React from 'react';

/**
 * Pfeil an der Wand, wie eine Halterung angeschraubt: der waagerechte Schenkel
 * sitzt bündig am rechten Fensterrand, der Pfeil zeigt nach oben. Er hängt
 * immer dort, scrollt mit und bringt den Besucher per Klick an den Anfang.
 */
export const ScrollRail: React.FC = () => {
  // Nicht window.scrollTo mit 'smooth': ein noch auslaufender Wheel- oder
  // Touch-Schwung bricht die eingebaute Animation sofort wieder ab, weshalb der
  // erste Klick oft wirkungslos blieb. Diese Fahrt setzt die Position in jedem
  // Bild selbst und laesst sich davon nicht abbringen.
  const toTop = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, 0);
      return;
    }

    const from = window.scrollY;
    if (from < 2) {
      return;
    }

    const start = performance.now();
    const duration = Math.min(900, 320 + from * 0.35);

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, Math.round(from * (1 - eased)));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Zum Seitenanfang"
      className="group fixed right-0 top-1/2 z-40 flex h-[92px] w-[68px] -translate-y-1/2 cursor-pointer items-center justify-end pl-3 pb-2 md:h-[116px] md:w-[86px]"
    >
      <img
        src="/ziplama.webp"
        alt=""
        className="h-full w-full object-contain transition-transform duration-300 group-hover:-translate-y-1 group-active:translate-y-0"
        style={{ filter: 'drop-shadow(0 0 18px rgba(234,179,8,0.45))' }}
      />
    </button>
  );
};
