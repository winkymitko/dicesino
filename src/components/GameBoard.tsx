import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import DiceRoller from './DiceRoller';
import { STAKES, MULTIPLIERS } from '../lib/game';
import { TrendingUp, DollarSign, Target, History } from 'lucide-react';

const GameBoard: React.FC = () => {
  const { user } = useAuth();
  const { gameState, startGame, rollDice, cashOut, loading, error } = useGame();
  const [selectedStake, setSelectedStake] = useState(5);
  const [clientSeed, setClientSeed] = useState('');
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    // Generate random client seed on component mount
    setClientSeed(Math.random().toString(36).substring(2, 15));
  }, []);

  const handleStartGame = async () => {
    await startGame(selectedStake, clientSeed);
  };

  const handleRollDice = async () => {
    setIsRolling(true);
    await rollDice();
    setTimeout(() => setIsRolling(false), 1000);
  };

  const handleCashOut = async () => {
    await cashOut();
  };

  const canAffordStake = user ? user.realBalance >= selectedStake : false;
  const currentDice: [number, number, number] = gameState?.rolls.length 
    ? gameState.rolls[gameState.rolls.length - 1].dice 
    : [1, 1, 1];

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Please login to play</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Game Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Balance</p>
          <p className="text-white text-xl font-bold">${user.realBalance.toFixed(2)}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <Target className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Current Pot</p>
          <p className="text-white text-xl font-bold">
            ${gameState ? gameState.pot.toFixed(2) : '0.00'}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Win Streak</p>
          <p className="text-white text-xl font-bold">{user.currentStreak}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <History className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Total Games</p>
          <p className="text-white text-xl font-bold">{user.totalGames}</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-4 mb-6">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {!gameState || gameState.status !== 'ACTIVE' ? (
        /* Game Setup */
        <div className="bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Start New Game</h2>
          
          {/* Stake Selection */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-3">Select Stake</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STAKES.map((stake) => (
                <button
                  key={stake}
                  onClick={() => setSelectedStake(stake)}
                  disabled={user.realBalance < stake}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    selectedStake === stake
                      ? 'bg-yellow-500 text-gray-900'
                      : user.realBalance < stake
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  ${stake}
                </button>
              ))}
            </div>
            {!canAffordStake && (
              <p className="text-red-400 text-sm mt-2">Insufficient balance for selected stake</p>
            )}
          </div>

          {/* Client Seed */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Client Seed (for Provably Fair)
            </label>
            <input
              type="text"
              value={clientSeed}
              onChange={(e) => setClientSeed(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              placeholder="Random seed for fair gameplay"
            />
          </div>

          <button
            onClick={handleStartGame}
            disabled={!canAffordStake || loading}
            className="w-full py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Starting...' : `Start Game - $${selectedStake}`}
          </button>
        </div>
      ) : (
        /* Active Game */
        <div className="bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Game Active</h2>
          
          {/* Dice Display */}
          <DiceRoller dice={currentDice} isRolling={isRolling} />
          
          {/* Last Roll Result */}
          {gameState.rolls.length > 0 && (
            <div className="text-center mb-6">
              <p className="text-gray-300 mb-2">Last Roll Result:</p>
              <p className="text-yellow-500 font-bold text-lg">
                {gameState.rolls[gameState.rolls.length - 1].combination}
              </p>
              <p className="text-white font-bold text-xl">
                {gameState.rolls[gameState.rolls.length - 1].score} points
              </p>
            </div>
          )}
          
          {/* Game Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleRollDice}
              disabled={loading || gameState.status !== 'ACTIVE'}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Rolling...' : 'Roll Dice'}
            </button>
            
            {gameState.rolls.length > 0 && gameState.pot > gameState.stake && (
              <button
                onClick={handleCashOut}
                disabled={loading}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Cash Out - ${gameState.pot.toFixed(2)}
              </button>
            )}
          </div>
          
          {/* Roll History */}
          {gameState.rolls.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4">Roll History</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {gameState.rolls.map((roll, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-300">Roll {index + 1}:</span>
                      <span className="text-white font-mono">
                        [{roll.dice.join(', ')}]
                      </span>
                      <span className="text-yellow-500">{roll.combination}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{roll.score} pts</p>
                      <p className="text-green-400 text-sm">×{roll.multiplier}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multiplier Table */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 text-center">Payout Multipliers</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {MULTIPLIERS.map((mult, index) => (
            <div key={index} className="text-center p-3 bg-gray-700 rounded-lg">
              <p className="text-yellow-500 font-bold">{mult.points} pts</p>
              <p className="text-white">×{mult.multiplier}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-sm text-gray-400 space-y-2">
          <p><strong className="text-yellow-500">Scoring Rules:</strong></p>
          <p>• Singles: Each 1 = 100 pts, Each 5 = 50 pts</p>
          <p>• Straights: 1-3-5 or 2-4-6 = 100 pts</p>
          <p>• Triples: Three of same = 100×value pts (e.g., 6-6-6 = 600 pts)</p>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;