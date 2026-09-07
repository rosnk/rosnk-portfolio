# DEPLOYMENT.md

Reference for how this portfolio is hosted and deployed. Pair with `CLAUDE.md`
(architecture) — this file is about infra.

## TL;DR

- **Host:** Cloudflare Pages, project name **`rosnk-portfolio`**.
- **Repo:** `https://github.com/rosnk/rosnk-portfolio` (branch `main`). Deploys via
  Cloudflare Pages **Git integration** — every push to `main` builds and deploys.
- **Build config (in CF Pages project settings):** build command `npm run build`,
  output directory `dist`.
- **Primary domain:** `roshankarki.dev` (registrar: Spaceship). Also
  `www.roshankarki.dev` and the built-in `rosnk-portfolio.pages.dev`.
- **DNS:** delegated to Cloudflare (Spaceship nameservers point at
  `cartman.ns.cloudflare.com` / `ruth.ns.cloudflare.com`).
- **Chat backend in prod:** Cloudflare Pages Function at
  `functions/api/roshan-chat.ts`. Needs the `OPENROUTER_API_KEY` secret set in the
  Pages project.

## Domain setup (done)

1. Added `roshankarki.dev` as a site in the Cloudflare account (Free plan).
2. At Spaceship: replaced the default nameservers with the two Cloudflare
   nameservers Cloudflare assigned. Zone went active ("your domain is now
   protected by Cloudflare").
3. In CF Pages -> `rosnk-portfolio` -> **Custom domains**: added `roshankarki.dev`
   and `www.roshankarki.dev`. Cloudflare auto-created proxied `CNAME` records
   (apex is CNAME-flattened) pointing at `rosnk-portfolio.pages.dev`, and the
   hostname -> project route binding.
4. Universal SSL cert issued automatically (required — `.dev` is HSTS-preloaded,
   so HTTPS must work before the site loads at all).

**Gotcha seen during setup:** before the custom domain was added to the Pages
project, `roshankarki.dev` resolved to Cloudflare IPs and had a cert, but every
request timed out (Cloudflare error 522) because there was a proxied DNS record
but no route binding telling the edge which project serves that hostname. Adding
the custom domain in the Pages project fixed both.

### Still open / optional

- Pick a canonical host (apex vs `www`) and add a redirect rule for the other.
- Optionally redirect `rosnk-portfolio.pages.dev` -> `roshankarki.dev`.
- Repo and Pages project are still named `rosnk-portfolio`, not
  `roshan-karki-portfolio`. Renaming both is optional cleanup, not required.

## How a deploy happens

1. Push to `main` on GitHub.
2. Cloudflare Pages runs `npm run build` (`tsc -b` then `vite build`) -> emits
   `dist/`.
3. Cloudflare serves `dist/` as static assets from its edge, and compiles
   everything under `functions/` into edge Functions (Workers) with file-based
   routing (`functions/api/roshan-chat.ts` -> `/api/roshan-chat`). No build step
   or config needed for `functions/` — CF picks the directory up automatically.
4. `dist/` is also committed to the repo (legacy from an earlier direct-upload
   workflow). Harmless with Git integration; keep it in sync or stop tracking it
   later.

## The "Digital Roshan" chat — two implementations of one endpoint

The client (`src/App.tsx`) always POSTs conversation history to
`/api/roshan-chat` and expects JSON `{ reply }` or `{ error }`.

| Environment | What serves `/api/roshan-chat` |
| --- | --- |
| Local `npm run dev` / `npm run preview` | Vite server middleware in `vite.config.ts` (`installOpenRouterChat`), hooked via `configureServer` / `configurePreviewServer`. |
| Deployed site (Cloudflare Pages) | Pages Function `functions/api/roshan-chat.ts`. |

Both do the same thing: inject the `careerContext` system prompt, forward to
OpenRouter chat completions, return `{ reply }`. **Keep the three copies of the
career bio in sync:** `careerContext` in `vite.config.ts`, `careerContext` in
`functions/api/roshan-chat.ts`, and the journey/capabilities/stack data in
`src/App.tsx`.

Current model: **`minimax/minimax-m3`** (paid, pay-per-token on OpenRouter
credits — no monthly minimum). History was `openai/gpt-oss-120b:free` ->
`minimax/minimax-m3:free`; OpenRouter pulled both off the free tier, so this now
uses the billed slug. Change it in **both** `vite.config.ts` and
`functions/api/roshan-chat.ts`.

### Secrets

- `OPENROUTER_API_KEY`
  - Local: `.env` (gitignored), read by Vite's `loadEnv`.
  - Local `wrangler pages dev`: `.dev.vars` (gitignored).
  - Production: **Cloudflare Pages -> project -> Settings -> Variables and
    Secrets**, added as a Secret, applied to Production (and Preview if wanted).
    Changing it does not auto-redeploy — retry the latest deployment afterward.

## Local testing

```bash
npm run dev            # app + chat via Vite middleware (fastest loop)
npm run build          # tsc -b + vite build -> dist/

# Test the deployed code path (static dist/ + Pages Functions) locally:
npx wrangler pages dev dist --port 8788
#   reads .dev.vars for OPENROUTER_API_KEY
#   POST http://127.0.0.1:8788/api/roshan-chat  -> 200 { reply }
#   GET  http://127.0.0.1:8788/api/roshan-chat  -> 405 { error }
```

## Verify production after a deploy

```bash
curl -sI https://roshankarki.dev                       # HTTP/2 200, server: cloudflare
curl -s -X POST https://roshankarki.dev/api/roshan-chat \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"hi"}]}'    # { "reply": "..." }
```

If chat returns `{"error":"OPENROUTER_API_KEY is missing."}` the secret is not set
(or the deployment predates it) — set it in the Pages project and retry the
deployment.

## Common failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Chat: `Unexpected end of JSON input` on the live site | `/api/roshan-chat` hit static hosting (no Function), got empty-body 405 | Ensure `functions/api/roshan-chat.ts` is deployed |
| Chat: `OPENROUTER_API_KEY is missing.` | Secret not set in Pages project, or deploy predates it | Add secret, retry deployment |
| Domain times out (CF error 522) | Custom domain not added to the Pages project | Pages project -> Custom domains -> add it |
| `.dev` domain won't load at all | SSL cert not issued yet | Wait for Universal SSL; `.dev` requires HTTPS |
| Chat answers with stale bio | Career context out of sync across the three files | Update all three (see above) |
