import Card from '../components/Card';
import Button from '../components/Button';
import PlayerList from '../components/PlayerList';
import ErrorAlert from '../components/ErrorAlert';
const LobbyScreen = ({
  room,
  isHost,
  onStartGame,
  onLeave,
  error,
  onClearError,
}) => (
  <div className="animate-fade-in space-y-4">
    <ErrorAlert message={error} onDismiss={onClearError} />
    <Card>
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Room Code
        </p>
        <p className="mt-1 text-4xl font-black tracking-widest text-indigo-600">
          {room.roomCode}
        </p>
        <p className="mt-3 text-gray-600">
          Category: <span className="font-bold text-gray-800">{room.category}</span>
        </p>
        <p className="mt-1 text-gray-600">
          Language:{' '}
          <span className="font-bold text-gray-800">
            {room.languageLabel || (room.language === 'he' ? 'עברית' : 'English')}
          </span>
        </p>
        <p className="mt-1 text-gray-600">
          Challenge:{' '}
          <span className="font-bold text-gray-800">
            {room.difficultyLabel || 'Medium'}
          </span>
        </p>
        <p className="mt-1 text-gray-600">
          Host: <span className="font-bold text-gray-800">{room.hostName}</span>
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Players</h3>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
          {room.playerCount}/{room.maxPlayers}
        </span>
      </div>

      <PlayerList players={room.players} hostId={room.hostId} />
    </Card>

    {isHost ? (
      <Button onClick={onStartGame} ariaLabel="Start the game">
        Start Game
      </Button>
    ) : (
      <Card className="text-center">
        <p className="text-lg font-semibold text-gray-600 animate-pulse">
          Waiting for host to start...
        </p>
      </Card>
    )}

    <Button onClick={onLeave} variant="outline">
      Leave Room
    </Button>
  </div>
);

export default LobbyScreen;
