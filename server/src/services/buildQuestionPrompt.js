import { buildVarietyHints } from '../utils/questionVariety.js';

const languageInstructions = {
  en: `
* Write ALL question text and ALL four answer choices in English.
* The correctAnswer must exactly match one of the four answers (in English).`,
  he: `
* Write ALL question text and ALL four answer choices in Hebrew (עברית), using Hebrew script.
* The correctAnswer must exactly match one of the four answers (in Hebrew).
* Category names in the JSON "category" field may stay in English for parsing.
* JSON formatting is critical: use standard JSON only — ASCII double quotes " for all keys and string values.
* Never use single quotes ' for JSON strings. Never use trailing commas.`,
};

const difficultyInstructions = {
  easy: `
* Difficulty level: EASY.
* All 10 questions should be easy (set "difficulty": "easy" on every question).
* Use well-known facts that most people would recognize.
* Keep wording simple and straightforward.
* Incorrect answers should be clearly wrong to someone with basic knowledge.`,
  medium: `
* Difficulty level: MEDIUM.
* Use a balanced mix: about 3 easy, 4 medium, and 3 hard questions.
* Set each question's "difficulty" field to "easy", "medium", or "hard" accordingly.
* Include some questions that require thought but are not obscure.`,
  hard: `
* Difficulty level: HARD.
* All 10 questions should be hard (set "difficulty": "hard" on every question).
* Use challenging, specific, or lesser-known facts within the category.
* Incorrect answers must still be plausible to an expert.`,
};

export const buildQuestionPrompt = (
  category,
  language = 'en',
  difficulty = 'medium',
) => {
  const lang = language === 'he' ? 'he' : 'en';
  const languageLabel = lang === 'he' ? 'Hebrew' : 'English';
  const level = difficulty === 'easy' || difficulty === 'hard' ? difficulty : 'medium';
  const difficultyLabel = level.charAt(0).toUpperCase() + level.slice(1);
  const variety = buildVarietyHints(category);

  return `
Generate exactly 10 trivia questions.

Category: ${category}
Language: ${languageLabel}
Challenge level: ${difficultyLabel}
Unique batch: ${variety.batchId}

Variety requirements (critical):
* ${variety.focusLine}
* All 10 questions must be clearly different from each other — different topics, people, places, dates, or events.
* Do NOT reuse the same question structure repeatedly (avoid 5 "who was..." or 5 "in what year..." questions).
${variety.banLines}

Requirements:

* Return ONLY valid JSON.
* Do not include markdown.
* Do not include explanations.
* Do not include code fences.
* Return a JSON array.
* Generate exactly 10 questions.
* Each question must have exactly 4 answer choices.
* Exactly 1 answer must be correct.
* Questions must be factually accurate.
* Questions must belong to the requested category.
* If the category is "Any Category", mix questions from different common trivia categories.
* Avoid trick questions.
* Avoid ambiguous questions.
* Avoid duplicate or near-duplicate questions within this batch.
* Make incorrect answers plausible but clearly incorrect.
${difficultyInstructions[level]}
${languageInstructions[lang]}

Return ONLY a JSON object in this exact shape (no markdown, no extra text):

{
"questions": [
{
"question": "What is the capital of France?",
"answers": ["Paris", "London", "Madrid", "Berlin"],
"correctAnswer": "Paris",
"category": "Geography",
"difficulty": "easy"
}
]
}

The "questions" array must contain exactly 10 items.

Generate exactly 10 questions now.
`;
};
