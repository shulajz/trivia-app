export const SUPPORTED_DIFFICULTIES = ['easy', 'medium', 'hard'];

export const normalizeDifficulty = (difficulty) => {
  const code = difficulty?.trim().toLowerCase();
  if (code === 'easy' || code === 'hard') return code;
  return 'medium';
};

export const getDifficultyLabel = (difficulty) => {
  const code = normalizeDifficulty(difficulty);
  if (code === 'easy') return 'Easy';
  if (code === 'hard') return 'Hard';
  return 'Medium';
};
