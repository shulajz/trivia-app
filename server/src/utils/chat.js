export const MAX_CHAT_LENGTH = 200;
export const MAX_CHAT_MESSAGES = 50;

export const createChatMessage = (playerId, playerName, text) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  playerId,
  playerName,
  text,
  timestamp: Date.now(),
});

export const addMessageToRoom = (room, message) => {
  if (!room.messages) {
    room.messages = [];
  }

  room.messages.push(message);

  if (room.messages.length > MAX_CHAT_MESSAGES) {
    room.messages = room.messages.slice(-MAX_CHAT_MESSAGES);
  }
};

export const sanitizeChatText = (text) => {
  const trimmed = text?.trim() || '';
  if (!trimmed) return null;
  if (trimmed.length > MAX_CHAT_LENGTH) {
    return trimmed.slice(0, MAX_CHAT_LENGTH);
  }
  return trimmed;
};
