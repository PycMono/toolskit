#!/usr/bin/env python3
"""
Generate learn-articles JS files from Markdown source files.
Reads MD files from needs/jsonv2/material/json-learn-articles/
Outputs JS files to static/js/learn-articles/
"""
import os
import re
import json

ARTICLES_DIR = "needs/jsonv2/material/json-learn-articles"
OUTPUT_DIR = "static/js/learn-articles"

# Mapping: MD filename (without number prefix) -> slug used in the site
# Based on json-learn-I-04_文章内容体系.md
SLUG_MAP = {
    "what-is-json": "what-is-json",
    "json-syntax-rules": "json-syntax-rules",
    "json-data-types": "json-data-types",
    "json-objects": "json-objects",
    "json-arrays": "json-arrays",
    "json-strings-escaping": "json-strings-escaping",
    "json-numbers-booleans-null": "json-numbers-booleans-null",
    "json-nesting": "json-nesting",
    "first-json-file": "first-json-file",
    "json-formatting-beautify": "json-formatting-beautify",
    "python-json": "python-json",
    "javascript-json": "javascript-json",
    "java-json": "java-json",
    "go-json": "go-json",
    "php-json": "php-json",
    "csharp-json": "csharp-json",
    "ruby-json": "ruby-json",
    "rust-json": "rust-json",
    "swift-json": "swift-json",
    "typescript-json": "typescript-json",
    "common-json-mistakes": "common-json-mistakes",
    "json-parse-errors": "json-parse-errors",
    "unexpected-token": "unexpected-token",
    "unexpected-end-of-json": "unexpected-end-of-json",
    "json-syntax-error-debug": "json-syntax-error-debug",
    "json-debug-tools": "json-debug-tools",
    "json-vs-xml": "json-vs-xml",
    "json-vs-yaml": "json-vs-yaml",
    "json-vs-csv": "json-vs-csv",
    "json-vs-protobuf": "json-vs-protobuf",
    "json5-jsonc": "json5-jsonc",
    "json-schema-intro": "json-schema-intro",
    "json-schema-advanced": "json-schema-advanced",
    "jsonpath": "jsonpath",
    "jq-guide": "jq-guide",
    "jwt": "jwt",
    "json-ld": "json-ld",
    "json-patch": "json-patch",
    "json-pointer": "json-pointer",
    "ndjson": "ndjson",
    "geojson": "geojson",
    "json-security": "json-security",
    "json-injection": "json-injection",
    "json-performance": "json-performance",
    "json-streaming": "json-streaming",
    "json-compression": "json-compression",
    "mongodb-json": "mongodb-json",
    "postgresql-json": "postgresql-json",
    "elasticsearch-json": "elasticsearch-json",
    "rest-api-json": "rest-api-json",
    "graphql-json": "graphql-json",
    "json-config": "json-config",
    "json-ai-llm": "json-ai-llm",
}

# Group articles by JS file
GROUPS = {
    "basics": [
        "what-is-json", "json-syntax-rules", "json-data-types", "json-objects",
        "json-arrays", "json-strings-escaping", "json-numbers-booleans-null",
        "json-nesting", "first-json-file", "json-formatting-beautify",
    ],
    "language-guides": [
        "python-json", "javascript-json", "java-json", "go-json",
        "php-json", "csharp-json", "ruby-json", "rust-json",
        "swift-json", "typescript-json",
    ],
    "debugging": [
        "common-json-mistakes", "json-parse-errors", "unexpected-token",
        "unexpected-end-of-json", "json-syntax-error-debug", "json-debug-tools",
    ],
    "comparison": [
        "json-vs-xml", "json-vs-yaml", "json-vs-csv", "json-vs-protobuf", "json5-jsonc",
    ],
    "advanced": [
        "json-schema-intro", "json-schema-advanced", "jsonpath", "jq-guide",
        "jwt", "json-ld", "json-patch", "json-pointer", "ndjson", "geojson",
    ],
    "security-practical": [
        "json-security", "json-injection", "json-performance", "json-streaming",
        "json-compression", "mongodb-json", "postgresql-json", "elasticsearch-json",
        "rest-api-json", "graphql-json", "json-config", "json-ai-llm",
    ],
}


