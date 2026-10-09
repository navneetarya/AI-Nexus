#!/usr/bin/env python3
"""
migrate_partnerstack_links.py  (Phase 1.3, Oct 2026)

Replaces every hardcoded ElevenLabs / Murf AI PartnerStack affiliate URL with a reference to the
single source of truth, AFFILIATE_LINKS (lib/affiliate-links.ts -> constants.ts):

    https://try.elevenlabs.io/earuakibkmz9  ->  AFFILIATE_LINKS['elevenlabs']
    https://get.murf.ai/ilypoqhxvxsj        ->  AFFILIATE_LINKS['murf-ai']

Why: these two links were hardcoded in ~25 posts, so changing them (or tracking them) meant a
sitewide find-and-replace, and scripts/check-affiliate-links.mjs could not see them.

What it does, per occurrence:
  * inside a `template literal` (blog content)      -> ${AFFILIATE_LINKS['key']}
  * a whole single-quoted 'https://...' string      -> AFFILIATE_LINKS['key']
  * inside a // or /* */ comment                    -> left alone (the guard ignores comments)
  * anything else (e.g. inside a "double-quoted" string, where ${} would NOT interpolate)
                                                    -> NOT changed, listed in the report
Also adds the AFFILIATE_LINKS import where missing, and upgrades a bare rel="noopener" on a
migrated ElevenLabs/Murf anchor to the site-standard sponsored rel.

Usage (run from the repo root):
    python3 migrate_partnerstack_links.py            # dry run: report only, writes nothing
    python3 migrate_partnerstack_links.py --write    # apply
Then:  node scripts/check-affiliate-links.mjs   (must pass)  and your validator sequence.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
WRITE = '--write' in sys.argv

URLS = {
    'https://try.elevenlabs.io/earuakibkmz9': 'elevenlabs',
    'https://get.murf.ai/ilypoqhxvxsj': 'murf-ai',
}


def target_files():
    files = []
    for folder in ('blog', 'pages'):
        d = os.path.join(ROOT, folder)
        if os.path.isdir(d):
            files += [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.endswith(('.ts', '.tsx'))]
    # stray copies that sit in the repo root (the guard scans these too)
    files += [os.path.join(ROOT, f) for f in sorted(os.listdir(ROOT))
              if f.endswith('.ts') and f not in ('constants.ts', 'vite.config.ts')]
    return files


def scan(src):
    """Return a list of (start, end, kind) for every URL occurrence, where kind is one of
    'template', 'single_whole', 'comment', 'other'. A small TS-aware scanner: it tracks comments,
    quoted strings and template literals (including nested ${ ... } expressions)."""
    hits = []
    n = len(src)

    def record(i, kind):
        for url in URLS:
            if src.startswith(url, i):
                hits.append((i, i + len(url), kind, url))

    def scan_code(i, stop_on_brace):
        depth = 0
        while i < n:
            c = src[i]
            nxt = src[i + 1] if i + 1 < n else ''
            if c == '/' and nxt == '/':
                j = src.find('\n', i)
                j = n if j == -1 else j
                for k in range(i, j):
                    record(k, 'comment')
                i = j
            elif c == '/' and nxt == '*':
                j = src.find('*/', i + 2)
                j = n if j == -1 else j + 2
                for k in range(i, j):
                    record(k, 'comment')
                i = j
            elif c in ('"', "'"):
                i = scan_string(i, c)
            elif c == '`':
                i = scan_template(i + 1)
            elif c == '{':
                depth += 1
                i += 1
            elif c == '}':
                if stop_on_brace and depth == 0:
                    return i + 1
                depth -= 1
                i += 1
            else:
                i += 1
        return i

    def scan_string(i, q):
        j = i + 1
        while j < n and src[j] != q:
            if src[j] == '\\':
                j += 1
            j += 1
        body_start, body_end = i + 1, j
        for url in URLS:
            if src[body_start:body_end] == url and q == "'":
                hits.append((i, j + 1, 'single_whole', url))
            else:
                k = src.find(url, body_start, body_end)
                while k != -1:
                    hits.append((k, k + len(url), 'other', url))
                    k = src.find(url, k + 1, body_end)
        return j + 1

    def scan_template(i):
        while i < n:
            c = src[i]
            if c == '\\':
                i += 2
            elif c == '`':
                return i + 1
            elif c == '$' and src.startswith('${', i):
                i = scan_code(i + 2, True)
            else:
                record(i, 'template')
                i += 1
        return i

    scan_code(0, False)
    # de-duplicate (a comment char loop can record the same start once per char) and sort
    uniq = {(a, b, k, u) for (a, b, k, u) in hits}
    return sorted(uniq)


def add_import(src, rel):
    if re.search(r"import\s*\{[^}]*\bAFFILIATE_LINKS\b[^}]*\}\s*from", src):
        return src, False
    imports = list(re.finditer(r"^import .*?;[ \t]*$", src, flags=re.M))
    line = f"import {{ AFFILIATE_LINKS }} from '{rel}';"
    if imports:
        pos = imports[-1].end()
        return src[:pos] + '\n' + line + src[pos:], True
    return line + '\n' + src, True


def main():
    total = 0
    changed_files = 0
    skipped = []
    for path in target_files():
        src = open(path, encoding='utf-8').read()
        if not any(u in src for u in URLS):
            continue
        hits = [h for h in scan(src) if h[2] in ('template', 'single_whole', 'other')]
        todo = [h for h in hits if h[2] in ('template', 'single_whole')]
        for h in hits:
            if h[2] == 'other':
                skipped.append((os.path.relpath(path, ROOT), h[3]))
        if not todo:
            continue
        out, last = [], 0
        for a, b, kind, url in todo:
            key = URLS[url]
            out.append(src[last:a])
            out.append("${AFFILIATE_LINKS['%s']}" % key if kind == 'template' else "AFFILIATE_LINKS['%s']" % key)
            last = b
        out.append(src[last:])
        new = ''.join(out)
        # bare rel="noopener" on a migrated anchor -> site-standard sponsored rel
        new = re.sub(
            r"(<a\s[^>]*href=\"\$\{AFFILIATE_LINKS\['(?:elevenlabs|murf-ai)'\]\}\"[^>]*?)rel=\"noopener\"",
            r'\1rel="sponsored nofollow noopener noreferrer"', new)
        rel_dir = os.path.relpath(os.path.dirname(path), ROOT)
        rel_import = './lib/affiliate-links' if rel_dir == '.' else '../lib/affiliate-links'
        new, added = add_import(new, rel_import)
        total += len(todo)
        changed_files += 1
        print(f"{'WROTE ' if WRITE else 'would change'}  {os.path.relpath(path, ROOT)}: "
              f"{len(todo)} link(s){' + import' if added else ''}")
        if WRITE:
            open(path, 'w', encoding='utf-8', newline='').write(new)
    print(f"\n{'Applied' if WRITE else 'Dry run'}: {total} link(s) in {changed_files} file(s).")
    if skipped:
        print("\nNOT changed (inside a \"double-quoted\" string, where ${} would not interpolate) - fix by hand:")
        for f, u in skipped:
            print(f"  {f}: {u}")
    if not WRITE:
        print("\nRe-run with --write to apply.")


if __name__ == '__main__':
    main()
