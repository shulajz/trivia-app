import { useState, useRef, useEffect } from 'react';

const isHebrew = (text) => /[\u0590-\u05FF]/.test(text);

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name) => {
  const parts = name?.trim().split(/\s+/) || [];
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name?.[0] || '?').toUpperCase();
};

const ChatBox = ({ messages, playerId, onSendMessage, disabled = false }) => {
  const [draft, setDraft] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!collapsed && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, collapsed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || disabled) return;

    onSendMessage(text);
    setDraft('');
  };

  return (
    <div className="rounded-2xl border border-white/20 bg-white/95 shadow-xl backdrop-blur-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="flex w-full items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-left text-white transition-colors hover:from-indigo-500 hover:to-purple-500"
        aria-expanded={!collapsed}
        aria-controls="room-chat-panel"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            💬
          </span>
          <span className="font-bold">Room Chat</span>
          {messages.length > 0 && (
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold">
              {messages.length}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-white/90">
          {collapsed ? 'Show' : 'Hide'}
        </span>
      </button>

      {!collapsed && (
        <div id="room-chat-panel">
          <div
            ref={listRef}
            className="h-36 overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-3 py-3 space-y-3 sm:h-44"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                Chat with your team — messages stay when you move between questions
              </p>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.playerId === playerId;
                const rtl = isHebrew(msg.text);

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                        isOwn ? 'bg-indigo-500' : 'bg-purple-500'
                      }`}
                      aria-hidden="true"
                    >
                      {getInitials(msg.playerName)}
                    </div>

                    <div
                      className={`max-w-[78%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}
                    >
                      <div
                        className={`flex items-center gap-2 text-xs text-gray-500 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <span className="font-bold text-gray-700">
                          {isOwn ? 'You' : msg.playerName}
                        </span>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                      <div
                        dir={rtl ? 'rtl' : 'ltr'}
                        className={`mt-1 rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isOwn
                            ? 'rounded-tr-sm bg-indigo-500 text-white'
                            : 'rounded-tl-sm bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-gray-100 bg-white p-3"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={200}
              disabled={disabled}
              placeholder="Message the room..."
              className="min-w-0 flex-1 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-base text-gray-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
              aria-label="Chat message"
            />
            <button
              type="submit"
              disabled={disabled || !draft.trim()}
              className="shrink-0 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-300 px-5 py-2.5 text-sm font-bold text-purple-900 shadow-md transition-all hover:from-yellow-300 hover:to-yellow-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
