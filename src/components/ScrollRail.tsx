import React from 'react';

/**
 * Pfeil an der Wand, wie eine Halterung angeschraubt: der waagerechte Schenkel
 * sitzt bündig am rechten Fensterrand, der Pfeil zeigt nach oben. Er hängt
 * immer dort, scrollt mit und bringt den Besucher per Klick an den Anfang.
 */
export const ScrollRail: React.FC = () => {
  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Zum Seitenanfang"
      className="group fixed right-0 top-1/2 z-40 h-[76px] w-[74px] -translate-y-1/2 cursor-pointer md:h-[104px] md:w-[102px]"
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
