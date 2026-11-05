import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: la carpeta dist funciona servida desde cualquier ruta.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
});
