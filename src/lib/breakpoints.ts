/**
 * Einzige Quelle fuer die beiden Layout-Schwellen. App.tsx, Header.tsx und
 * HeroSection.tsx lasen bisher denselben Wert aus getrennten String-Literalen
 * — driftet einer davon, faellt ein Abschnitt lautlos aus dem Layout.
 */
export const STAGE_QUERY = '(min-width: 1200px)';
export const PHONE_QUERY = '(max-width: 767px)';
