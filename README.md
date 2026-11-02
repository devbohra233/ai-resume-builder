# Vitae — AI Resume Builder

Full-stack MERN resume builder with AI writing assistance, ATS scoring, three print-ready templates, PDF export, public share links, and ImageKit-powered photo uploads.

**Stack:** React 19 + Vite + Tailwind CSS v4 · Node.js + Express 5 · MongoDB / Mongoose · ImageKit · JWT auth

## Features

- **Resume editor** — personal details, summary, experience, education, projects, skills, certifications, languages
- **Three templates** (Minimal, Modern, Editorial) with photo support and accent colors, rendered at true A4 size (794 × 1123)
- **Live preview** — sticky desktop preview, full-screen preview and one-click PDF export (html2canvas + jsPDF)
- **AI assistant** — generate summaries, rewrite bullets, draft role-specific bullets, suggest skills. Works with any OpenAI-compatible API, a local Ollama model, or a built-in offline draft engine
- **ATS analyzer** — deterministic keyword coverage, structure checks, grade and actionable fixes
- **Autosave** — debounced saves with saved/unsaved/saving/error status, `Ctrl/Cmd + S`
- **Public share pages** — publish any resume to `/r/:slug` with view counts; unpublish anytime
- **Avatar uploads** — ImageKit when configured, local disk fallback otherwise
- **Responsive** — dedicated mobile navigation in the editor, mobile preview modal

## Quick start

Requirements: **Node.js 20+** (22 recommended) and npm.

```bash
npm install          # installs root, server and client dependencies
cp server/.env.example server/.env
npm run dev          # API on :5000 + Vite on :5173
```

Open http://localhost:5173 and click **Try the demo**, or log in with a seeded account:

```bash
npm run seed
# email: demo@vitae.app
# password: demopass123
# public resume: /r/jordan-ellis-demo
```

> No MongoDB installed? Leave `MONGODB_URI` blank. The server starts a bundled persistent MongoDB (via `mongodb-memory-server`) storing data in `server/.data/mongo`. This is great for local development; **always use a real MongoDB (e.g. Atlas) in production**.

## Environment variables

All variables live in `server/.env` (see `server/.env.example`).

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | API / production server port |
| `CLIENT_URL` | `http://localhost:5173` | Frontend origin (dev) |
| `MONGODB_URI` | — | MongoDB connection string; blank = local bundled MongoDB |
| `JWT_SECRET` | dev fallback | **Set a long random value in production** |
| `IMAGEKIT_PUBLIC_KEY` | — | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | — | ImageKit private key (enables ImageKit uploads) |
| `IMAGEKIT_URL_ENDPOINT` | — | e.g. `https://ik.imagekit.io/your_id` |
| `AI_API_KEY` | — | Key for any OpenAI-compatible provider |
| `AI_BASE_URL` | `https://api.openai.com/v1` | Provider base URL (OpenAI, OpenRouter, Groq, DeepSeek…) |
| `AI_MODEL` | `gpt-4o-mini` | Model name |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Local Ollama server (auto-detected) |
| `OLLAMA_MODEL` | `qwen2.5:1.5b` | Local model |
| `OLLAMA_DISABLED` | `false` | Set `true` to skip Ollama detection |

AI falls back in this order: **OpenAI-compatible API → local Ollama → built-in draft engine**. The current provider is shown in the AI drawer and at `GET /api/health`.

### ImageKit setup

1. Create a free account at [imagekit.io](https://imagekit.io) and copy your keys from the developer console.
2. Set `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` in `server/.env`.
3. Restart the API. Uploads go to the `vitae/avatars` folder and are cropped to the face; `/api/health` reports `imagekit: true`.

Without keys, avatars are written to `server/uploads/` and served from `/uploads/*`, so the app remains fully usable.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run API + client with hot reload |
| `npm run build` | Build the React client into `client/dist` |
| `npm start` | Start the Express server (serves `client/dist` if present) |
| `npm run seed` | Create the demo account and sample resumes |

## Production

```bash
npm run build
NODE_ENV=production npm start
```

Express serves the built SPA and its `/api` routes from a single origin on `PORT`. Deep links such as `/r/:slug` fall back to `index.html`.

### Deploy with Render

`render.yaml` defines a Docker web service with generated `JWT_SECRET` and prompts for `MONGODB_URI`, ImageKit and AI credentials.

1. Push this repository to GitHub.
2. In Render: **New → Blueprint**, select the repo, and apply `render.yaml`.
3. Fill in the prompted secrets. Use a MongoDB Atlas URI and ImageKit keys.
4. Set `CLIENT_URL` to your Render URL once assigned.
5. Deploy. Health check: `/api/health`.

Render’s free tier uses ephemeral storage, so configure ImageKit for uploads. On hosts without persistent disks, avoid the local bundled MongoDB and always provide `MONGODB_URI`.

### Deploy with Docker

```bash
docker build -t vitae .
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  -e IMAGEKIT_PUBLIC_KEY=... -e IMAGEKIT_PRIVATE_KEY=... -e IMAGEKIT_URL_ENDPOINT=... \
  vitae
```

Mount a volume at `/app/server/uploads` if you rely on local-disk uploads.

## API overview

| Route | Description |
| --- | --- |
| `POST /api/auth/register` · `login` · `demo` | Authentication (JWT, 7-day expiry) |
| `GET/PATCH /api/auth/me` | Current user |
| `GET/POST /api/resumes` · `GET/PUT/DELETE /api/resumes/:id` | Resume CRUD + autosave |
| `POST /api/resumes/:id/publish` · `unpublish` | Publish / unpublish, slug, visibility |
| `POST /api/ai/summary` · `bullets` · `skills` · `improve` · `ats` | AI writing and review tools |
| `GET /api/ai/status` | Active AI provider |
| `POST /api/uploads/avatar` | Avatar upload (multipart, 4 MB limit) |
| `GET /api/public/resumes/:slug` | Public resume payload |
| `GET /api/health` | Health, DB mode, AI + ImageKit status |

## Project structure

```
client/                 React SPA (Vite)
  src/pages/            Landing, Login, Register, Dashboard, Editor, PublicResume, NotFound
  src/components/       ResumeFrame, ResumeDocument, templates, editor panels, UI kit
server/
  src/config/           env + database (external Mongo or bundled fallback)
  src/models/           Mongoose User + Resume schemas
  src/routes/           auth, resumes, ai, uploads, public
  src/services/         AI provider chain, ImageKit uploads, ATS scoring
  uploads/              Local fallback storage (gitignored)
Dockerfile              Multi-stage production image
render.yaml             Render blueprint
```

## Notes

- The app ships with a credential-free setup: bundled MongoDB, offline AI fallback and local uploads. Add MongoDB Atlas, an AI key and ImageKit keys for production.
- Local uploads are not replicated across instances — use ImageKit on multi-instance/ephemeral hosts.
- Resume data is private by default; share links are stable slugs and can be unpublished at any time.
