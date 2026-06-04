import Card from '../components/Card';
import Button from '../components/Button';

const HomeScreen = ({ onCreateRoom, onJoinRoom }) => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
    <div className="mb-8">
      <h1 className="mb-3 text-5xl font-black text-white drop-shadow-lg md:text-6xl">
        AI Trivia Battle
      </h1>
      <p className="text-xl text-white/90">
        Live multiplayer trivia with AI-generated questions — up to 8 players!
      </p>
    </div>

    <Card className="w-full max-w-md space-y-4">
      <Button onClick={onCreateRoom} ariaLabel="Create a new room">
        Create Room
      </Button>
      <Button onClick={onJoinRoom} variant="secondary" ariaLabel="Join an existing room">
        Join Room
      </Button>
    </Card>
  </div>
);

export default HomeScreen;
