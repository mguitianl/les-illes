#!/bin/bash
# Compila la app y la sirve en la red local para abrirla en el iPad.
set -e
cd "$(dirname "$0")/../app"
npm run build >/dev/null
IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
echo ""
echo "  En el iPad (misma wifi):  http://$IP:8000/"
echo "  En el Mac:                http://localhost:8000/"
echo ""
echo "  Deja esta ventana abierta mientras juega. Ctrl+C para parar."
npx vite preview --host --port 8000 --strictPort
