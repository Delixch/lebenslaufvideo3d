/**
 * Gemeinsame Navigationsdaten: Kopfzeile und Laternenmenue zeigen dieselben
 * Abschnitte, damit die Liste nicht an zwei Stellen auseinanderlaeuft.
 */
export const navItems = [
  { name: 'ÜBER MICH', href: '#about', id: 'about' },
  { name: 'PROJEKTE', href: '#work', id: 'work' },
  { name: 'SKILLS', href: '#skills', id: 'skills' },
  { name: 'ERFAHRUNG', href: '#experience', id: 'experience' },
  { name: 'KONTAKT', href: '#contact', id: 'contact' },
];

const HEADER_OFFSET = 80;
const SETTLE_TRIES = 10;
const SETTLE_STEP_MS = 150;
const DRIFT_TOLERANCE = 8;

/**
 * Sprung zu einem Abschnitt, der nachkorrigiert.
 *
 * Beim allerersten Aufruf steht das Layout noch nicht: iOS klappt die
 * Adressleiste ein, Schriften und Bilder setzen sich, das Overlay blendet aus.
 * Ein einmaliger Sprung landet dann zu hoch — beim zweiten Tippen stimmt es,
 * weil inzwischen alles steht. Darum wird nach dem Sprung noch etwa anderthalb
 * Sekunden lang gemessen und bei Abweichung nachgezogen.
 */
export const scrollToSection = (id: string): void => {
  const jump = () => {
    const element = document.getElementById(id);
    if (!element) {
      return 0;
    }

    const drift = element.getBoundingClientRect().top - HEADER_OFFSET;
    if (Math.abs(drift) > DRIFT_TOLERANCE) {
      window.scrollTo({ top: window.scrollY + drift, behavior: 'auto' });
    }

    return drift;
  };

  let tries = 0;
  const settle = () => {
    jump();
    tries += 1;
    if (tries < SETTLE_TRIES) {
      window.setTimeout(settle, SETTLE_STEP_MS);
    }
  };

  // Erst wenn das Overlay wirklich verschwunden ist, hat Messen einen Sinn.
  window.setTimeout(settle, 320);
};

