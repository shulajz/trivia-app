import { shuffleArray } from '../utils/shuffle.js';
import { games } from '../state/games.js';
import { rooms, getRoomPayload } from '../state/rooms.js';

export const QUESTION_DURATION_SEC = 15;
export const TOTAL_QUESTIONS = 10;
export const LEADERBOARD_DISPLAY_MS = 4000;

export const calculateScore = (isCorrect, elapsedMs) => {
  if (!isCorrect) return 0;

  const seconds = elapsedMs / 1000;
  let bonus = 0;

  if (seconds <= 3) bonus = 50;
  else if (seconds <= 6) bonus = 30;
  else if (seconds <= 10) bonus = 10;

  return 100 + bonus;
};

export const createGame = (roomCode, questions) => {
  const game = {
    roomCode,
    questions,
    currentQuestionIndex: -1,
    questionStartTime: null,
    submittedAnswers: {},
    questionTimer: null,
    phase: 'playing',
  };

  games[roomCode] = game;
  return game;
};

export const getPublicQuestion = (question, index, roomCategory) => ({
  questionNumber: index + 1,
  totalQuestions: TOTAL_QUESTIONS,
  category: question.category || roomCategory,
  question: question.question,
  answers: shuffleArray(question.answers),
  timeLimit: QUESTION_DURATION_SEC,
});

export const getLeaderboard = (room) => {
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  return sorted.map((player, idx) => ({
    id: player.id,
    name: player.name,
    score: player.score,
    rank: idx + 1,
    isHost: player.id === room.hostId,
  }));
};

export const clearQuestionTimer = (game) => {
  if (game.questionTimer) {
    clearTimeout(game.questionTimer);
    game.questionTimer = null;
  }
};

export const startNextQuestion = (io, roomCode) => {
  const game = games[roomCode];
  const room = rooms[roomCode];

  if (!game || !room) return;

  clearQuestionTimer(game);
  game.submittedAnswers = {};
  game.currentQuestionIndex += 1;

  if (game.currentQuestionIndex >= TOTAL_QUESTIONS) {
    finishGame(io, roomCode);
    return;
  }

  const question = game.questions[game.currentQuestionIndex];
  game.questionStartTime = Date.now();
  game.phase = 'question';

  const publicQuestion = getPublicQuestion(
    question,
    game.currentQuestionIndex,
    room.category,
  );

  io.to(roomCode).emit('questionStarted', {
    ...publicQuestion,
    endsAt: Date.now() + QUESTION_DURATION_SEC * 1000,
  });

  game.questionTimer = setTimeout(() => {
    endQuestion(io, roomCode);
  }, QUESTION_DURATION_SEC * 1000);
};

export const endQuestion = (io, roomCode) => {
  const game = games[roomCode];
  const room = rooms[roomCode];

  if (!game || !room || game.phase !== 'question') return;

  clearQuestionTimer(game);
  game.phase = 'revealing';

  const question = game.questions[game.currentQuestionIndex];
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
      player.score += pointsEarned;
    }

    results[player.id] = {
      name: player.name,
      selectedAnswer,
      isCorrect,
      pointsEarned,
    };
  }

  io.to(roomCode).emit('questionEnded', {
    questionNumber: game.currentQuestionIndex + 1,
    correctAnswer: question.correctAnswer,
    results,
  });

  setTimeout(() => {
    showLeaderboard(io, roomCode);
  }, 2500);
};

export const showLeaderboard = (io, roomCode) => {
  const game = games[roomCode];
  const room = rooms[roomCode];

  if (!game || !room) return;

  game.phase = 'leaderboard';

  const rankings = getLeaderboard(room);

  io.to(roomCode).emit('leaderboardUpdated', {
    questionNumber: game.currentQuestionIndex + 1,
    totalQuestions: TOTAL_QUESTIONS,
    rankings,
    room: getRoomPayload(room),
  });

  setTimeout(() => {
    if (game.currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
      finishGame(io, roomCode);
    } else {
      startNextQuestion(io, roomCode);
    }
  }, LEADERBOARD_DISPLAY_MS);
};

export const finishGame = (io, roomCode) => {
  const game = games[roomCode];
  const room = rooms[roomCode];

  if (!game || !room) return;

  clearQuestionTimer(game);
  game.phase = 'finished';
  room.status = 'finished';

  const rankings = getLeaderboard(room);
  const winner = rankings[0] || null;

  io.to(roomCode).emit('gameFinished', {
    winner,
    rankings,
    room: getRoomPayload(room),
  });

  delete games[roomCode];
};

export const handleAnswerSubmission = (io, roomCode, socketId, answer) => {
  const game = games[roomCode];
  const room = rooms[roomCode];

  if (!game || !room || game.phase !== 'question') return false;

  if (game.submittedAnswers[socketId]) return false;

  const question = game.questions[game.currentQuestionIndex];
  if (!question.answers.includes(answer)) return false;

  const elapsedMs = Date.now() - game.questionStartTime;
  game.submittedAnswers[socketId] = { answer, elapsedMs };

  const activePlayers = room.players.filter((p) => p.connected !== false);
  const allAnswered = activePlayers.every((p) => game.submittedAnswers[p.id]);

  if (allAnswered) {
    endQuestion(io, roomCode);
  }

  return true;
};
