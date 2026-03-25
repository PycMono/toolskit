#!/usr/bin/env python3
"""
Fix all issues from debug.md:
1. debugging.js - backtick syntax error (already fixed)
2. security-practical.js - remove duplicate/orphan definitions, fix structure
3. learn.html querySelector (already fixed)
4. index.html IP/Whois section (already fixed)
5. Middleware i18n (already fixed)
6. base.html lang switcher (already fixed)
"""
import re, os

BASE = "/Users/pengyachuan/work/go/src/PycMono/github/toolskit"

# ── 1. Check/fix security-practical.js ────────────────────────────────────────
sp = os.path.join(BASE, "static/js/learn-articles/security-practical.js")
with open(sp, "r", encoding="utf-8") as f:
    content = f.read()

print(f"security-practical.js: {len(content)} chars, {content.count(chr(10))} lines")

# Find all article slugs
slugs = re.findall(r'window\.LEARN_ARTICLES\["([^"]+)"\]', content)
print(f"Slugs found ({len(slugs)}): {slugs}")

dupes = [s for i, s in enumerate(slugs) if slugs.index(s) != i]
print(f"Duplicates: {dupes}")

# ── 2. Check debugging.js ──────────────────────────────────────────────────────
dbg = os.path.join(BASE, "static/js/learn-articles/debugging.js")
with open(dbg, "r", encoding="utf-8") as f:
    d = f.read()
lines = d.split("\n")
# Check line 339 area for unescaped backtick in zh: block
for i in range(335, 350):
    if i < len(lines):
        print(f"debugging.js L{i+1}: {lines[i][:80]}")

print("\n--- DONE ---")

