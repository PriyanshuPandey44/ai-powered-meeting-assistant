# 📝 AI-Powered Meeting Assistant (MERN + AI)

Paste a meeting transcript (or upload a `.txt`) and get an **AI-generated summary, key discussion points, action items (task / owner / deadline) and a follow-up email**. Every analysis is saved in MongoDB and shown in a "Previous meetings" list.

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express (runs as a Vercel serverless function)
- **Database:** MongoDB Atlas (Mongoose)
- **AI:** Google Gemini (default) or OpenAI – switch with one env variable

## Architecture

```
client/ (React)  ──/api/*──▶  api/index.js ─▶ server/app.js (Express)
                                              ├─ routes/index.js      endpoints
                                              ├─ services/ai.js       LLM call + output cleaning
                                              ├─ models/Meeting.js    Mongoose schema
                                              ├─ config/db.js         cached Mongo connection (serverless-safe)
                                              ├─ utils/validate.js    transcript validation
                                              └─ middleware/errorHandler.js
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/analyze` | Validate transcript → call AI → return structured insights |
| POST | `/api/meetings` | Save an analysed meeting to MongoDB |
| GET | `/api/meetings` | List saved meetings (newest first) |
| GET | `/api/meetings/:id` | Full record of one meeting |
| DELETE | `/api/meetings/:id` | Delete a record |
| GET | `/api/health` | Health check |

**Flow:** user pastes/uploads text → `POST /api/analyze` → AI returns JSON → results shown → frontend calls `POST /api/meetings` to save → history refreshes. If saving fails, the results are still displayed with a warning.

## AI integration & accuracy

- The transcript is sent to the LLM with a strict system prompt and the model is forced to return **JSON only** (`responseMimeType: application/json` for Gemini, `json_object` for OpenAI). Temperature is `0.2`.
- Nothing is hardcoded – all output is generated from the user's transcript.
- **No invented owners/deadlines:** the prompt says to use `"Not specified"` unless clearly stated, and the server adds a second safety net (`grounded()` in `services/ai.js`): an owner/deadline is kept only if its words actually appear in the transcript, otherwise it is replaced with `Not specified`.
- The transcript is wrapped in `<transcript>` tags and treated as data (basic prompt-injection resistance).
- Errors (invalid key, quota/429, timeout, malformed AI output) are mapped to clear messages.

## Run locally

Requirements: Node.js 18+, a MongoDB Atlas (or local) database, and a Gemini or OpenAI API key.

```bash
npm run install:all          # installs root + client dependencies
cp .env.example .env         # then fill in MONGODB_URI and an AI key
npm run dev                  # API on :5000, React on http://localhost:5173
npm test                     # unit tests (validation, guardrails, mocked AI)
```

### Environment variables (`.env`, never commit it)

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `AI_PROVIDER` | `gemini` or `openai` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Gemini key (get one at aistudio.google.com/apikey), default model `gemini-2.5-flash` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | OpenAI key, default model `gpt-4o-mini` |

## Deploy on Vercel

1. Push this project to a GitHub repo (`.env` is git-ignored).
2. Create a free **MongoDB Atlas** cluster → *Database Access*: create a user → *Network Access*: add `0.0.0.0/0` (needed for Vercel's dynamic IPs) → copy the connection string.
3. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo. Leave the defaults (`vercel.json` already sets the build command, output folder and API rewrite).
4. Add the **Environment Variables** from the table above (`MONGODB_URI`, `AI_PROVIDER`, the API key) and click **Deploy**.
5. Open the deployment URL. Check `https://<your-app>.vercel.app/api/health` returns `{"success":true}`.

Or with the CLI: `npm i -g vercel && vercel` (add env vars with `vercel env add`).

## Sample

`sample/sample-transcript.txt`:

> The team discussed the website launch. Rahul will complete the homepage design by Friday. Priya will test the login and registration flow. The next review meeting is scheduled for Monday. The marketing team will prepare the launch content.

Expected result: Rahul – Complete homepage design – Friday · Priya – Test login/registration – *Not specified* · Marketing team – Prepare launch content – *Not specified* (plus summary, key points and email).

## Test cases covered

- Valid transcript → insights generated and saved
- Empty / whitespace / too-short / binary file → clear 400 error (also validated in the UI: only `.txt`, non-empty, ≤ 1 MB)
- AI failure (bad key, 429 quota, timeout, invalid JSON) → clear error message
- Database failure → insights still shown, with a "could not be saved" warning
- Invented owner/deadline → replaced by "Not specified" (`npm test`)
