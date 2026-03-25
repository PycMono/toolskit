# ToolBoxNova Project Guide

## Project Overview
- **Name:** ToolBoxNova / DevToolBox
- **Stack:** Golang (Backend), Python (AI Agent Frameworks), Nginx (Reverse Proxy)
- **Goal:** A utility toolbox website monetized via SEO and Google Ads.
- **Environment:** Private server deployment (CentOS/Ubuntu).

## Tech Stack Rules
- **Backend:** Prefer idiomatic Go (standard library + common frameworks). Focus on performance and clean API design.
- **AI Integration:** Use OpenAI-compatible interfaces for calling models (Bailian/Qwen).
- **Deployment:** Nginx configuration must support SSL (Certbot) and proper proxy headers for the Go app.

## Common Commands
- **Run Backend:** `go run main.go`
- **Build:** `go build -o bin/server main.go`
- **Test:** `go test ./...`
- **Nginx Check:** `sudo nginx -t`
- **Nginx Reload:** `sudo nginx -s reload`

## Code Style & Conventions
- Use standard `gofmt` for Go code.
- Python scripts should follow PEP 8 and use type hints where possible.
- Focus on SEO-friendly HTML structures in any frontend templates.

## Current Priorities
1. Optimizing Nginx configuration for the private server.
2. Implementing AI Agent logic for utility tools.
3. Setting up Google Adsense/SEO meta tags.