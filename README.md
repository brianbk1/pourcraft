# PourCraft

Tell PourCraft what's behind your bar and it invents a completely original,
seasonal cocktail — with a craft technique, a target color in the glass, and
food pairings.

## Local setup

```
npm install
npm run dev
```

Note: the AI generation calls `/api/claude`, which only works once deployed
to Vercel (or run via `vercel dev` locally) since it depends on the
serverless function in `api/claude.js`.

## Deploy to Vercel

1. Push this folder to a new GitHub repo (GitHub Desktop or `git` CLI).
2. In Vercel: **New Project** → import the repo → framework preset **Vite**
   (auto-detected).
3. Before the first deploy, add an environment variable:
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
4. Click **Deploy**. Vercel builds and gives you a `*.vercel.app` URL.
5. Optional: attach a custom domain in **Project Settings > Domains**.

## How it works

- `src/App.jsx` — the full PourCraft UI (ingredients, season, technique,
  color, serving size, occasion, Pour Gauge, remix, tonight's menu).
- `api/claude.js` — a Vercel serverless function that holds the real
  Anthropic API key server-side and forwards requests from the browser.
  The key is never exposed to visitors.
