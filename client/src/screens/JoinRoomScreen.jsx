import { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import ErrorAlert from '../components/ErrorAlert';

const JoinRoomScreen = ({ onJoinRoom, onBack, error, onClearError }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoinRoom(roomCode.toUpperCase(), playerName);
  };

  const handleCodeChange = (e) => {
    setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
  };

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-white/80 hover:text-white transition-colors"
        aria-label="Go back"
      >
        ← Back
      </button>

      <Card>
        <h2 className="mb-6 text-2xl font-black text-gray-800">Join Room</h2>
        <ErrorAlert message={error} onDismiss={onClearError} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Your Name"
            id="join-name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
          />

          <Input
            label="Room Code"
            id="join-code"
            value={roomCode}
            onChange={handleCodeChange}
            placeholder="e.g. ABC123"
            maxLength={6}
          />

          <Button type="submit" disabled={!playerName.trim() || roomCode.length < 6}>
            Join Room
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default JoinRoomScreen;
