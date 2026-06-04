const normalizeQuestion = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05FF\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const areTooSimilar = (a, b) => {
  const normA = normalizeQuestion(a);
  const normB = normalizeQuestion(b);

  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const shorter = normA.length < normB.length ? normA : normB;
  const longer = normA.length < normB.length ? normB : normA;

  if (longer.includes(shorter) && shorter.length > 20) {
    return true;
  }

  const wordsA = new Set(normA.split(' ').filter((w) => w.length > 3));
  const wordsB = new Set(normB.split(' ').filter((w) => w.length > 3));

  if (wordsA.size === 0 || wordsB.size === 0) return false;

  let shared = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) shared += 1;
  }

  const overlap = shared / Math.min(wordsA.size, wordsB.size);
  return overlap > 0.75;
};

export const validateQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length !== 10) {
    return { valid: false, error: 'Expected exactly 10 questions' };
  }

  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];

    if (!q || typeof q.question !== 'string' || !q.question.trim()) {
      return { valid: false, error: `Question ${i + 1} has invalid question text` };
    }

    if (!Array.isArray(q.answers) || q.answers.length !== 4) {
      return { valid: false, error: `Question ${i + 1} must have exactly 4 answers` };
    }

    const uniqueAnswers = new Set(q.answers.map((a) => String(a).trim()));
    if (uniqueAnswers.size !== 4) {
      return { valid: false, error: `Question ${i + 1} has duplicate answers` };
    }

    if (!q.correctAnswer || !q.answers.includes(q.correctAnswer)) {
      return { valid: false, error: `Question ${i + 1} correctAnswer must be in answers` };
    }

    for (let j = i + 1; j < questions.length; j += 1) {
      if (areTooSimilar(q.question, questions[j].question)) {
        return {
          valid: false,
          error: `Questions ${i + 1} and ${j + 1} are too similar — need more variety`,
        };
      }
    }
  }

  return { valid: true };
};
