# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ToolBoxNova (toolboxnova.com) — a privacy-focused online tools website built with Go 1.25 + Gin. Provides tools including SMS receiver, password generator, virtual address generator, temp email, AI detection/humanization, JSON tools, image tools, color tools, and developer utilities.

## Common Commands

```bash
go run main.go                    # Run dev server (default port from config.json)
PORT=8080 go run main.go          # Custom port
GIN_MODE=release go run main.go   # Production mode
go build -o toolskit main.go      # Build binary
go test ./...                     # Run all tests
go test ./handlers/ -run TestXxx  # Run a single test
```

No Makefile — deployment uses `./deployment-tools/deploy.sh`.

## Architecture

### Request Flow

`Gin Router → Middleware chain → Handler → render() → HTML Template`

Middleware chain: `I18nMiddleware → ConsentMiddleware → AdsConfig → GAConfig → NoCacheHTML → StaticCacheHeaders`

### Key Packages

- **`handlers/`** — All HTTP handlers. `render.go` has the core `render()` and `baseData()` helpers. `page.go` has static page handlers.
- **`internal/router/router.go`** — All route definitions and middleware setup (~360 lines). Register new routes here.
- **`internal/i18n/`** — Full i18n engine: loader (JSON files), manager (fallback chains), translator (per-request), detector (URL > Cookie > Accept-Language), watcher (hot-reload in dev).
- **`internal/aiservice/`** — AI provider abstraction (factory pattern). Providers: OpenAI, DeepSeek, Gemini, Doubao, Claude. Task routing maps tasks to specific providers.
- **`internal/humanizer/`** — Text humanization engine with mode-based strategies (basic/standard/aggressive/academic/creative/business). Streaming SSE output.
- **`middleware/`** — Gin middleware for i18n, GDPR consent, ads, GA, caching, rate limiting.
- **`config/`** — Loads `config.json` via `jinzhu/configor` with env var overrides.

### Handler Pattern

All page handlers follow this pattern:
```go
func MyPage(c *gin.Context) {
    t := getT(c)  // translation function from context
    data := baseData(c, gin.H{
        "Title": t("mytool.title") + " | Tool Box Nova",
        "Description": t("mytool.description"),
    })
    render(c, "mytool.html", data)
}
```

`render()` dynamically parses templates per-request (avoiding Gin's global namespace collision). Templates reference `base.html` automatically.

### Adding a New Tool

1. Create handler in `handlers/`
2. Create template in `templates/`
3. Register routes in `internal/router/router.go`
4. Add translations to all 5 language dirs under `i18n/{en,zh,ja,ko,spa}/`
5. Add tool card to `templates/index.html`

### i18n System

- **Translation files**: `i18n/{en,zh,ja,ko,spa}/*.json` — one JSON file per namespace
- **Key format**: dot-notation, e.g. `t("img.resize.title")`
- **Languages**: English (default/fallback), Chinese, Japanese, Korean, Spanish
- **Translator methods**: `T(key)`, `TF(key, args...)` (sprintf), `TN(key, n)` (plural), `All()` (full map for JS)
- **Detection priority**: URL param `?lang=` > Cookie `lang` > `Accept-Language` header
- **Language aliases**: e.g. `es` → `spa`

### Configuration

`config.json` at project root — port, site URL, asset version, Google Ads/GA IDs, AI provider configs with API keys. Sensitive values (API keys) use env var overrides.

## Key Conventions

- Each tool gets its own CSS file in `static/css/` and JS file in `static/js/`
- Cache busting via `?v={{ .AssetVer }}` query parameter on static assets
- Static assets served with 1-year cache headers; bump `asset_version` in config.json to invalidate
- SEO: all pages include title, description, canonical URL, JSON-LD structured data
- Rate limiting on API endpoints (IP-based sliding window)
- Consent Mode v2 for GDPR/CCPA compliance (server-side defaults in `base.html`)
