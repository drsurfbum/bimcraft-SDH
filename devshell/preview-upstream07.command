#!/bin/zsh
# Optional isolated candidate preview. A busy port fails without stopping its owner.
cd -- "${0:A:h:h}" || exit 1
exec node devshell/serve.mjs --host 127.0.0.1 --port 8067 --offline
