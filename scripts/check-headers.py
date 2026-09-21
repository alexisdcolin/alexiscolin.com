#!/usr/bin/env python3
"""Guard the _headers invariant: no file may match two blocks that set the
same header.

Cloudflare Pages joins duplicate header values with a comma instead of
replacing them, so two matching Cache-Control blocks yield
"max-age=31536000, immutable, max-age=604800" — two conflicting lifetimes
that clients resolve inconsistently. Splats are greedy and cross directory
boundaries, which makes the overlap easy to reintroduce by adding a file.

No dependencies; run it from the repo root.
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {".git", ".github", ".claude", "scripts", "node_modules"}
SKIP_NAMES = {"_headers", "_redirects", ".DS_Store"}


def parse(path):
    """Yield (pattern, [header names]) for each block of the _headers file."""
    rules, current = [], None
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if not line.startswith((" ", "\t")):
            current = (line.strip(), [])
            rules.append(current)
        elif current is not None and ":" in line:
            current[1].append(line.split(":", 1)[0].strip())
    return rules


def matches(pattern, url):
    return re.fullmatch(re.escape(pattern).replace(r"\*", ".*"), url) is not None


def served_files():
    for p in sorted(ROOT.rglob("*")):
        if not p.is_file():
            continue
        rel = p.relative_to(ROOT)
        if set(rel.parts) & SKIP_DIRS or rel.name in SKIP_NAMES:
            continue
        yield "/" + rel.as_posix()


def main():
    rules = parse(ROOT / "_headers")
    if not rules:
        print("_headers: aucun bloc analysé", file=sys.stderr)
        return 1

    failures = []
    for url in served_files():
        seen = defaultdict(list)
        for pattern, headers in rules:
            if matches(pattern, url):
                for h in headers:
                    seen[h].append(pattern)
        for header, patterns in seen.items():
            if len(patterns) > 1:
                failures.append((url, header, patterns))

    if failures:
        print("Collision d'en-têtes — Pages concaténerait les valeurs :\n")
        for url, header, patterns in failures:
            print(f"  {url}\n    {header} défini par {', '.join(patterns)}\n")
        return 1

    print(f"_headers OK — {len(rules)} blocs, aucune collision "
          f"sur {sum(1 for _ in served_files())} fichiers servis")
    return 0


if __name__ == "__main__":
    sys.exit(main())
