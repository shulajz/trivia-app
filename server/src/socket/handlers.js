import { rooms, MAX_PLAYERS, getRoomPayload } from '../state/rooms.js';
import { games } from '../state/games.js';
import { generateRoomCode } from '../utils/roomCode.js';
import { normalizeLanguage } from '../utils/languages.js';
import { normalizeDifficulty } from '../utils/difficulty.js';
import { generateQuestions } from '../services/openai.js';
import { buildGameSyncPayload } from '../services/syncGame.js';
import {
  createGame,
  startNextQuestion,
  handleAnswerSubmission,
} from '../services/gameEngine.js';
import {
  createChatMessage,
  addMessageToRoom,
  sanitizeChatText,
} from '../utils/chat.js';

const emitError = (socket, message) => {
  socket.emit('errorMessage', { message });
};

const broadcastRoomUpdate = (io, roomCode) => {
  const room = rooms[roomCode];
  if (!room) return;
  io.to(roomCode).emit('roomUpdated', getRoomPayload(room));
};

const emitChatHistory = (socket, room) => {
  socket.emit('chatHistory', { messages: room.messages || [] });
};

const isActiveRoom = (room) =>
  room.status === 'playing' || room.status === 'generating';

const assignNewHost = (room) => {
  const connectedPlayers = room.players.filter((p) => p.connected !== false);
  if (connectedPlayers.length === 0) return;

  room.hostId = connectedPlayers[0].id;
};

const findDisconnectedPlayer = (room, name) =>
  room.players.find(
    (p) =>
      p.connected === false &&
      p.name.toLowerCase() === name.toLowerCase(),
  );

const attachPlayerToRoom = (socket, room, player) => {
  player.id = socket.id;
  player.connected = true;
  socket.data.roomCode = room.roomCode;
  socket.data.playerName = player.name;
  socket.join(room.roomCode);
};

const completeReconnect = (io, socket, room, player) => {
  attachPlayerToRoom(socket, room, player);

  if (room.hostId !== socket.id) {
    const hostPlayer = room.players.find((p) => p.id === room.hostId);
    if (!hostPlayer || hostPlayer.connected === false) {
      assignNewHost(room);
    }
  }

  const sync = buildGameSyncPayload(room.roomCode);
  socket.emit('playerReconnected', sync);
  emitChatHistory(socket, room);
  broadcastRoomUpdate(io, room.roomCode);
};

const tryReconnectPlayer = (socket, room, name) => {
  const disconnected = findDisconnectedPlayer(room, name);
  if (!disconnected) return false;

  completeReconnect(io, socket, room, disconnected);
  return true;
};

const removePlayerFromRoom = (io, socket, { forceRemove = false } = {}) => {
  const roomCode = socket.data.roomCode;
  if (!roomCode || !rooms[roomCode]) return;

  const room = rooms[roomCode];
  const player = room.players.find((p) => p.id === socket.id);
  if (!player) return;

  const wasHost = room.hostId === socket.id;
  socket.leave(roomCode);

  if (isActiveRoom(room) && !forceRemove) {
    player.connected = false;

    if (wasHost) {
      assignNewHost(room);
    }

    broadcastRoomUpdate(io, roomCode);
    return;
  }

  room.players = room.players.filter((p) => p.id !== socket.id);

  if (room.players.length === 0) {
    delete rooms[roomCode];
    delete games[roomCode];
    return;
  }

  if (wasHost) {
    assignNewHost(room);
  }

  broadcastRoomUpdate(io, roomCode);
};

const handleJoinOrReconnect = (io, socket, { roomCode, playerName }) => {
  const code = roomCode?.trim().toUpperCase();
  const name = playerName?.trim();

  if (!name) {
    emitError(socket, 'Please enter a valid player name');
    return;
  }

  if (!code) {
    emitError(socket, 'Please enter a room code');
    return;
  }

  const room = rooms[code];

  if (!room) {
    emitError(socket, 'Room does not exist. Check the code and try again.');
    return;
  }

  if (tryReconnectPlayer(socket, room, name)) {
    return;
  }

  if (room.status !== 'lobby') {
    emitError(socket, 'This game has already started. Rejoin with the same name you used before.');
    return;
  }

  const connectedCount = room.players.filter((p) => p.connected !== false).length;
  if (connectedCount >= MAX_PLAYERS) {
    emitError(socket, 'Room is full (8/8 players)');
    return;
  }

  const nameTaken = room.players.some(
    (p) =>
      p.connected !== false &&
      p.name.toLowerCase() === name.toLowerCase(),
  );

  if (nameTaken) {
    emitError(socket, 'That name is already taken in this room');
    return;
  }

  const player = {
    id: socket.id,
    name,
    score: 0,
    connected: true,
  };

  room.players.push(player);
  socket.data.roomCode = code;
  socket.data.playerName = name;
  socket.join(code);

  socket.emit('playerJoined', getRoomPayload(room));
  emitChatHistory(socket, room);
  io.to(code).emit('roomUpdated', getRoomPayload(room));
};

