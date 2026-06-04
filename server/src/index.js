import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerSocketHandlers } from './socket/handlers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const PORT = process.env.PORT || 3001;
const CLIENT_URL =
  process.env.CLIENT_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  'http://localhost:5173';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: isProduction ? true : CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(
  cors(
    isProduction
      ? { origin: true, credentials: true }
      : { origin: CLIENT_URL },
  ),
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Trivia Battle server is running' });
});

registerSocketHandlers(io);

if (isProduction) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io')) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${PORT} is already in use.\n` +
        `  • Stop the other process, or\n` +
        `  • Set a different PORT in server/.env\n`,
    );
    process.exit(1);
  }
  throw err;
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
  if (isProduction) {
    console.log(`App + API + WebSockets: ${CLIENT_URL}`);
  }
});
