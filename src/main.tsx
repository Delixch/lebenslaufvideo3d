import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// TypeScript tip kontrolüne takılmadan güvenli çağrı
if (typeof window !== 'undefined') {
  (window as any).__dropBoot?.();
  (window as any).__appReadyAfter = Date.now() - ((window as any).__bootStart ?? Date.now());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Messmodus für unterwegs: /?debug zeigt die Ladezeiten direkt auf dem Gerät.
if (new URLSearchParams(window.location.search).has('debug')) {
  window.addEventListener('load', () => {
    window.setTimeout(() => {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      const paint = performance
        .getEntriesByType('paint')
        .map(
          (entry) =>
            `${entry.name.replace('first-contentful-paint', 'FCP')}: ${Math.round(entry.startTime)}ms`,
        )
        .join(' · ');
      const heaviest = performance
        .getEntriesByType('resource')
        .map((entry) => entry as PerformanceResourceTiming)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 4)
        .map(
          (entry) =>
            `${entry.name.split('/').pop()?.slice(0, 20)} — ${Math.round(entry.duration)}ms / ${Math.round(
              entry.transferSize / 1024,
            )}KB`,
        )
        .join('<br>');

      const panel = document.createElement('div');
      panel.style.cssText =
        'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#0A0806ee;color:#EAD8C7;font:11px/1.6 monospace;padding:10px 12px;border-top:1px solid #8C6D4F';
      panel.innerHTML = `TTFB ${Math.round(navigation.responseStart)}ms · DOM ${Math.round(
        navigation.domContentLoadedEventEnd,
      )}ms · load ${Math.round(navigation.loadEventEnd)}ms<br>${paint} · JS aktiv: ${
        (window as any).__appReadyAfter ?? '?'
      }ms · Startschicht weg: ${(window as any).__bootRemovedAfter ?? '?'}ms<br>${heaviest}`;
      document.body.append(panel);
    }, 500);
  });
}
