/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Game {
  id: string;
  name: string;
  description: string;
  content: string; // could be JSON or HTML for rendering
}

const mockGame: Game = {
  id: 'game_001',
  name: 'Memory Match',
  description: 'Match pairs of cards to improve memory skills.',
  content: 'This is where the game content would be rendered.',
};

const GamePlayer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [game] = useState<Game>(mockGame);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <p className="text-red-600">You must be logged in to play games.</p>;
  }

  const handlePlay = () => {
    // Placeholder for actual game logic
    setScore(Math.floor(Math.random() * 100));
    setCompleted(true);
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-2">{game.name}</h2>
      <p className="text-gray-600 mb-4">{game.description}</p>
      <div className="border p-4 mb-4 bg-gray-50">{game.content}</div>
      {!completed ? (
        <button
          onClick={handlePlay}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Play Game
        </button>
      ) : (
        <div>
          <p className="text-lg font-semibold">Game Completed!</p>
          <p className="text-gray-700">Your Score: {score}</p>
          <button
            onClick={() => {
              setCompleted(false);
              setScore(0);
            }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GamePlayer;
