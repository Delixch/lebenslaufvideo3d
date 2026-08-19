import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems, scrollToSection } from '../lib/nav';


const ARROWS_IN = [
  'M18 4 L18 11 M15 8.4 L18 11.4 L21 8.4',
  'M32 18 L25 18 M27.6 15 L24.6 18 L27.6 21',
  'M18 32 L18 25 M15 27.6 L18 24.6 L21 27.6',
  'M4 18 L11 18 M8.4 15 L11.4 18 L8.4 21',
];

const ARROWS_OUT = [
  'M18 11 L18 4 M15 6.6 L18 3.6 L21 6.6',
  'M25 18 L32 18 M29.4 15 L32.4 18 L29.4 21',
  'M18 25 L18 32 M15 29.4 L18 32.4 L21 29.4',
  'M11 18 L4 18 M6.6 15 L3.6 18 L6.6 21',
];

/**
 * Kern mit vier Pfeilen, die der Reihe nach aufleuchten — nach aussen heisst
 * oeffnen, nach innen einholen. Ersetzt jede Beschriftung.
 */
const ArrowMark: React.FC<{ direction: 'in' | 'out'; tone: string; core: string }> = ({
  direction,
  tone,
  core,
}) => (
  <svg viewBox="0 0 36 36" className="h-full w-full overflow-visible">
    <circle cx="18" cy="18" r="3.4" fill={core} />
    {(direction === 'in' ? ARROWS_IN : ARROWS_OUT).map((d, index) => (
      <motion.path
        key={d}
        d={d}
        fill="none"
        stroke={tone}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{
          duration: 1.8,
          times: [0, 0.35, 1],
          repeat: Infinity,
          delay: index * 0.18,
        }}
      />
    ))}
  </svg>
);

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
          width: `max(44px, calc(${coords.width} * 1.15))`,
          height: `max(44px, calc(${coords.width} * 1.15))`,
        }}
      >
        {!open && (
          <span className="absolute left-1/2 top-full mt-1 h-8 w-8 -translate-x-1/2">
            <ArrowMark direction="out" tone="rgba(255,226,172,0.85)" core="rgba(255,214,140,0.9)" />
          </span>
        )}
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
            initial={{ opacity: 0, scale: 0.4, x: 30, y: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.35, x: 34, y: -22 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute w-[56vw] max-w-[232px] px-5 pb-14 pt-4"
            style={{
              // Rechts unter der Laterne aufgehaengt, Wachstumspunkt oben rechts.
              // Links neben der Laterne, in der leeren Nebelflaeche unter dem
              // Schriftzug — dort deckt die Blase nichts Wichtiges zu.
              // Oben links ist die groesste freie Nebelflaeche; dort deckt die
              // Blase weder Schlagzeile noch Laterne zu.
              top: '52px',
              left: '-32px',
              transformOrigin: 'top right',
              // Kein flaches Gelb: warm und hell im Kern, zu den Raendern hin
              // dunkler Bronzeton und durchscheinend — als haette sich das
              // Laternenlicht im Nebel zur Menueform verdichtet.
              background:
                'radial-gradient(130% 120% at 76% 20%, rgba(255,224,164,0.96) 0%, rgba(248,199,122,0.94) 26%, rgba(226,166,92,0.9) 50%, rgba(196,134,68,0.86) 72%, rgba(158,102,50,0.82) 88%, rgba(120,76,36,0.78) 100%)',
              backdropFilter: 'blur(14px) saturate(120%)',
              WebkitBackdropFilter: 'blur(14px) saturate(120%)',
              border: '1px solid rgba(255,214,150,0.5)',
              // Stark ungleiche Radien: die Blase soll gewachsen wirken, nicht
              // gezeichnet.
              borderRadius: '58% 42% 34% 66% / 46% 62% 38% 54%',
              // Helligkeit haengt am selben Flackern wie die Laterne.
              opacity: 'calc(0.9 + var(--lamp-intensity, 1) * 0.1)',
              filter: 'brightness(calc(0.95 + var(--lamp-intensity, 1) * 0.05))',
              boxShadow:
                '0 0 30px rgba(234,179,8,0.28), 0 0 70px rgba(234,179,8,0.14), inset 0 0 30px rgba(255,206,130,0.25)',
            }}
          >
            {/* Zipfel zur Laterne hin: ein Tropfen an der rechten Flanke, dahinter
                ein kleiner Punkt — so ist die Richtung ohne Nachdenken lesbar. */}
            <span
              aria-hidden="true"
              className="absolute -right-[11px] top-[24%] h-5 w-6"
              style={{
                background:
                  'radial-gradient(120% 120% at 20% 40%, rgba(252,206,132,0.92) 0%, rgba(206,146,70,0.85) 55%, rgba(120,78,38,0.75) 100%)',
                border: '1px solid rgba(255,214,150,0.5)',
                borderLeft: 'none',
                opacity: 'calc(0.9 + var(--lamp-intensity, 1) * 0.1)',
                borderRadius: '20% 80% 60% 40% / 30% 90% 10% 70%',
                transform: 'rotate(-12deg)',
              }}
            />
            <span
              aria-hidden="true"
              className="absolute -right-[26px] top-[14%] h-[7px] w-[7px] rounded-full"
              style={{
                background: 'rgba(244,190,110,0.8)',
                border: '1px solid rgba(255,214,150,0.45)',
                opacity: 'calc(0.85 + var(--lamp-intensity, 1) * 0.15)',
              }}
            />

            <motion.ul
              className="flex origin-center flex-col gap-3"
              exit={{ opacity: 0, scale: 0.62 }}
              transition={{ duration: 0.16 }}
            >
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
                    className="w-full text-right text-[11.5px] font-semibold uppercase tracking-[0.26em] text-[#3A2412] transition-all active:font-bold active:text-[#120A04]"
                  >
                    {item.name}
                  </button>
                </motion.li>
              ))}
            </motion.ul>

            {/* Zeichen zum Einholen: ein Kern, vier Pfeile nach innen. Sie
                leuchten der Reihe nach auf, damit die Richtung — hinein —
                ohne Beschriftung lesbar ist. */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menü schliessen"
              className="group absolute bottom-3 right-4 h-11 w-11"
            >
              <ArrowMark
                direction="in"
                tone="rgba(255,226,172,0.92)"
                core="rgba(255,220,150,0.95)"
              />
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};
