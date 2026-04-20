#!/bin/bash
# Resume Analyser — isolated project
# No conflicts with other projects
# Frontend: http://localhost:5176
# Backend:  http://localhost:8002

ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "Starting Resume Analyser..."
echo "  UI  → http://localhost:5176"
echo "  API → http://localhost:8002"
echo ""

cd "$ROOT"
python3 -m uvicorn api:app --port 8002 --reload &
API_PID=$!

npm run dev &
UI_PID=$!

trap "kill $API_PID $UI_PID 2>/dev/null" EXIT INT TERM
wait
