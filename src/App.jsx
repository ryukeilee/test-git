import { useEffect, useRef, useCallback } from 'react';
import { useGame } from './hooks/useGame.js';
import { BLACK, opponent } from './game/board.js';
import Board from './components/Board.jsx';
import Controls from './components/Controls.jsx';
import StatusBar from './components/StatusBar.jsx';
import Confetti from './components/Confetti.jsx';

export default function App() {
  const game = useGame();
  const workerRef = useRef(null);

  useEffect(() => {
    const worker = new Worker(new URL('./game/ai/worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      const { row, col } = e.data;
      game.place(row, col);
      game.aiEnd();
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlace = useCallback((row, col) => {
    if (game.winner || game.aiThinking) return;
    game.place(row, col);
  }, [game]);

  useEffect(() => {
    if (game.mode === 'pve' && game.turn === opponent(BLACK) && !game.winner && !game.aiThinking) {
      game.aiStart();
      workerRef.current?.postMessage({
        board: game.board,
        player: opponent(BLACK),
        difficulty: game.difficulty,
      });
    }
  }, [game.board, game.turn, game.mode, game.winner, game.aiThinking, game.difficulty, game.aiStart]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1a2e',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: 20,
      userSelect: 'none',
    }}>
      <h1 style={{ color: '#eee', margin: '0 0 8px', fontSize: 28 }}>五子棋</h1>

      <Controls
        mode={game.mode}
        difficulty={game.difficulty}
        onModeChange={game.setMode}
        onDifficultyChange={game.setDifficulty}
        disabled={game.aiThinking || (game.history.length > 0 && !game.winner)}
      />

      <Board game={game} onPlace={handlePlace} />

      <StatusBar game={game} onUndo={game.undo} onReset={game.reset} />

      {game.winner && game.winner !== 'draw' && (
        <div style={{
          marginTop: 12,
          padding: '10px 32px',
          background: '#e74c3c',
          color: '#fff',
          borderRadius: 8,
          fontSize: 20,
          fontWeight: 700,
          animation: 'pop 0.3s ease-out',
        }}>
          {game.winner === BLACK ? '黑棋' : '白棋'} 获胜！
        </div>
      )}

      <Confetti active={!!game.winner && game.winner !== 'draw'} />
    </div>
  );
}