export const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    socket.on('createRoom', ({ playerName, category, language, difficulty }) => {
      const name = playerName?.trim();
      const cat = category?.trim();
      const lang = normalizeLanguage(language);
      const level = normalizeDifficulty(difficulty);

      if (!name || name.length < 1) {
        emitError(socket, 'Please enter a valid player name');
        return;
      }

      if (!cat) {
        emitError(socket, 'Please select a category');
        return;
      }

      const existingCodes = new Set(Object.keys(rooms));
      const roomCode = generateRoomCode(existingCodes);

      const room = {
        roomCode,
        hostId: socket.id,
        category: cat,
        language: lang,
        difficulty: level,
        status: 'lobby',
        messages: [],
        players: [
          {
            id: socket.id,
            name,
            score: 0,
            connected: true,
          },
        ],
      };

      rooms[roomCode] = room;
      socket.data.roomCode = roomCode;
      socket.data.playerName = name;
      socket.join(roomCode);

      socket.emit('roomCreated', getRoomPayload(room));
      emitChatHistory(socket, room);
      io.to(roomCode).emit('roomUpdated', getRoomPayload(room));
    });

    socket.on('joinRoom', (payload) => {
      handleJoinOrReconnect(io, socket, payload);
    });

    socket.on('reconnectRoom', (payload) => {
      handleJoinOrReconnect(io, socket, payload);
    });

    socket.on('sendChat', ({ text }) => {
      const roomCode = socket.data.roomCode;
      const playerName = socket.data.playerName;

      if (!roomCode || !rooms[roomCode]) {
        emitError(socket, 'You are not in a room');
        return;
      }

      const room = rooms[roomCode];
      const sanitized = sanitizeChatText(text);

      if (!sanitized) {
        emitError(socket, 'Message cannot be empty');
        return;
      }

      const message = createChatMessage(socket.id, playerName, sanitized);
      addMessageToRoom(room, message);

      io.to(roomCode).emit('chatMessage', message);
    });

    socket.on('startGame', async () => {
      const roomCode = socket.data.roomCode;
      const room = rooms[roomCode];

      if (!room) {
        emitError(socket, 'Room not found');
        return;
      }

      if (room.hostId !== socket.id) {
        emitError(socket, 'Only the host can start the game');
        return;
      }

      if (room.status !== 'lobby') {
        emitError(socket, 'Game has already started');
        return;
      }

      if (room.players.length < 1) {
        emitError(socket, 'Need at least one player to start');
        return;
      }

      room.status = 'generating';
      broadcastRoomUpdate(io, roomCode);

      io.to(roomCode).emit('gameStarted', {
        message: 'Generating questions...',
        room: getRoomPayload(room),
      });

      try {
        console.log(
          `[trivia] Generating questions for room ${roomCode} (${room.category}, ${room.language}, ${room.difficulty})...`,
        );
        const questions = await generateQuestions(
          room.category,
          room.language,
          room.difficulty,
        );
        console.log(`[trivia] Questions ready for room ${roomCode}`);
        createGame(roomCode, questions);
        room.status = 'playing';

        startNextQuestion(io, roomCode);
      } catch (err) {
        console.error(`[trivia] Failed to generate questions for ${roomCode}:`, err.message);
        room.status = 'lobby';
        const message =
          err.message || 'Failed to generate questions. Add OPENAI_API_KEY to server/.env';
        io.to(roomCode).emit('gameGenerationFailed', { message });
        broadcastRoomUpdate(io, roomCode);
      }
    });

    socket.on('submitAnswer', ({ answer }) => {
      const roomCode = socket.data.roomCode;
      if (!roomCode) return;

      const success = handleAnswerSubmission(io, roomCode, socket.id, answer);
      if (!success) {
        emitError(socket, 'Could not submit answer');
      }
    });

    socket.on('leaveRoom', () => {
      removePlayerFromRoom(io, socket, { forceRemove: true });
      socket.data.roomCode = null;
      socket.data.playerName = null;
    });

    socket.on('disconnect', () => {
      removePlayerFromRoom(io, socket);
    });
  });
};
