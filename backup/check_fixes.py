#!/usr/bin/env python3
import re
BASE = "/Users/pengyachuan/work/go/src/PycMono/github/toolskit"

def read(path):
    with open(f"{BASE}/{path}") as f:
        return f.read()

sp = read("static/js/learn-articles/security-practical.js")
slugs = re.findall(r'window\.LEARN_ARTICLES\["([^"]+)"\]', sp)
dupes = [s for i,s in enumerate(slugs) if slugs.index(s)!=i]
print(f"security-practical: {len(slugs)} slugs, dupes={dupes}")

lines = read("static/js/learn-articles/debugging.js").split("\n")
print(f"debugging.js L339: {lines[338].strip()[:80]}")

lh = read("templates/json/learn.html")
print(f"learn.html querySelector fix: {'safeSlug' in lh}")

idx = read("templates/index.html")
print(f"index.html compact grid: {'tools-grid--compact' in idx}")
print(f"index.html whois section closed: {idx.count('</section>') >= 5}")

mw = read("middleware/i18n.go")
print(f"middleware ja/ko/spa: {all(l in mw for l in ['ja','ko','spa'])}")

bh = read("templates/base.html")
print(f"base.html 5 langs: {all(l in bh for l in ['ja','ko','spa','zh','en'])}")

jh = read("templates/json/home.html")
print(f"json/home.html 5 langs: {all(l in jh for l in ['ja','ko','spa'])}")

jt = read("templates/json/tool.html")
print(f"json/tool.html 5 langs: {all(l in jt for l in ['ja','ko','spa'])}")

jb = read("templates/json/_base.html")
print(f"json/_base.html has main.js: {'main.js' in jb}")

print("\n=== ALL CHECKS DONE ===")

