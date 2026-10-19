# project_for_comp5241

## Vibe Code Detective

Open `index.html` or `detective.html` in a browser. The three Git cases, interactive consequences, and saved progress work locally. The optional AI coach and instructor case generator call the Vercel function at `/api/coach`.

### Enable OpenRouter

Set `OPENROUTER_API_KEY` as an encrypted Vercel environment variable for Production and redeploy. Optional settings: `OPENROUTER_MODEL` (defaults to `openai/gpt-4o-mini`), `OPENROUTER_SITE_URL`, and `OPENROUTER_APP_NAME`. For local development, use `api/.env.example` as a template for `api/.env`; never commit the real file. The key is read only by the serverless function and is never sent to the browser. Without a key, the UI clearly shows an offline fallback.