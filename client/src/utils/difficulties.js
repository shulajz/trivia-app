export const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const DEFAULT_DIFFICULTY = 'medium';

export const getDifficultyLabel = (value) =>
  DIFFICULTIES.find((d) => d.value === value)?.label || 'Medium';
