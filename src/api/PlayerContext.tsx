import type React from 'react';
import { createContext, useContext, useState } from 'react';

interface PlayerContextType {
  activePlayerId: number | null;
  setActivePlayerId: (id: number | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [activePlayerId, setActivePlayerIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem('activePlayerId');
    return saved ? Number(saved) : null;
  });

  const setActivePlayerId = (id: number | null) => {
    setActivePlayerIdState(id);
    if (id === null) {
      localStorage.removeItem('activePlayerId');
    } else {
      localStorage.setItem('activePlayerId', String(id));
    }
  };

  return (
    <PlayerContext.Provider value={{ activePlayerId, setActivePlayerId }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
}
