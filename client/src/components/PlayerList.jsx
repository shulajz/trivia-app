const PlayerList = ({ players, hostId }) => (
  <ul className="space-y-2" aria-label="Players in room">
    {players.map((player) => (
      <li
        key={player.id}
        className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3 transition-all duration-200"
      >
        <span className="font-semibold text-gray-800">
          {player.name}
          {player.id === hostId && (
            <span className="ml-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-purple-900">
              HOST
            </span>
          )}
        </span>
        {player.score > 0 && (
          <span className="font-bold text-indigo-600">{player.score} pts</span>
        )}
      </li>
    ))}
  </ul>
);

export default PlayerList;
