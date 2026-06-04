const MusicToggle = ({ enabled, onToggle, loadError }) => (
  <button
    type="button"
    onClick={onToggle}
    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-2xl shadow-lg transition-all hover:scale-105 hover:bg-yellow-100 focus:outline-none focus:ring-4 focus:ring-yellow-300"
    aria-label={enabled ? 'Mute background music' : 'Play background music'}
    title={
      loadError
        ? 'Add trivia-bg.mp3 to client/public/audio/'
        : enabled
          ? 'Mute music'
          : 'Turn music on'
    }
  >
    {loadError ? '⚠️' : enabled ? '🔊' : '🔇'}
  </button>
);

export default MusicToggle;
