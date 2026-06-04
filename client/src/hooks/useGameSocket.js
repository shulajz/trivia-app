import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket } from '../socket/socket';
import {
  saveRoomSession,
  loadRoomSession,
  clearRoomSession,
} from '../utils/roomSession';

const initialState = {
  screen: 'home',
  room: null,
  playerName: null,
  error: null,
  isGenerating: false,
  currentQuestion: null,
  questionEnded: null,
  leaderboard: null,
  gameFinished: null,
  playerId: null,
  chatMessages: [],
};

const mergeChatMessages = (local, server) => {
  if (!server?.length) return local || [];
  if (!local?.length) return server;

  const seen = new Set(server.map((m) => m.id));
  const merged = [...server];

  for (const msg of local) {
    if (!seen.has(msg.id)) {
      merged.push(msg);
    }
  }

  return merged.sort((a, b) => a.timestamp - b.timestamp);
};

const buildStateFromSync = (sync, playerId, playerName) => ({
  screen: sync.screen || 'lobby',
  room: sync.room,
  playerName,
  playerId,
  error: null,
  isGenerating: sync.isGenerating || false,
  currentQuestion: sync.currentQuestion || null,
  questionEnded: sync.questionEnded || null,
  leaderboard: sync.leaderboard || null,
  gameFinished: sync.gameFinished || null,
  chatMessages: sync.chatMessages || [],
});

