import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems, scrollToSection } from '../lib/nav';

interface LampMenuProps {
  /** Position und Groesse des Laternenglases, vom Hero ausgemessen. */
  coords: { top: string; left: string; width: string };
  /** Erst wenn die Laterne im Bild steht, darf sie schalten. */
  active: boolean;
  /** Meldet dem Hero, ob das Licht brennen soll. */
  onToggle: (on: boolean) => void;
}

/**
 * Die Laterne als Menueschalter.
 *
 * Ein Tippen aufs Glas zuendet das Licht und laesst daneben eine organische
 * Blase aufgehen, die aus der Laterne zu wachsen scheint. Ein Eintrag schliesst
 * sie und springt zum Abschnitt; nochmal aufs Glas, ein Tippen daneben oder
 * Escape schliessen sie ohne Sprung. Die Falter fliegen unbeirrt weiter.
 */
export const LampMenu: React.FC<LampMenuProps> = ({ coords, active, onToggle }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onToggle(open);
  }, [open, onToggle]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    // In der naechsten Schleife anmelden, sonst schliesst der oeffnende Tipp
    // sofort wieder.
    const timer = window.setTimeout(
      () => window.addEventListener('pointerdown', onPointer),
      0,
    );

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      window.clearTimeout(timer);
    };
  }, [open]);

  if (!active) {
    return null;
  }

  const choose = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-[45] md:hidden">
      {/* Im Foto brennt die Laterne bereits; solange sie aus sein soll, wird das
          Glas abgedunkelt. */}
      <motion.span
        aria-hidden="true"
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.45 }}
        style={{
          top: coords.top,
          left: coords.left,
          width: `calc(${coords.width} * 2.6)`,
          height: `calc(${coords.width} * 2.6)`,
          background:
            'radial-gradient(circle, rgba(10,8,6,0.96) 0%, rgba(10,8,6,0.9) 34%, rgba(12,10,8,0.6) 58%, rgba(14,11,9,0.25) 76%, transparent 100%)',
          mixBlendMode: 'multiply',
          filter: 'blur(4px)',
        }}
      />

      {/* Schaltflaeche auf dem Glas; groesser als das Glas, damit der Daumen trifft */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Menü schliessen' : 'Menü öffnen'}
        aria-expanded={open}
        className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          top: coords.top,
          // Etwas nach rechts: der Griffpunkt sitzt sonst neben dem Glas.
          left: `calc(${coords.left} + 10px)`,
          width: `max(56px, calc(${coords.width} * 1.6))`,
          height: `max(56px, calc(${coords.width} * 1.6))`,
        }}
      >
        {/* Ruhiges Pulsieren am Glas */}
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={
            open
              ? { boxShadow: '0 0 0 1px rgba(234,179,8,0.45)' }
              : {
                  boxShadow: [
                    '0 0 0 0 rgba(234,179,8,0.0)',
                    '0 0 0 7px rgba(234,179,8,0.16)',
                    '0 0 0 0 rgba(234,179,8,0.0)',
                  ],
                }
          }
          transition={open ? { duration: 0.3 } : { duration: 2.4, repeat: Infinity }}
        />

        {/* Beschriftung: ohne sie erkennt niemand die Laterne als Schalter */}
        <motion.span
          className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.4em]"
          animate={
            open
              ? { color: 'rgba(247,231,196,0.95)', opacity: 1 }
              : { color: 'rgba(234,216,199,0.75)', opacity: [0.45, 1, 0.45] }
          }
          transition={open ? { duration: 0.3 } : { duration: 2.4, repeat: Infinity }}
        >
          {open ? 'Off' : 'On'}
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              top: coords.top,
              left: coords.left,
              width: `calc(${coords.width} * 7)`,
              height: `calc(${coords.width} * 7)`,
              background:
                'radial-gradient(circle, rgba(255,246,214,0.20) 0%, rgba(250,226,170,0.10) 30%, rgba(220,190,140,0.04) 55%, transparent 78%)',
              mixBlendMode: 'screen',
              filter: 'blur(30px)',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute w-[56vw] max-w-[232px] px-5 py-4"
            style={{
              // Rechts unter der Laterne aufgehaengt, Wachstumspunkt oben rechts.
              // Links neben der Laterne, in der leeren Nebelflaeche unter dem
              // Schriftzug — dort deckt die Blase nichts Wichtiges zu.
              // Oben links ist die groesste freie Nebelflaeche; dort deckt die
              // Blase weder Schlagzeile noch Laterne zu.
              top: '68px',
              left: '-32px',
              transformOrigin: 'top right',
              background: 'rgba(6,5,4,0.9)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(212,175,55,0.35)',
              // Bewusst ungleiche Radien: die Blase soll gewachsen wirken,
              // nicht gezeichnet.
              borderRadius: '46% 54% 40% 60% / 52% 44% 56% 48%',
              boxShadow: '0 0 30px rgba(234,179,8,0.12), inset 0 0 24px rgba(0,0,0,0.6)',
            }}
          >
            {/* Zipfel zur Laterne hin */}
            <span
              aria-hidden="true"
              className="absolute -top-[7px] right-5 h-4 w-4 rotate-45"
              style={{
                background: 'rgba(6,5,4,0.9)',
                borderTop: '1px solid rgba(212,175,55,0.35)',
                borderRight: '1px solid rgba(212,175,55,0.35)',
                borderRadius: '4px 0 0 0',
              }}
            />

            <ul className="flex flex-col gap-3">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + index * 0.045, duration: 0.25 }}
                >
                  <button
                    type="button"
                    onClick={() => choose(item.id)}
                    className="w-full text-right text-[13px] font-semibold uppercase tracking-[0.28em] text-[#EAD8C7] transition-colors active:text-[#F7E7C4]"
                  >
                    {item.name}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};
