# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (also serves the `/api/roshan-chat` middleware, see below)
- `npm run build` — type-check via `tsc -b` then production build with `vite build`
- `npm run lint` — run ESLint over the repo
- `npm run preview` — serve the production build locally (also mounts the chat middleware)

There is no test suite configured in this project.

## Architecture

This is a single-page personal portfolio site (React 19 + TypeScript + Vite), not a multi-route app.

- **`src/App.tsx`** is the entire UI: one `App` component that renders all page sections (hero, about, capabilities, portfolio, chat, journey timeline, proof/awards, stack, footer) in sequence. Section content (career `journey` timeline, `capabilities`, `stack` list, `starterPrompts`) is defined as plain data arrays at the top of the file and mapped over — to edit copy, edit those arrays rather than JSX.
- **`src/App.css`** holds all component styling (no CSS modules/styled-components); `src/index.css` has global/root styles.
- **"Digital Roshan" chat feature**: the client (`App.tsx`) posts conversation history to `/api/roshan-chat`. That endpoint doesn't exist as a real backend route — it's implemented as a Vite server middleware plugin defined directly in **`vite.config.ts`** (`installOpenRouterChat`), which both `configureServer` (dev) and `configurePreviewServer` (preview) hook into. The middleware injects a hardcoded `careerContext` system prompt (Roshan's bio/experience) and forwards the request to OpenRouter's chat completions API (`minimax/minimax-m3`) using the `OPENROUTER_API_KEY` env var.
  - This means the chat feature only works when running through Vite (`dev`/`preview`); a static `dist/` deploy without an equivalent serverless/edge function behind `/api/roshan-chat` will have a non-functional chat.
  - `careerContext` in `vite.config.ts` and the bio content in `App.tsx` (journey/capabilities/stack) describe the same underlying facts — keep them in sync when updating career/project details.
  - `OPENROUTER_API_KEY` is read from `.env` (gitignored) via Vite's `loadEnv`.
- Icons are from `lucide-react`; only the icons actually used should be imported (named imports, tree-shaken).
