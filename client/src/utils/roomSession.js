const SESSION_KEY = 'trivia-room-session';

export const saveRoomSession = (session) => {
  if (!session?.roomCode || !session?.playerName) return;

  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ ...session, wasInRoom: true }),
    );
  } catch {
    // Storage full or unavailable
  }
};

export const loadRoomSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearRoomSession = () => {
  localStorage.removeItem(SESSION_KEY);
};
