# FitQuest v2 — Deployment Guide

## Deploy to your existing Vercel project

### Replace files in your existing repo

1. Copy the contents of this folder into `C:\Users\Vijay\fitquest\`
2. Then run:

```cmd
npm install
npm test
git add .
git commit -m "feat: v2 architecture — security, layered services, 213 tests"
git push
```

Vercel auto-deploys from GitHub — done.

## What changed

| Area | v1 | v2 |
|---|---|---|
| Architecture | 4200-line App.jsx monolith | Layered: constants / utils / services / context |
| Security | None | XSS sanitisation on all inputs + 7 HTTP security headers |
| Data layer | Raw localStorage scattered | Centralised StorageService with schema validation + v1→v2 migration |
| Tests | 0 | 213 passing across 6 suites |
| Bundle | ~180KB | 56KB gzipped |
| Schema versioning | None | v2.0.0 with auto-migration |

## Security headers (vercel.json)
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (camera, mic, geo, payment disabled)
- Strict-Transport-Security (HSTS)
- X-XSS-Protection

## Run tests
```cmd
npm test              # all 213 with coverage
```
