# Deploying Trivia Battle

This app needs **one Node server** that runs Express + Socket.IO. The React UI is built to static files and served by the same server in production.

**Do not** deploy only the frontend to a static host without the backend — multiplayer and OpenAI will not work.

---

## Before you deploy

1. **OpenAI API key** — required for starting games.
2. **Background music (optional)** — add `client/public/audio/trivia-bg.mp3` before `npm run build`, or skip music.
3. **Git** — push the project to GitHub, GitLab, or Bitbucket.

---

## Recommended: Render (free tier)

Good for Socket.IO on a single instance.

### Steps

1. Create an account at [https://render.com](https://render.com).
2. **New → Web Service** → connect your repo.
3. Settings:

| Field | Value |
|--------|--------|
| **Root directory** | (leave empty — repo root) |
| **Build command** | `npm run build` |
| **Start command** | `npm start` |
| **Health check path** | `/api/health` |

4. **Environment variables:**

| Key | Value |
|-----|--------|
| `OPENAI_API_KEY` | your OpenAI key |
| `CLIENT_URL` | your public URL, e.g. `https://trivia-battle-dd26.onrender.com` |

   After the first deploy, copy the real URL Render gives you and set `CLIENT_URL` to that exact value (with `https://`).

   Add `NODE_ENV=production` only if you use a **Start command** that needs it (this repo’s `npm start` sets it). Do **not** rely on `NODE_ENV=production` during the build step alone — it can skip `vite` unless dependencies are installed correctly.

5. Deploy. Open your Render URL in the browser.

### Blueprint (optional)

This repo includes `render.yaml`. On Render: **New → Blueprint** → select the repo.

Update `CLIENT_URL` in `render.yaml` to match your service name/URL before deploying, or fix it in the Render dashboard after the first deploy.

**Note:** Free tier sleeps after inactivity; the first visit may take ~30 seconds to wake up. In-memory rooms are lost when the server restarts or sleeps.

---

## Railway

1. [https://railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
2. Add service from this repo.
3. **Settings → Deploy:**
   - Build: `npm run install:all && npm run build`
   - Start: `npm start`
4. **Variables:**
   - `NODE_ENV=production`
   - `OPENAI_API_KEY=...`
   - `CLIENT_URL=https://YOUR-RAILWAY-DOMAIN.up.railway.app`
5. Generate a public domain under **Networking**.

---

## Fly.io

```bash
# Install flyctl, then from project root:
fly launch
fly secrets set OPENAI_API_KEY=sk-your-key
fly secrets set NODE_ENV=production
fly secrets set CLIENT_URL=https://your-app.fly.dev
```

Use a `Dockerfile` or Fly’s Node buildpack with:

- Build: `npm run install:all && npm run build`
- Start: `npm start`

---

## VPS (DigitalOcean, AWS EC2, etc.)

On the server:

```bash
git clone <your-repo-url>
cd trivia-app
npm run install:all

# server/.env
# OPENAI_API_KEY=sk-...
# NODE_ENV=production
# PORT=3001
# CLIENT_URL=https://yourdomain.com

npm run build
npm start
```

Use **PM2** to keep it running:

```bash
npm install -g pm2
pm2 start npm --name trivia -- start
pm2 save
pm2 startup
```

Put **Nginx** in front with SSL and proxy to `localhost:3001`, including WebSocket headers:

```nginx
location / {
  proxy_pass http://127.0.0.1:3001;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}
```

---

## Production build (local test)

Simulate production on your machine:

```bash
npm run install:all
# set server/.env: NODE_ENV=production, OPENAI_API_KEY, CLIENT_URL=http://localhost:3001
npm run build
NODE_ENV=production npm start
```

Open `http://localhost:3001` (one port for everything).

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI key for question generation |
| `NODE_ENV` | Yes (prod) | Set to `production` when deployed |
| `PORT` | No | Host port (Render/Railway set this automatically) |
| `CLIENT_URL` | Yes (prod) | Public `https://` URL of your app |

`VITE_SERVER_URL` is **not** needed in production if frontend and backend share the same URL.

---

## Limitations (MVP)

- **In-memory state** — rooms/games disappear on server restart or deploy.
- **Single instance** — scale to multiple servers would need Redis + sticky sessions (not included).
- **Free hosting sleep** — players may disconnect when the host platform spins down.

---

## Checklist after deploy

- [ ] `https://your-url/api/health` returns `{"status":"ok",...}`
- [ ] Create room works
- [ ] Second browser/tab can join
- [ ] Start game generates questions (OpenAI key valid)
- [ ] Chat and quiz work
