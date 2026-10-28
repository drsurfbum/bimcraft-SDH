#!/bin/sh
cd "$(dirname "$0")/.." || exit 1
if lsof -nP -iTCP:8059 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port 8059 is occupied; preserve that preview and choose another free port."
  exit 1
fi
exec node devshell/serve.mjs --host 127.0.0.1 --port 8059 --offline
