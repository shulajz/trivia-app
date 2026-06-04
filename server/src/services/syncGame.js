import { games } from '../state/games.js';
import { rooms, getRoomPayload } from '../state/rooms.js';
import {
  getPublicQuestion,
  calculateScore,
  getLeaderboard,
  QUESTION_DURATION_SEC,
  TOTAL_QUESTIONS,
} from './gameEngine.js';

export const buildGameSyncPayload = (roomCode) => {
  const room = rooms[roomCode];
  if (!room) return null;

  const base = {
    room: getRoomPayload(room),
    chatMessages: room.messages || [],
  };

  if (room.status === 'lobby') {
    return { ...base, screen: 'lobby' };
  }

  if (room.status === 'generating') {
    return { ...base, screen: 'loading', isGenerating: true };
  }

  if (room.status === 'finished') {
    const rankings = getLeaderboard(room);
    return {
      ...base,
      screen: 'results',
      gameFinished: { winner: rankings[0] || null, rankings, room: base.room },
    };
  }

  const game = games[roomCode];
  if (!game) {
    return { ...base, screen: 'lobby' };
  }

  if (game.phase === 'leaderboard') {
    return {
      ...base,
      screen: 'leaderboard',
      leaderboard: {
        questionNumber: game.currentQuestionIndex + 1,
        totalQuestions: TOTAL_QUESTIONS,
        rankings: getLeaderboard(room),
        room: base.room,
      },
    };
  }

  const question = game.questions[game.currentQuestionIndex];
  if (!question) {
    return { ...base, screen: 'lobby' };
  }

  const publicQuestion = getPublicQuestion(
    question,
    game.currentQuestionIndex,
    room.category,
  );

  const endsAt = game.questionStartTime + QUESTION_DURATION_SEC * 1000;

  if (game.phase === 'question') {
    return {
      ...base,
      screen: 'quiz',
      currentQuestion: { ...publicQuestion, endsAt },
      questionEnded: null,
    };
  }

  if (game.phase === 'revealing') {
    const results = {};
    for (const player of room.players) {
      const submission = game.submittedAnswers[player.id];
      let pointsEarned = 0;
      let isCorrect = false;
      let selectedAnswer = null;

      if (submission) {
        selectedAnswer = submission.answer;
        isCorrect = submission.answer === question.correctAnswer;
        pointsEarned = calculateScore(isCorrect, submission.elapsedMs);
      }

      results[player.id] = {
        name: player.name,
        selectedAnswer,
        isCorrect,
        pointsEarned,
      };
    }

    return {
      ...base,
      screen: 'quiz',
      currentQuestion: { ...publicQuestion, endsAt },
      questionEnded: {
        questionNumber: game.currentQuestionIndex + 1,
        correctAnswer: question.correctAnswer,
        results,
      },
    };
  }

  return { ...base, screen: 'lobby' };
};
