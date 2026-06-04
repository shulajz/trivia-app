import { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import ErrorAlert from '../components/ErrorAlert';
import { CATEGORIES } from '../utils/categories';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../utils/languages';
import { DIFFICULTIES, DEFAULT_DIFFICULTY } from '../utils/difficulties';

const CreateRoomScreen = ({ onCreateRoom, onBack, error, onClearError }) => {
  const [playerName, setPlayerName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateRoom(playerName, category, language, difficulty);
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
        <h2 className="mb-6 text-2xl font-black text-gray-800">Create Room</h2>
        <ErrorAlert message={error} onDismiss={onClearError} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Your Name"
            id="create-name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
          />

          <Select
            label="Question Language"
            id="create-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            options={LANGUAGES}
          />

          <Select
            label="Challenge Level"
            id="create-difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            options={DIFFICULTIES}
          />

          <Select
            label="Category"
            id="create-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES}
          />

          <Button type="submit" disabled={!playerName.trim()}>
            Create Room
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateRoomScreen;
