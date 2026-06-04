import Card from '../components/Card';
import LeaderboardList from '../components/LeaderboardList';
const LeaderboardScreen = ({ leaderboard }) => (
  <div className="animate-fade-in">
    <Card>
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-black text-gray-800">Leaderboard</h2>
        <p className="mt-1 text-gray-500">
          After question {leaderboard.questionNumber} of {leaderboard.totalQuestions}
        </p>
      </div>

      <LeaderboardList rankings={leaderboard.rankings} />

      <p className="mt-6 text-center text-sm text-gray-400 animate-pulse">
        Next question coming up...
      </p>
    </Card>
  </div>
);

export default LeaderboardScreen;
