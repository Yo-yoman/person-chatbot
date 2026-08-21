# Bhatta Ji Personal Bot — Vercel

## Project structure

- `index.html` — frontend
- `api/chat.js` — secure Vercel serverless API endpoint
- `.gitignore` — keeps secrets out of Git

## Deploy

1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Do not configure a Python runtime.
4. In Vercel: Project Settings → Environment Variables.
5. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
6. Optional: add `ANTHROPIC_MODEL` if you want a different supported model.
7. Redeploy.

The browser calls `/api/chat`; the Anthropic API key is only used by the server-side Vercel function and is never placed in `index.html`.