def md_to_html(md_text):
    """Convert Markdown to HTML (basic converter)."""
    # Remove front matter / meta line
    lines = md_text.split('\n')
    result = []
    i = 0
    in_code_block = False
    code_lang = ''
    code_lines = []

    while i < len(lines):
        line = lines[i]

        # Skip the blockquote meta line at top (> **分类**: ...)
        if line.startswith('> **分类**') or line.startswith('> **Category**'):
            i += 1
            continue

        # Code blocks
        if line.startswith('```'):
            if not in_code_block:
                in_code_block = True
                code_lang = line[3:].strip()
                code_lines = []
            else:
                in_code_block = False
                code_content = '\n'.join(code_lines)
                # Escape HTML
                code_content = code_content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                lang_class = f' class="language-{code_lang}"' if code_lang else ''
                result.append(f'<pre><code{lang_class}>{code_content}</code></pre>')
                code_lines = []
                code_lang = ''
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # H1
        if line.startswith('# '):
            text = line[2:].strip()
            text = inline_md(text)
            result.append(f'<h1>{text}</h1>')
            i += 1
            continue

        # H2
        if line.startswith('## '):
            text = line[3:].strip()
            text = inline_md(text)
            result.append(f'<h2>{text}</h2>')
            i += 1
            continue

        # H3
        if line.startswith('### '):
            text = line[4:].strip()
            text = inline_md(text)
            result.append(f'<h3>{text}</h3>')
            i += 1
            continue

        # H4
        if line.startswith('#### '):
            text = line[5:].strip()
            text = inline_md(text)
            result.append(f'<h4>{text}</h4>')
            i += 1
            continue

        # Horizontal rule
        if re.match(r'^---+$', line.strip()):
            result.append('<hr>')
            i += 1
            continue

        # Table
        if '|' in line and i + 1 < len(lines) and re.match(r'^\|[\s\-:|]+\|', lines[i+1]):
            # Parse table
            table_lines = []
            while i < len(lines) and '|' in lines[i]:
                table_lines.append(lines[i])
                i += 1
            result.append(parse_table(table_lines))
            continue

        # Blockquote
        if line.startswith('> '):
            text = line[2:].strip()
            text = inline_md(text)
            result.append(f'<blockquote><p>{text}</p></blockquote>')
            i += 1
            continue

        # Unordered list
        if re.match(r'^[-*+] ', line):
            items = []
            while i < len(lines) and re.match(r'^[-*+] ', lines[i]):
                item_text = re.sub(r'^[-*+] ', '', lines[i]).strip()
                item_text = inline_md(item_text)
                items.append(f'<li>{item_text}</li>')
                i += 1
            result.append('<ul>\n' + '\n'.join(items) + '\n</ul>')
            continue

        # Ordered list
        if re.match(r'^\d+\. ', line):
            items = []
            while i < len(lines) and re.match(r'^\d+\. ', lines[i]):
                item_text = re.sub(r'^\d+\. ', '', lines[i]).strip()
                item_text = inline_md(item_text)
                items.append(f'<li>{item_text}</li>')
                i += 1
            result.append('<ol>\n' + '\n'.join(items) + '\n</ol>')
            continue

        # Empty line
        if line.strip() == '':
            i += 1
            continue

        # Regular paragraph
        text = line.strip()
        if text:
            text = inline_md(text)
            result.append(f'<p>{text}</p>')
        i += 1

    return '\n'.join(result)


def inline_md(text):
    """Convert inline markdown to HTML."""
    # Inline code
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    # Bold
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    # Italic
    text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
    # Links
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    return text


def parse_table(lines):
    """Parse a markdown table into HTML."""
    if not lines:
        return ''

    rows = []
    for line in lines:
        # Skip separator row
        if re.match(r'^\|[\s\-:|]+\|$', line.strip()):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        rows.append(cells)

    if not rows:
        return ''

    html = ['<table>']
    # First row as header
    html.append('<thead><tr>')
    for cell in rows[0]:
        html.append(f'<th>{inline_md(cell)}</th>')
    html.append('</tr></thead>')

    if len(rows) > 1:
        html.append('<tbody>')
        for row in rows[1:]:
            html.append('<tr>')
            for cell in row:
                html.append(f'<td>{inline_md(cell)}</td>')
            html.append('</tr>')
        html.append('</tbody>')

    html.append('</table>')
    return '\n'.join(html)


def escape_js_template_literal(text):
    """Escape text for use in JS template literal (backtick string)."""
    text = text.replace('\\', '\\\\')
    text = text.replace('`', '\\`')
    text = text.replace('${', '\\${')
    return text


def get_slug_from_filename(filename):
    """Extract slug from filename like '01-what-is-json.md'."""
    name = filename.replace('.md', '')
    # Remove number prefix (e.g., '01-', '10-', '53-')
    slug = re.sub(r'^\d+-', '', name)
    return slug


def read_md_file(slug):
    """Find and read the MD file for a given slug."""
    for filename in os.listdir(ARTICLES_DIR):
        if filename.endswith('.md'):
            file_slug = get_slug_from_filename(filename)
            if file_slug == slug:
                path = os.path.join(ARTICLES_DIR, filename)
                with open(path, 'r', encoding='utf-8') as f:
                    return f.read()
    return None


def generate_js_file(group_name, slugs):
    """Generate a JS file for a group of articles."""
    lines = [f'/* JSON Learn Articles: {group_name} */']
    lines.append('window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};')
    lines.append('')

    for slug in slugs:
        md_content = read_md_file(slug)
        if md_content is None:
            print(f'WARNING: No MD file found for slug: {slug}')
            html_zh = f'<h2>Coming Soon</h2><p>Content for {slug} is coming soon.</p>'
        else:
            html_zh = md_to_html(md_content)

        html_zh_escaped = escape_js_template_literal(html_zh)

        lines.append(f'window.LEARN_ARTICLES["{slug}"] = {{')
        lines.append(f'zh: `{html_zh_escaped}`,')
        lines.append(f'en: `{html_zh_escaped}`')  # Use same content for now (Chinese articles)
        lines.append('};')
        lines.append('')

    return '\n'.join(lines)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for group_name, slugs in GROUPS.items():
        print(f'Generating {group_name}.js ...')
        content = generate_js_file(group_name, slugs)
        output_path = os.path.join(OUTPUT_DIR, f'{group_name}.js')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  Written: {output_path}')

    print('\nDone! All article JS files generated.')


if __name__ == '__main__':
    main()

