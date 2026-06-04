import OpenAI from 'openai';
import { buildQuestionPrompt } from './buildQuestionPrompt.js';
import { validateQuestions } from '../utils/validateQuestions.js';
import { parseQuestionsJson } from '../utils/parseQuestionsJson.js';

const MAX_RETRIES = 4;
const REQUEST_TIMEOUT_MS = 90000;

const withTimeout = (promise, ms, message) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });

export const generateQuestions = async (
  category,
  language = 'en',
  difficulty = 'medium',
) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error(
      'OPENAI_API_KEY is not configured. Add your key to server/.env (not .env.example).',
    );
  }

  const isHebrew = language === 'he';
  const client = new OpenAI({ apiKey });
  let lastError = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const response = await withTimeout(
        client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: isHebrew
                ? 'You generate trivia questions in Hebrew. Output must be valid JSON only: a single object {"questions":[...]} with exactly 10 items. Use ASCII double quotes for JSON syntax. Hebrew text goes inside those quoted strings.'
                : 'You generate trivia questions. Output valid JSON only: {"questions":[...]} with exactly 10 items. No markdown.',
            },
            {
              role: 'user',
              content: buildQuestionPrompt(category, language, difficulty),
            },
          ],
          response_format: { type: 'json_object' },
          temperature: isHebrew ? 0.75 : 0.95,
          top_p: isHebrew ? 0.85 : 0.9,
          presence_penalty: isHebrew ? 0.2 : 0.4,
          frequency_penalty: isHebrew ? 0.2 : 0.3,
        }),
        REQUEST_TIMEOUT_MS,
        'OpenAI request timed out after 90 seconds',
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const questions = parseQuestionsJson(content);
      const validation = validateQuestions(questions);

      if (!validation.valid) {
        lastError = new Error(validation.error);
        console.warn(`[trivia] Validation failed (attempt ${attempt + 1}):`, validation.error);
        continue;
      }

      return questions;
    } catch (err) {
      lastError = err;
      console.warn(`[trivia] OpenAI attempt ${attempt + 1} failed:`, err.message);
    }
  }

  throw lastError || new Error('Failed to generate valid questions from OpenAI');
};
