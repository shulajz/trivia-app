const rankStyles = {
  1: 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-300',
  2: 'bg-gray-100 border-gray-300',
  3: 'bg-orange-50 border-orange-300',
};

const rankMedals = { 1: '🥇', 2: '🥈', 3: '🥉' };

const LeaderboardList = ({ rankings, highlightTop = 3 }) => (
  <ul className="space-y-3" aria-label="Leaderboard rankings">
    {rankings.map((player, index) => {
      const isTop = player.rank <= highlightTop;
      const style = rankStyles[player.rank] || 'bg-white border-gray-200';

      return (
        <li
          key={player.id || player.name}
          className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 transition-all duration-300 animate-slide-up ${style}`}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-gray-400 w-8">
              {rankMedals[player.rank] || `#${player.rank}`}
            </span>
            <span className="text-lg font-bold text-gray-800">
              {player.name}
              {player.isHost && (
                <span className="ml-2 text-xs text-indigo-500">(Host)</span>
              )}
            </span>
          </div>
          <span
            className={`text-xl font-black ${isTop ? 'text-indigo-600' : 'text-gray-600'}`}
          >
            {player.score}
          </span>
        </li>
      );
    })}
  </ul>
);

export default LeaderboardList;
