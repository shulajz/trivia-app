import MusicToggle from './MusicToggle';

const Layout = ({
  children,
  musicEnabled,
  showMusicToggle,
  onToggleMusic,
  musicLoadError,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-600 px-4 py-8 pb-24">
    <div className="mx-auto max-w-2xl w-full">{children}</div>
    {showMusicToggle && (
      <MusicToggle
        enabled={musicEnabled}
        onToggle={onToggleMusic}
        loadError={musicLoadError}
      />
    )}
  </div>
);

export default Layout;
