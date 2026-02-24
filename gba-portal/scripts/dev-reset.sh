#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_PATH="${ROOT_DIR}/../dev-server.log"

pids=$(ps -eo pid,cmd | grep -E 'npm run dev|next dev|next-server' | grep -v grep | awk '{print $1}' | tr '\n' ' ')
if [[ -n "${pids}" ]]; then
  kill -9 ${pids} || true
fi

cd "${ROOT_DIR}"
nohup npm run dev > "${LOG_PATH}" 2>&1 &
echo "dev server restarted (pid=$!)"
