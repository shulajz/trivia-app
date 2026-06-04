import Card from '../components/Card';
import ErrorAlert from '../components/ErrorAlert';

const LoadingScreen = ({ error, onCancel }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center animate-fade-in">
    <Card className="w-full max-w-md text-center">
      <div className="mb-4 text-5xl animate-pulse">🧠</div>
      <h2 className="text-2xl font-black text-gray-800">Generating Questions</h2>
      <p className="mt-2 text-gray-600">AI is crafting your trivia battle...</p>
      <p className="mt-1 text-sm text-gray-400">This usually takes 10–30 seconds</p>

      <div className="mt-6 flex justify-center gap-2">
        <span className="h-3 w-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-3 w-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-3 w-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorAlert message={error} />
        </div>
      )}

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          Cancel and return to lobby
        </button>
      )}
    </Card>
  </div>
);

export default LoadingScreen;
