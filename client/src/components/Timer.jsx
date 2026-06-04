import { useEffect, useState } from 'react';

const Timer = ({ endsAt, timeLimit }) => {
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [endsAt, timeLimit]);

  const progress = (secondsLeft / timeLimit) * 100;
  const isUrgent = secondsLeft <= 5;

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">Time remaining</span>
        <span
          className={`text-2xl font-black tabular-nums ${isUrgent ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`}
        >
          {secondsLeft}s
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-100 ${isUrgent ? 'bg-red-500' : 'bg-indigo-500'}`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={secondsLeft}
          aria-valuemin={0}
          aria-valuemax={timeLimit}
        />
      </div>
    </div>
  );
};

export default Timer;
