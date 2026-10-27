#!/bin/sh
cd "$(dirname "$0")/.." || exit 1
node tests/features/f08/fixture.mjs || exit 1
node devshell/serve.mjs --host 127.0.0.1 --port 8040 --offline
