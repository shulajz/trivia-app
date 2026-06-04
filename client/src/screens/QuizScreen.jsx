import { useState } from 'react';
import Card from '../components/Card';
import Timer from '../components/Timer';
const QuizScreen = ({
  question,
  questionEnded,
  playerId,
  onSubmitAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSelectAnswer = (answer) => {
    if (hasSubmitted || questionEnded) return;

    setSelectedAnswer(answer);
    setHasSubmitted(true);
    onSubmitAnswer(answer);
  };

  const getAnswerStyle = (answer) => {
    if (!questionEnded) {
      if (selectedAnswer === answer) {
        return 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300';
      }
      return 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50';
    }

    const isCorrect = answer === questionEnded.correctAnswer;
    const wasSelected = selectedAnswer === answer;
    const myResult = questionEnded.results?.[playerId];

    if (isCorrect) {
      return 'border-green-500 bg-green-50 ring-2 ring-green-300';
    }

    if (wasSelected && myResult && !myResult.isCorrect) {
      return 'border-red-500 bg-red-50 ring-2 ring-red-300';
    }

    return 'border-gray-200 bg-gray-50 opacity-70';
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
            Q{question.questionNumber}/{question.totalQuestions}
          </span>
          <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-bold text-pink-700">
            {question.category}
          </span>
        </div>

        {!questionEnded && (
          <Timer endsAt={question.endsAt} timeLimit={question.timeLimit} />
        )}

        <h2
          className={`mb-6 text-xl font-bold leading-snug text-gray-800 md:text-2xl ${question.category?.includes('Hebrew') || /[\u0590-\u05FF]/.test(question.question) ? 'text-right' : ''}`}
          dir={/[\u0590-\u05FF]/.test(question.question) ? 'rtl' : 'ltr'}
        >
          {question.question}
        </h2>

        <div className="grid gap-3" role="group" aria-label="Answer options">
          {question.answers.map((answer) => (
            <button
              key={answer}
              type="button"
              onClick={() => handleSelectAnswer(answer)}
              disabled={hasSubmitted || !!questionEnded}
              dir={/[\u0590-\u05FF]/.test(answer) ? 'rtl' : 'ltr'}
              className={`rounded-2xl border-2 px-5 py-4 text-lg font-semibold text-gray-800 transition-all duration-200 ${/[\u0590-\u05FF]/.test(answer) ? 'text-right' : 'text-left'} ${getAnswerStyle(answer)} disabled:cursor-default`}
              aria-label={`Answer: ${answer}`}
            >
              {answer}
              {questionEnded && answer === questionEnded.correctAnswer && (
                <span className="ml-2 text-green-600">✓</span>
              )}
            </button>
          ))}
        </div>

        {questionEnded && questionEnded.results?.[playerId] && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-center font-bold ${
              questionEnded.results[playerId].isCorrect
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {questionEnded.results[playerId].isCorrect
              ? `Correct! +${questionEnded.results[playerId].pointsEarned} points`
              : 'Wrong answer — 0 points'}
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuizScreen;
