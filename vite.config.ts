import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 5173 gehört dem 3D-Portfolio; so laufen beide Projekte nebeneinander.
  server: { port: 5174, host: true },
});