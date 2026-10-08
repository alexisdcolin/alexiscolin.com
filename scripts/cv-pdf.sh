#!/bin/sh
# Prints the CV to the two PDFs the site offers for download. Needs Google
# Chrome, on a Mac: the CV is set in Helvetica Neue (cv.css), and its two-page
# fit depends on it. Run by .github/workflows/cv-pdf.yml; runs locally just the same.
set -eu
cd "$(dirname "$0")/.."
chrome=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}

# Printed aside first: a CV that no longer fits must not replace the PDFs
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# The file names match cv.pdf.file in i18n.js, which the site links to
for doc in fr:Alexis-Colin-CV en:Alexis-Colin-Resume; do
  # No analytics beacon: a print is not a visit. Fatal logs only, and no GPU:
  # a runner without a display or a graphics card otherwise fills the log
  # with errors that change nothing to the print.
  "$chrome" --headless=new --no-pdf-header-footer --virtual-time-budget=5000 \
    --log-level=3 --disable-gpu \
    --host-resolver-rules='MAP static.cloudflareinsights.com ~NOTFOUND' \
    --print-to-pdf="$tmp/${doc#*:}.pdf" "file://$PWD/cv.html?lang=${doc%%:*}"
done

# Two pages at most, or nothing moves. A print that differs from the committed
# copy only by what Chrome stamps on it, its date and its version, leaves that
# copy in place: nothing new to commit.
python3 - "$tmp" <<'EOF'
import os, re, subprocess, sys

tmp = sys.argv[1]
names = sorted(os.listdir(tmp))
prints = {name: open(os.path.join(tmp, name), 'rb').read() for name in names}
for name, pdf in prints.items():
    pages = len(re.findall(rb'/Type\s*/Page(?!s)', pdf))
    print(f'{name}: {pages} page(s)')
    if not 1 <= pages <= 2:
        sys.exit(f'{name}: the CV must fit on two pages')

# Creator holds the user agent, whose parentheses come escaped
undated = lambda pdf: re.sub(rb'D:\d{14}[^)]*|/(Creator|Producer) \((?:\\.|[^\\)])*\)', b'', pdf)
for name, pdf in prints.items():
    dest = os.path.join('assets', 'cv', name)
    old = subprocess.run(['git', 'show', f'HEAD:{dest}'], capture_output=True).stdout
    if not (old and undated(old) == undated(pdf)):
        with open(dest, 'wb') as f:
            f.write(pdf)
EOF