export const useGameSocket = () => {
  const savedSession = loadRoomSession();
  const [state, setState] = useState(() => ({
    ...initialState,
    playerId: getSocket().id ?? null,
    chatMessages: savedSession?.chatMessages || [],
    playerName: savedSession?.playerName || null,
  }));
  const socketRef = useRef(null);
  const reconnectAttemptedRef = useRef(false);

  const updateState = useCallback((patch) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const persistSession = useCallback((nextState) => {
    if (!nextState.room?.roomCode || !nextState.playerName) return;

    saveRoomSession({
      roomCode: nextState.room.roomCode,
      playerName: nextState.playerName,
      chatMessages: nextState.chatMessages,
    });
  }, []);

  const { room, playerName, chatMessages } = state;

  useEffect(() => {
    persistSession({ room, playerName, chatMessages });
  }, [room, playerName, chatMessages, persistSession]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const attemptReconnect = () => {
      const session = loadRoomSession();
      if (reconnectAttemptedRef.current) return;

      if (!session?.wasInRoom || !session?.roomCode || !session?.playerName) {
        if (session?.roomCode) clearRoomSession();
        return;
      }

      reconnectAttemptedRef.current = true;
      socket.emit('reconnectRoom', {
        roomCode: session.roomCode,
        playerName: session.playerName,
      });
    };

    const onConnect = () => {
      updateState({ playerId: socket.id });
      attemptReconnect();
    };

    const onDisconnect = () => {
      if (loadRoomSession()?.wasInRoom) {
        reconnectAttemptedRef.current = false;
      }
    };

    const onRoomCreated = (room) => {
      setState((prev) => ({
        ...prev,
        screen: 'lobby',
        room,
        error: null,
        isGenerating: false,
        chatMessages: [],
      }));
    };

    const onPlayerJoined = (room) => {
      setState((prev) => ({
        ...prev,
        screen: 'lobby',
        room,
        error: null,
      }));
    };

    const onPlayerReconnected = (sync) => {
      const session = loadRoomSession();
      const playerName = session?.playerName || socket.data.playerName;
      const mergedChat = mergeChatMessages(
        session?.chatMessages,
        sync.chatMessages,
      );

      setState((prev) => ({
        ...prev,
        ...buildStateFromSync({ ...sync, chatMessages: mergedChat }, socket.id, playerName),
      }));
    };

    const onChatHistory = ({ messages }) => {
      setState((prev) => ({
        ...prev,
        chatMessages: mergeChatMessages(prev.chatMessages, messages),
      }));
    };

    const onChatMessage = (message) => {
      setState((prev) => {
        if (prev.chatMessages.some((m) => m.id === message.id)) {
          return prev;
        }
        return {
          ...prev,
          chatMessages: [...prev.chatMessages, message],
        };
      });
    };

    const onRoomUpdated = (room) => {
      setState((prev) => {
        const backToLobby =
          prev.screen === 'loading' && room.status === 'lobby';

        return {
          ...prev,
          room,
          ...(backToLobby ? { screen: 'lobby', isGenerating: false } : {}),
        };
      });
    };

    const onGameStarted = () => {
      updateState({
        screen: 'loading',
        isGenerating: true,
        currentQuestion: null,
        questionEnded: null,
        leaderboard: null,
        gameFinished: null,
      });
    };

    const onQuestionStarted = (question) => {
      updateState({
        screen: 'quiz',
        isGenerating: false,
        currentQuestion: question,
        questionEnded: null,
      });
    };

    const onQuestionEnded = (data) => {
      updateState({
        questionEnded: data,
      });
    };

    const onLeaderboardUpdated = (data) => {
      setState((prev) => ({
        ...prev,
        screen: 'leaderboard',
        leaderboard: data,
        room: data.room || prev.room,
      }));
    };

    const onGameFinished = (data) => {
      setState({
        screen: 'results',
        gameFinished: data,
        room: data.room,
        isGenerating: false,
      });
    };

    const onErrorMessage = ({ message }) => {
      const staleRoom =
        message.includes('Room does not exist') ||
        message.includes('already started');

      if (staleRoom) {
        clearRoomSession();
        reconnectAttemptedRef.current = true;
      }

      setState((prev) => {
        const isSetupScreen = ['home', 'create', 'join'].includes(prev.screen);
        if (staleRoom && isSetupScreen) {
          return { ...prev, error: null, isGenerating: false };
        }

        return {
          ...prev,
          error: message,
          isGenerating: false,
          screen: prev.screen === 'loading' ? 'lobby' : prev.screen,
        };
      });
    };

    const onGameGenerationFailed = ({ message }) => {
      setState((prev) => ({
        ...prev,
        error: message,
        isGenerating: false,
        screen: 'lobby',
      }));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('roomCreated', onRoomCreated);
    socket.on('playerJoined', onPlayerJoined);
    socket.on('playerReconnected', onPlayerReconnected);
    socket.on('roomUpdated', onRoomUpdated);
    socket.on('gameStarted', onGameStarted);
    socket.on('questionStarted', onQuestionStarted);
    socket.on('questionEnded', onQuestionEnded);
    socket.on('leaderboardUpdated', onLeaderboardUpdated);
    socket.on('gameFinished', onGameFinished);
    socket.on('errorMessage', onErrorMessage);
    socket.on('gameGenerationFailed', onGameGenerationFailed);
    socket.on('chatHistory', onChatHistory);
    socket.on('chatMessage', onChatMessage);

    if (socket.connected) {
      updateState({ playerId: socket.id });
      attemptReconnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('roomCreated', onRoomCreated);
      socket.off('playerJoined', onPlayerJoined);
      socket.off('playerReconnected', onPlayerReconnected);
      socket.off('roomUpdated', onRoomUpdated);
      socket.off('gameStarted', onGameStarted);
      socket.off('questionStarted', onQuestionStarted);
      socket.off('questionEnded', onQuestionEnded);
      socket.off('leaderboardUpdated', onLeaderboardUpdated);
      socket.off('gameFinished', onGameFinished);
      socket.off('errorMessage', onErrorMessage);
      socket.off('gameGenerationFailed', onGameGenerationFailed);
      socket.off('chatHistory', onChatHistory);
      socket.off('chatMessage', onChatMessage);
    };
  }, [updateState]);

  const createRoom = useCallback((playerName, category, language, difficulty) => {
    clearError();
    clearRoomSession();
    reconnectAttemptedRef.current = true;
    updateState({ playerName, chatMessages: [] });
    socketRef.current?.emit('createRoom', {
      playerName,
      category,
      language,
      difficulty,
    });
  }, [clearError, updateState]);

  const joinRoom = useCallback((roomCode, playerName) => {
    clearError();
    reconnectAttemptedRef.current = true;
    updateState({ playerName });
    socketRef.current?.emit('joinRoom', { roomCode, playerName });
  }, [clearError, updateState]);

  const startGame = useCallback(() => {
    clearError();
    socketRef.current?.emit('startGame');
  }, [clearError]);

  const submitAnswer = useCallback((answer) => {
    socketRef.current?.emit('submitAnswer', { answer });
  }, []);

  const sendChat = useCallback((text) => {
    socketRef.current?.emit('sendChat', { text });
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('leaveRoom');
    clearRoomSession();
    reconnectAttemptedRef.current = false;
    setState(initialState);
  }, []);

  const goToScreen = useCallback((screen) => {
    if (['home', 'create', 'join'].includes(screen)) {
      clearRoomSession();
      reconnectAttemptedRef.current = true;
    }
    updateState({ screen, error: null });
  }, [updateState]);

  const resetToHome = useCallback(() => {
    leaveRoom();
    updateState({ screen: 'home' });
  }, [leaveRoom, updateState]);

  const isHost = state.room?.hostId === state.playerId;

  return {
    ...state,
    isHost,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    sendChat,
    leaveRoom,
    goToScreen,
    resetToHome,
    clearError,
  };
};
