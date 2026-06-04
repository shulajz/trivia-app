const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateRoomCode = (existingCodes) => {
  let code = '';
  let attempts = 0;

  do {
    code = '';
    for (let i = 0; i < 6; i += 1) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    attempts += 1;
  } while (existingCodes.has(code) && attempts < 100);

  return code;
};
