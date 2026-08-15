#!/usr/bin/env bash
# Publiceer de huidige staat van deze map naar GitHub Pages.
# Gebruik: ./publish.sh ["korte omschrijving"]
set -euo pipefail
cd "$(dirname "$0")"
msg="${1:-iteratie $(date '+%Y-%m-%d %H:%M')}"
git add -A
if git diff --cached --quiet; then
  echo "Niets gewijzigd — niets te publiceren."
  exit 0
fi
git commit -q -m "$msg"
git push -q origin main
echo "Gepusht. GitHub Pages bouwt nu (~30-60 s)."
url="$(gh api "repos/{owner}/{repo}/pages" --jq .html_url 2>/dev/null || true)"
[ -n "$url" ] && echo "Live op: $url"
