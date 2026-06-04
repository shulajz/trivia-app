# Trivia Battle

A live multiplayer trivia competition web app. One host creates a room, up to 7 others join, and everyone competes on AI-generated questions in real time.

## Tech Stack

- **Frontend:** React + Vite, JavaScript, Tailwind CSS, Socket.IO Client
- **Backend:** Node.js + Express, Socket.IO, OpenAI API
- **Storage:** In-memory only (no database)

## Quick Start

### 1. Install dependencies

```bash
npm run install:all
```

Or install separately:

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment

Copy the example env files and add your OpenAI API key:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` (copy from `server/.env.example`):

```
OPENAI_API_KEY=sk-your-key-here
PORT=3001
CLIENT_URL=http://localhost:5173
```

An **OpenAI API key is required** — the game will not start without it.

### Background music

Add a looping MP3 at `client/public/audio/trivia-bg.mp3` (see `client/public/audio/README.md`). Music plays when the host starts the game; use 🔊 during a game to mute/unmute.

### 3. Run locally

From the project root:

```bash
npm install
npm run dev
```

Or run each part separately:

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

> **Mac note:** Port 5000 is often used by AirPlay Receiver. This project defaults to **3001** to avoid that conflict.

## Deploy

Production runs **one** Node process: it serves the built React app and Socket.IO on the same URL.

```bash
npm run build    # builds client → client/dist
npm start        # NODE_ENV=production, serves app + API
```

Full steps for **Render**, **Railway**, **Fly.io**, and a VPS: see **[DEPLOY.md](./DEPLOY.md)**.

Required in production: `OPENAI_API_KEY`, `NODE_ENV=production`, and `CLIENT_URL` set to your public `https://` URL.

## How to Play

1. **Create Room** — Enter your name, pick **English or Hebrew**, **Easy / Medium / Hard**, and a category, then get a 6-letter room code.
2. **Join Room** — Other players enter the code and their name (up to 8 total).
3. **Lobby** — Host sees all players and clicks **Start Game**.
4. **Quiz** — 10 AI questions, 15 seconds each. Faster correct answers earn bonus points.
5. **Leaderboard** — Rankings shown after each question.
6. **Results** — Winner and final standings.

## Scoring

| Result | Points |
|--------|--------|
| Correct (base) | 100 |
| Answer ≤ 3 sec | +50 bonus |
| Answer ≤ 6 sec | +30 bonus |
| Answer ≤ 10 sec | +10 bonus |
| Wrong / no answer | 0 |

## Project Structure

```
trivia-app/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── screens/
│       ├── hooks/
│       ├── socket/
│       └── utils/
└── server/          # Express + Socket.IO backend
    └── src/
        ├── socket/
        ├── services/
        ├── state/
        └── utils/
```

## Socket Events

**Client → Server:** `createRoom`, `joinRoom`, `startGame`, `submitAnswer`, `sendChat`, `leaveRoom`

**Server → Client:** `roomCreated`, `playerJoined`, `roomUpdated`, `gameStarted`, `questionStarted`, `questionEnded`, `leaderboardUpdated`, `gameFinished`, `chatHistory`, `chatMessage`, `errorMessage`

Room chat (max 200 characters, last 50 messages in memory) stays fixed at the bottom during **lobby**, **quiz**, and **leaderboards** — it does not reset between questions. Messages are saved locally and restored on page reload; rejoin the same room with the same name to reconnect mid-game.

## Categories

Any Category, General Knowledge, Geography, History, Science, Technology, Sports, Movies, TV Shows, Music, Video Games, Food, Animals, Israel, Bible, Hebrew Slang
