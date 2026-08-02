# Deployment

Production-ready deployment guide for the FATMA OS portfolio.

- **Frontend** (React / CRA) → **Vercel**
- **Backend** (F.A.I. chatbot API, Express 5) → **Railway**
- **CI/CD** → GitHub Actions (`frontend-build` + `backend-dist` artifacts on `main`)

## Architecture

```
Browser
  │  static site (Vercel)
  ▼
FatmaOS (React SPA)
  │  POST https://<railway-host>/api/chat   (CORS allowlist)
  ▼
F.A.I. server (Railway) ──▶ Google Gemini
      (GEMINI_API_KEY only here)
```

The Gemini key never reaches the browser. The frontend is built with
`REACT_APP_FAI_API_URL` pointing at the Railway service URL.

## Prerequisites

- Node.js ≥ 20 locally
- Accounts: [Vercel](https://vercel.com), [Railway](https://railway.app), GitHub
- A Gemini API key: <https://aistudio.google.com/apikey>

## 1. Repository

```bash
git init
git add .
git commit -m "chore: production-ready portfolio"
git remote add origin https://github.com/fatma2708/fatma-portfolio.git
git push -u origin main
```

GitHub Actions runs CI (lint, tests, typecheck, build) on every PR/push. On `main`
it uploads `frontend-build` and `backend-dist` as artifacts.

## 2. Vercel (frontend)

1. **Import the repo** in Vercel → **Add New Project** → `fatma-portfolio`.
2. Framework preset is **Create React App** (auto-detected; `vercel.json` also pins
   `buildCommand` / `outputDirectory` / SPA rewrite).
3. Add the **build-time** environment variable:

   | Variable                | Value                       |
   | ----------------------- | --------------------------- |
   | `REACT_APP_FAI_API_URL` | `https://<your-service>.up.railway.app` |

   > This value is baked into the JS bundle, so set it **before** building. It is a
   > build-time var (prefixed `REACT_APP_`), not a runtime secret.
4. Deploy. The default `https://<project>.vercel.app` URL goes into the backend's
   `CORS_ORIGIN`.

### SPA routing

`vercel.json` rewrites every unmatched path to `/index.html`, so deep links like
`/projects` work after refresh.

## 3. Railway (backend)

1. **New Project** → **Deploy from GitHub repo**.
2. Add the **server** as a service. Railway auto-detects `server/railway.json` +
   `server/Dockerfile` as a separate service — create it from the `server/` directory.
3. Set the environment variables (from `server/.env.example`):

   | Variable               | Value                                   |
   | ---------------------- | --------------------------------------- |
   | `NODE_ENV`             | `production`                            |
   | `GEMINI_API_KEY`       | `your_key` (required)                   |
   | `GEMINI_MODEL`         | `gemini-2.0-flash`                      |
   | `CORS_ORIGIN`          | `https://<your-project>.vercel.app`     |
   | `TRUST_PROXY`          | `1` (behind Railway's proxy)            |
   | `LOG_LEVEL`            | `info`                                  |

   Railway injects `PORT` automatically; the server binds `0.0.0.0`.
4. Deploy. Railway uses `GET /api/health` (from `server/railway.json`) as the
   healthcheck — a red service that does not return 200 is automatically restarted.
5. Copy the generated public URL (e.g. `https://<service>.up.railway.app`) into
   Vercel's `REACT_APP_FAI_API_URL` **and** back into `CORS_ORIGIN`, then redeploy
   the frontend.

### Optional: serverless instead of Railway

`server/src/serverless.ts` exports a serverless `handler` for Vercel Functions /
Netlify Functions. If you use that instead, skip Railway and point
`REACT_APP_FAI_API_URL` at the function URL.

## 4. Local production smoke test

```bash
# backend
cd server
npm run build
npm start                       # http://localhost:4000
curl http://localhost:4000/api/health

# frontend (separate terminal)
npm run build
npx serve -s build              # http://localhost:5000
```

Open `http://localhost:5000` and chat — it should hit `localhost:4000` if you left
`REACT_APP_FAI_API_URL=http://localhost:4000` in `.env`.

## 5. Environment variables summary

| Variable | Where | When | Notes |
| -------- | ----- | ---- | ----- |
| `REACT_APP_FAI_API_URL` | Vercel (build-time) | before first build | deployed backend URL |
| `GEMINI_API_KEY` | Railway | always | never exposed to browser |
| `CORS_ORIGIN` | Railway | always | comma-separated origins |
| `TRUST_PROXY` | Railway | always | keep `1` |

`server/.env` and root `.env` are git-ignored — do not commit real keys.

## 6. Docker (alternative to Vercel for the frontend)

`Dockerfile` + `nginx.conf` at the root build the SPA into an nginx image (SPA
fallback + immutable asset caching + `/health`). `server/Dockerfile` is the backend
image. `vercel.json` / `railway.json` make the managed-platform path the primary one.
