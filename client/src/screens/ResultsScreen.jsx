import Card from '../components/Card';
import Button from '../components/Button';
import LeaderboardList from '../components/LeaderboardList';

const ResultsScreen = ({ gameFinished, onPlayAgain }) => (
  <div className="animate-fade-in space-y-4">
    <Card className="text-center">
      <p className="text-sm font-bold uppercase tracking-wider text-pink-500">
        Game Over
      </p>

      {gameFinished.winner && (
        <div className="mt-4 animate-winner">
          <p className="text-6xl mb-2">🏆</p>
          <h2 className="text-3xl font-black text-gray-800">
            {gameFinished.winner.name} Wins!
          </h2>
          <p className="mt-2 text-xl font-bold text-indigo-600">
            {gameFinished.winner.score} points
          </p>
        </div>
      )}
    </Card>

    <Card>
      <h3 className="mb-4 text-xl font-black text-gray-800 text-center">
        Final Rankings
      </h3>
      <LeaderboardList rankings={gameFinished.rankings} />
    </Card>

    <Button onClick={onPlayAgain} ariaLabel="Play again">
      Play Again
    </Button>
  </div>
);

export default ResultsScreen;
