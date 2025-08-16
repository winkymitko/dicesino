// project/src/pages/GamesPage.tsx
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { STAKES } from '../../shared/game.js';

import DiceRoller from '../components/DiceRoller';
import { useAuth } from '../contexts/AuthContext';

const GamesPage: React.FC = () => {
  const { user } = useAuth();
  const { gameState, lastRoll, isRolling, startGame, rollDice, cashOut, reset, loading, error } = useGame();

  const canAct = gameState && gameState.status === 'ACTIVE';
  const balance = Number(user?.virtualBalance ?? 0);

  return (
    <div className="min-h-[calc(100vh-3.5rem-3rem)] bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dice Game</h1>

        {error && <div className="rounded bg-red-900/40 border border-red-700 px-4 py-2">{error}</div>}

        {!gameState && (
          <div className="rounded bg-gray-800 p-6">
            <div className="mb-3 text-gray-300">Choose your stake (Balance: ${balance.toFixed(2)})</div>
            <div className="flex flex-wrap gap-2">
              {STAKES.map((s) => {
                const disabled = loading || s > balance;
                return (
                  <button
                    key={s}
                    className={`px-4 py-2 rounded ${disabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
                    disabled={disabled}
                    onClick={() => startGame(s, 'client-' + Date.now())}
                    title={s > balance ? 'Insufficient balance' : ''}
                  >
                    Start ${s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameState && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded bg-gray-800 p-4">
                <div className="text-gray-400">Status</div>
                <div className="text-xl">{gameState.status}</div>
              </div>
              <div className="rounded bg-gray-800 p-4">
                <div className="text-gray-400">Stake</div>
                <div className="text-xl">${gameState.stake}</div>
              </div>
              <div className="rounded bg-gray-800 p-4">
                <div className="text-gray-400">Pot</div>
                <div className="text-2xl font-semibold">${gameState.pot.toFixed(2)}</div>
              </div>
              <div className="rounded bg-gray-800 p-4">
                <div className="text-gray-400">Total Score</div>
                <div className="text-2xl font-semibold">{gameState.totalScore}</div>
              </div>
            </div>

            <div className="rounded bg-gray-800 p-6 flex flex-col items-center gap-4">
              <DiceRoller
                dice={lastRoll?.dice ?? (gameState.rolls?.[gameState.rolls.length - 1]?.dice ?? [3, 4, 5])}
                isRolling={isRolling}
              />

              {lastRoll && !isRolling && (
                <div className="text-gray-300">
                  +{lastRoll.points} pts × {lastRoll.multiplier}
                </div>
              )}

              <div className="space-x-3">
                <button
                  className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500 disabled:opacity-50"
                  onClick={() => rollDice()}
                  disabled={!canAct || loading || isRolling}
                >
                  Roll
                </button>
                <button
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 disabled:opacity-50"
                  onClick={() => cashOut()}
                  disabled={!canAct || loading || isRolling}
                >
                  Cash Out
                </button>
                {(gameState.status === 'LOST' || gameState.status === 'CASHED_OUT') && (
                  <button
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50"
                    onClick={() => reset()}
                    disabled={loading}
                  >
                    Bet Again
                  </button>
                )}
              </div>
            </div>

            {gameState.rolls?.length ? (
              <div className="rounded bg-gray-800 p-4">
                <div className="text-gray-400 mb-2">Rolls</div>
                <ul className="space-y-1 text-sm">
                  {gameState.rolls.map((r, i) => (
                    <li key={i} className="text-gray-300">
                      #{i + 1}: [{r.dice.join(', ')}] → +{r.score} pts, ×{r.multiplier} ({r.combination})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesPage;
