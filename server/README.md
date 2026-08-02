# F.A.I. Server

Secure backend for the **F.A.I.** (Fatma Artificial Intelligence) assistant that powers the
portfolio chatbot. The frontend never talks to Google Gemini directly — every chat request
goes through this API, so the `GEMINI_API_KEY` stays on the server.

- Node.js ≥ 20, TypeScript, Express 5
- Zod-validated requests, JSON error responses
- Prompt-injection / secret-disclosure guard at the edge
- IP-based rate limiting
- Streaming-free (full-response) chat with follow-up suggestions
- Serverless-ready handler for Vercel / Netlify, Docker image for Railway / Render / Fly.io

## Requirements

- Node.js ≥ 20
- A free Gemini API key from <https://aistudio.google.com/apikey>

## Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and set your key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Important:** `server/.env` is git-ignored and must never be committed. The key never
> leaves the server. The frontend only knows the server URL.

## Run locally

```bash
npm run dev        # tsx watch, http://localhost:4000
```

Verify it is up:

```bash
curl http://localhost:4000/api/health
# {"status":"ok","uptime":...,"version":"1.0.0","environment":"development"}
```

## API

### `GET /api/health`

Returns status, uptime, version and environment.

### `POST /api/chat`

Request body:

```json
{
  "message": "Tell me about Fatma",
  "conversationHistory": [
    { "role": "user", "content": "Who are you?" },
    { "role": "assistant", "content": "I'm F.A.I., Fatma's digital twin." }
  ],
  "currentSection": "projects",
  "currentProject": "FITSYNC",
  "language": "en"
}
```

- `message` (required) — the visitor's new message.
- `conversationHistory` (optional) — previous turns; `role` is `user` / `assistant` / `model`.
- `currentSection` (optional) — the portfolio section the visitor is viewing.
- `currentProject` (optional) — the open project card; aliases like "AI Internship" resolve to
  the AI Psychometric Assessment Platform.
- `language` (optional) — `en` or `fr`; auto-detected from `message` when omitted.

Response:

```json
{
  "response": "FITSYNC is a full-stack fitness synchronization platform...",
  "followUpSuggestions": ["What technologies does it use?", "Which project is she most proud of?"]
}
```

If the message looks like a prompt-injection / secret-disclosure attempt, the server refuses
**without calling Gemini** and returns a friendly refusal.

### `POST /api/reset`

Stateless — always succeeds with `{ "status": "ok", "reset": true }`. Useful to keep the
frontend contract stable across frameworks.

### Errors

Every error is JSON:

```json
{ "error": { "code": "VALIDATION", "message": "Invalid request body: message: Required" } }
```

| Status | Code                     | Meaning                                        |
| ------ | ------------------------ | ---------------------------------------------- |
| 400    | `VALIDATION`             | Body failed zod validation / malformed JSON    |
| 400    | `BAD_REQUEST` / `BLOCKED`| Gemini rejected the request / safety block     |
| 401    | `UNAUTHORIZED`           | Gemini rejected the API key                    |
| 429    | `RATE_LIMIT`             | Too many requests from the same IP (our limiter) |
| 429    | `RATE_LIMIT` / `QUOTA_EXCEEDED` | Gemini rate limit / quota exhausted     |
| 500    | `INTERNAL`               | Unknown server error (details never leaked)    |
| 502    | `NETWORK` / `UPSTREAM` / `EMPTY` | Network failure / Gemini unavailable / empty |
| 503    | `MISSING_API_KEY`        | `GEMINI_API_KEY` not configured on the server  |
| 504    | `TIMEOUT`                | Gemini timed out                               |

## Configuration

All options are read from the environment (see `.env.example`):

| Variable                    | Default                          | Description                                  |
| --------------------------- | -------------------------------- | -------------------------------------------- |
| `PORT` / `HOST`             | `4000` / `0.0.0.0`               | Listen port / host                           |
| `GEMINI_API_KEY`            | *(empty)*                        | Server-side Gemini key                       |
| `GEMINI_MODEL`              | `gemini-2.0-flash`               | Model used for chat                          |
| `GEMINI_TEMPERATURE`        | `0.6`                            | Generation temperature                       |
| `GEMINI_MAX_TOKENS`         | `1024`                           | Max output tokens                            |
| `GEMINI_TIMEOUT_MS`         | `60000`                          | Gemini request timeout                       |
| `CORS_ORIGIN`               | `http://localhost:3000`          | Comma-separated allowed origins              |
| `RATE_LIMIT_MAX`            | `20`                             | Requests per IP per window                   |
| `RATE_LIMIT_WINDOW_MS`      | `60000`                          | Rate-limit window                            |
| `TRUST_PROXY`               | `1`                              | Trust proxy IPs (behind reverse proxies)     |
| `LOG_LEVEL`                 | `info`                           | pino level; `silent` disables logging        |

## Knowledge base

All knowledge lives as JSON in `server/src/knowledge/`:

```
about.json personality.json contact.json
projects.json experience.json education.json skills.json faq.json funfacts.json
```

Some files wrap their data (e.g. `projects.json` is `{ "projects": [...] }`,
`experience.json` is `{ "experiences": [...] }`, `skills.json` is `{ "categories": [...] }`).
The server unwraps these automatically.

To add a project, edit `projects.json` and add an entry matching `src/types/knowledge.ts`:

```json
{
  "name": "MyProject",
  "type": "Web App",
  "description": "What it does",
  "stack": ["React", "Node.js"],
  "highlights": ["Feature A", "Feature B"],
  "demo": "https://..."
}
```

To let visitors refer to it loosely ("this project", nicknames), add an alias in
`src/services/knowledge.service.ts` → `PROJECT_ALIASES`. The system prompt is assembled from
this knowledge, so no code changes are needed for new content. Restart the server after edits.

## Tests & checks

```bash
npm run typecheck    # tsc --noEmit
npm test             # vitest (unit + integration + serverless)
npm run build        # tsc + copy knowledge assets into dist/
```

## Production

```bash
npm run build
npm start            # node dist/server.js (reads .env)
```

### Docker

```bash
docker build -t fai-server .
docker run --env-file .env -p 4000:4000 fai-server
```

The image copies the built `dist/` **and** the knowledge assets into the runtime stage.

## Deployment

### Railway / Render / Fly.io

Point the platform at the `server/` directory with the `Dockerfile`, or use the Node
start command `npm run build && npm start`. Set the env vars from `.env.example`, including
`GEMINI_API_KEY` and your production `CORS_ORIGIN`. `TRUST_PROXY=1` keeps rate limiting
accurate behind their load balancers.

### Vercel / Netlify (serverless)

`src/serverless.ts` exports a `handler` ready for serverless functions (no long-running
process). The first warm call builds the dependency container, then reuses it. Set the same
env vars in the platform dashboard.

## Wiring the frontend

In the portfolio root `.env`:

```
REACT_APP_FAI_API_URL=http://localhost:4000
```

The frontend (`src/services/api.js`) POSTs `{ message, conversationHistory, currentSection,
currentProject, language }` to `${REACT_APP_FAI_API_URL}/api/chat` and renders
`{ response, followUpSuggestions }`. Add your deployed server URL and make sure it appears in
`CORS_ORIGIN`.

## Security notes

- The Gemini key exists only on the server; it is never bundled or logged (pino redacts it).
- Chat bodies are capped at 32 KB, validated with zod, and rate-limited per IP.
- Prompt-injection / secret-extraction attempts are refused before reaching the model, and
  the system prompt hardens against them as defense-in-depth.
- Error responses never leak internal stack traces or configuration.
