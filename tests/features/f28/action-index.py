#!/usr/bin/env python3
"""Rebuild the conservative migration hook inventory from the retained application UI."""
from pathlib import Path
import hashlib
import json
import re

root = Path(__file__).resolve().parents[3]
explicit = ['app/ui.inc', 'app/settings.inc', 'devshell/index.html', 'app/bimcraft.js',
            'app/app-autosave.js', 'app/host.js', 'app/help/help.js']
paths = [root / p for p in explicit]
paths += sorted(set((root / 'app').glob('*ui*.js')) | set((root / 'app').glob('*-view.js')))
files, entries = [], []
for path in dict.fromkeys(paths):
    source = path.relative_to(root).as_posix()
    content = path.read_text()
    files.append({'path': source, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    for line, text in enumerate(content.splitlines(), 1):
        hooks = sorted(set(re.findall(r'data-[a-z][a-z0-9-]*', text)))
        for hook in hooks:
            values = sorted(set(re.findall(re.escape(hook) + r'=[\"\']([^\"\'<>]*)[\"\']', text)))
            area = ('Documentation' if any(k in hook for k in ('msched','sheet','pb-','view-','draft','dim','callout'))
                    else 'Library / materials' if any(k in source for k in ('library','material','assembl'))
                    else 'Files / linked models' if any(k in source for k in ('folder','bundle','interop','links','host'))
                    else 'Help / settings / recovery' if any(k in source for k in ('help','settings','autosave'))
                    else 'Shared / existing UI')
            entries.append({'source': source, 'line': line, 'hook': hook,
                            'literalValues': values, 'area': area,
                            'route': 'Existing tools → Established layout; see the migrated-command checklist for bounded live exceptions'})
report = {
    'purpose': 'Conservative source inventory beyond the 116 reviewed ribbon entries. Includes action selectors and related fields/containers; a hook is not an enablement claim. Dynamic extension controls and delegated action families are included by source. Availability stays in the existing operations/command adapter. Regenerate with python3 tests/features/f28/action-index.py.',
    'files': files, 'entries': entries,
}
output = root / 'docs/features/f28/F28-C-ACTION-INDEX.json'
output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(json.dumps({'files': len(files), 'occurrences': len(entries), 'distinctHooks': len({e['hook'] for e in entries})}))
