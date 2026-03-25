#!/usr/bin/env python3
import sys

def find_backtick_issues(filepath):
    with open(filepath) as f:
        content = f.read()

    # Proper JS template literal parser
    in_template = False
    template_start_line = -1
    i = 0
    n = len(content)

    while i < n:
        ch = content[i]

        if not in_template:
            if ch == '`':
                in_template = True
                template_start_line = content[:i].count('\n') + 1
            i += 1
        else:
            if ch == '\\':
                i += 2  # skip escaped character
                continue
            if ch == '$' and i+1 < n and content[i+1] == '{':
                # Template expression ${...} — skip to matching }
                depth = 1
                i += 2
                while i < n and depth > 0:
                    if content[i] == '{':
                        depth += 1
                    elif content[i] == '}':
                        depth -= 1
                    elif content[i] == '\\':
                        i += 1  # skip next char
                    i += 1
                continue
            if ch == '`':
                in_template = False
            i += 1

    if in_template:
        print(f"PROBLEM: Unclosed template literal starting at line {template_start_line}")
    else:
        print("OK: All template literals properly closed")

def check_debugging():
    filepath = '/Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/learn-articles/debugging.js'
    print(f"\n=== Checking {filepath} ===")
    find_backtick_issues(filepath)

def check_security():
    filepath = '/Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/learn-articles/security-practical.js'
    print(f"\n=== Checking {filepath} ===")
    find_backtick_issues(filepath)

check_debugging()
check_security()

# Also check if there are raw backticks inside HTML content (between template literal delimiters)
print("\n=== Scanning for raw backticks inside template content ===")
for filepath in [
    '/Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/learn-articles/debugging.js',
    '/Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/learn-articles/security-practical.js',
]:
    with open(filepath) as f:
        content = f.read()
    lines = content.split('\n')
    print(f"\nFile: {filepath}")
    # Simple heuristic: find lines that have backticks that are NOT at the start of a template assignment
    # Template assignments are: `en: \`` or `zh: \`` or `\`` at end of template
    count = 0
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if '`' in stripped:
            # Check if it's a valid template delimiter line
            is_delimiter = (
                stripped.startswith('zh: `') or
                stripped.startswith('en: `') or
                stripped.startswith('ja: `') or
                stripped.startswith('ko: `') or
                stripped.startswith('spa: `') or
                stripped == '`' or
                stripped == '`,' or
                stripped.startswith('`,') or
                stripped.startswith('`}') or
                stripped.startswith('};') or
                ('window.LEARN_ARTICLES' in stripped)
            )
            if not is_delimiter:
                # Check if backtick is escaped with backslash
                # A raw backtick inside content would be problematic
                raw_count = 0
                j = 0
                while j < len(line):
                    if line[j] == '\\':
                        j += 2
                        continue
                    if line[j] == '`':
                        raw_count += 1
                    j += 1
                if raw_count > 0:
                    print(f"  Line {i}: {repr(line[:80])}")
                    count += 1
    if count == 0:
        print("  No suspicious backticks found")

