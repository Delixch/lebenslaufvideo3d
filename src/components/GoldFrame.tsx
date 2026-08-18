import React from 'react';

/**
 * Ein Lichtpunkt, der ohne Unterlass am Fensterrand entlangläuft — oben,
 * rechts, unten, links. Reines CSS, liegt über allem, fängt aber keine Klicks.
 */
export const GoldFrame: React.FC = () => (
  <>
    <div className="edge-frame" aria-hidden="true">
      <span className="edge-frame__base" />
      <span className="edge-frame__runner" />
    </div>
    <div className="edge-frame__glow" aria-hidden="true" />
  </>
);
