export const rooms = {};
export const MAX_PLAYERS = 8;

export const getRoomList = () => Object.keys(rooms);

export const getPlayerBySocketId = (room, socketId) =>
  room.players.find((p) => p.id === socketId);

export const getRoomPayload = (room) => ({
  roomCode: room.roomCode,
  category: room.category,
  language: room.language || 'en',
  languageLabel: room.language === 'he' ? 'עברית' : 'English',
  difficulty: room.difficulty || 'medium',
  difficultyLabel:
    room.difficulty === 'easy'
      ? 'Easy'
      : room.difficulty === 'hard'
        ? 'Hard'
        : 'Medium',
  hostId: room.hostId,
  hostName: room.players.find((p) => p.id === room.hostId)?.name || 'Unknown',
  players: room.players
    .filter((p) => p.connected !== false)
    .map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      isHost: p.id === room.hostId,
    })),
  playerCount: room.players.filter((p) => p.connected !== false).length,
  maxPlayers: MAX_PLAYERS,
  status: room.status,
});
