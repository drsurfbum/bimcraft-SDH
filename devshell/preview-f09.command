#!/bin/zsh
set -eu
cd "$(dirname "$0")/.."
exec node devshell/serve.mjs --port 8061 --host 127.0.0.1 --offline
