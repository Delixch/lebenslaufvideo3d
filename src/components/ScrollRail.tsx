import React, { useEffect, useState } from 'react';

/**
 * Bronzeschiene an der Wand mit dem Pfeil nach oben.
 *
 * Sie klebt am Bildschirmrand, sobald der Besucher ein Stueck gescrollt hat,
 * und bringt ihn per Klick zurueck an den Anfang. Das Bild ist in zwei Teile
 * zerlegt: die Spitze als eigenes Stueck, der gerade Schaft als Kachel, die
 * sich vertikal wiederholt — so wird die Steintextur bei keiner Seitenlaenge
 * gestaucht.
 *
 * Links am Desktop, wo die Laterne steht; rechts am Handy, weil dort die Wand
 * mit der Laterne ist und der linke Rand unter iOS die Zurueck-Geste traegt.
 */
export const ScrollRail: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-0 top-0 z-40 w-[38px] transition-opacity duration-700 md:w-[52px] ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      } right-[6px] md:left-[6px] md:right-auto`}
    >
      {/* Schaft: eine Kachel, vertikal gewiederholt */}
      <div
        className="absolute inset-x-0 bottom-0 top-[56px] md:top-[76px]"
        style={{
          backgroundImage: 'url(/rail-tile.webp)',
          backgroundRepeat: 'repeat-y',
          backgroundSize: '100% auto',
          filter: 'drop-shadow(0 0 12px rgba(234,179,8,0.15))',
        }}
      />

      <button
        type="button"
        onClick={toTop}
        aria-label="Zum Seitenanfang"
        className="group absolute inset-x-0 top-0 h-[56px] cursor-pointer md:h-[76px]"
      >
        <img
          src="/rail-head.webp"
          alt=""
          className="h-full w-full object-fill transition-transform duration-300 group-hover:-translate-y-1 group-active:translate-y-0"
          style={{ filter: 'drop-shadow(0 0 14px rgba(234,179,8,0.35))' }}
        />
      </button>
    </div>
  );
};
