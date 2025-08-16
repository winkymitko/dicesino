// project/src/contexts/GameContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { DiceRoll, GameState } from '../lib/game';
import { useAuth } from './AuthContext';

interface GameContextType {
  gameState: (GameState & { id?: string }) | null;
  lastRoll: { dice: [number, number, number]; points: number; multiplier: number } | null;
  isRolling: boolean;
  startGame: (stake: number, clientSeed: string) => Promise<void>;
  rollDice: () => Promise<void>;
  cashOut: () => Promise<void>;
  reset: () => void;
  loading: boolean;
  error: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);
export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<(GameState & { id?: string }) | null>(null);
  const [lastRoll, setLastRoll] = useState<{ dice: [number, number, number]; points: number; multiplier: number } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUser } = useAuth();

  const authHeader = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const reset = () => {
    setGameState(null);
    setLastRoll(null);
    setIsRolling(false);
    setError(null);
  };

  const startGame = async (stake: number, clientSeed: string) => {
    if (Number(user?.virtualBalance ?? 0) < stake) { setError('Insufficient balance'); return; }
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authHeader() };
      const res = await fetch('/api/game/start', {
        method: 'POST', headers, body: JSON.stringify({ stake, clientSeed }),
      });
      const round = await res.json();
      if (!res.ok) throw new Error(round.error || 'Failed to start game');

      // server already deducted stake; reflect locally
      updateUser({ virtualBalance: Number(user?.virtualBalance ?? 0) - stake });

      setGameState({
        id: round.id,
        stake: round.stake,
        pot: round.pot,
        rolls: (round.rolls || []) as DiceRoll[],
        status: round.status,
        totalScore: round.totalScore,
      });
      setLastRoll(null);
    } catch (e: any) {
      setError(e.message || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const rollDice = async () => {
    if (!gameState?.id) return;
    setIsRolling(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authHeader() };
      const res = await fetch('/api/game/roll', {
        method: 'POST', headers, body: JSON.stringify({ roundId: gameState.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to roll');

      if (data.result?.bust) {
        setGameState((prev) => (prev ? { ...prev, status: 'LOST' } : prev));
        setLastRoll(null);
      } else {
        const updated = data.round;
        setGameState({
          id: updated.id,
          stake: updated.stake,
          pot: updated.pot,
          rolls: (updated.rolls || []) as DiceRoll[],
          status: updated.status,
          totalScore: updated.totalScore,
        });
        if (data.result) {
          setLastRoll({
            dice: data.result.dice,
            points: data.result.points,
            multiplier: data.result.multiplier,
          });
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to roll');
    } finally {
      setTimeout(() => setIsRolling(false), 700);
    }
  };

  const cashOut = async () => {
    if (!gameState?.id) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authHeader() };
      const res = await fetch('/api/game/cashout', {
        method: 'POST', headers, body: JSON.stringify({ roundId: gameState.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cash out');

      const updated = data.round;
      setGameState((prev) => (prev ? { ...prev, status: updated.status, pot: updated.pot } : prev));

      if (data.balance) {
        updateUser({
          realBalance: data.balance.realBalance,
          virtualBalance: data.balance.virtualBalance,
        });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to cash out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        lastRoll,
        isRolling,
        startGame,
        rollDice,
        cashOut,
        reset,
        loading,
        error,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
