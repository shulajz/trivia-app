import { useEffect } from 'react';
import Layout from './components/Layout';
import ChatBox from './components/ChatBox';
import { useGameSocket } from './hooks/useGameSocket';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import HomeScreen from './screens/HomeScreen';
import CreateRoomScreen from './screens/CreateRoomScreen';
import JoinRoomScreen from './screens/JoinRoomScreen';
import LobbyScreen from './screens/LobbyScreen';
import LoadingScreen from './screens/LoadingScreen';
import QuizScreen from './screens/QuizScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ResultsScreen from './screens/ResultsScreen';

const GAME_MUSIC_SCREENS = ['loading', 'quiz', 'leaderboard'];
const ROOM_CHAT_SCREENS = ['lobby', 'loading', 'quiz', 'leaderboard'];

const App = () => {
  const game = useGameSocket();
  const { startMusic, stopMusic, enabled, toggleMusic, loadError } =
    useBackgroundMusic();

  useEffect(() => {
    if (GAME_MUSIC_SCREENS.includes(game.screen)) {
      startMusic();
    } else {
      stopMusic();
    }
  }, [game.screen, startMusic, stopMusic]);

  const handleStartGame = () => {
    startMusic();
    game.startGame();
  };

  const showChat = ROOM_CHAT_SCREENS.includes(game.screen) && game.room;

  const renderScreen = () => {
    switch (game.screen) {
      case 'create':
        return (
          <CreateRoomScreen
            onCreateRoom={game.createRoom}
            onBack={() => game.goToScreen('home')}
            error={game.error}
            onClearError={game.clearError}
          />
        );

      case 'join':
        return (
          <JoinRoomScreen
            onJoinRoom={game.joinRoom}
            onBack={() => game.goToScreen('home')}
            error={game.error}
            onClearError={game.clearError}
          />
        );

      case 'lobby':
        return game.room ? (
          <LobbyScreen
            room={game.room}
            isHost={game.isHost}
            onStartGame={handleStartGame}
            onLeave={game.resetToHome}
            error={game.error}
            onClearError={game.clearError}
          />
        ) : null;

      case 'loading':
        return (
          <LoadingScreen
            error={game.error}
            onCancel={() => game.goToScreen('lobby')}
          />
        );

      case 'quiz':
        return game.currentQuestion ? (
          <QuizScreen
            question={game.currentQuestion}
            questionEnded={game.questionEnded}
            playerId={game.playerId}
            onSubmitAnswer={game.submitAnswer}
          />
        ) : null;

      case 'leaderboard':
        return game.leaderboard ? (
          <LeaderboardScreen leaderboard={game.leaderboard} />
        ) : null;

      case 'results':
        return game.gameFinished ? (
          <ResultsScreen
            gameFinished={game.gameFinished}
            onPlayAgain={game.resetToHome}
          />
        ) : null;

      default:
        return (
          <HomeScreen
            onCreateRoom={() => game.goToScreen('create')}
            onJoinRoom={() => game.goToScreen('join')}
          />
        );
    }
  };

  const showMusicToggle = GAME_MUSIC_SCREENS.includes(game.screen);

  return (
    <Layout
      musicEnabled={enabled}
      showMusicToggle={showMusicToggle}
      onToggleMusic={toggleMusic}
      musicLoadError={loadError}
    >
      <div className="flex flex-col gap-4">
        <div className="min-h-0 flex-1">{renderScreen()}</div>

        {showChat && (
          <div className="sticky bottom-0 z-10 shrink-0">
            <ChatBox
              messages={game.chatMessages}
              playerId={game.playerId}
              onSendMessage={game.sendChat}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
