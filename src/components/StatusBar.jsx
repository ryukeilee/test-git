import { BLACK } from '../game/board.js';

export default function StatusBar({ game, onUndo, onReset }) {
  const { turn, winner, aiThinking, history, mode } = game;
  const canUndo = history.length > 0 && !winner && !aiThinking;

  let statusText;
  if (winner === 'draw') {
    statusText = '平局！';
  } else if (winner) {
    statusText = `${winner === BLACK ? '黑棋' : '白棋'} 获胜！`;
  } else if (aiThinking) {
    statusText = 'AI 思考中...';
  } else {
    statusText = `${turn === BLACK ? '黑棋' : '白棋'} 回合`;
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      padding: '12px 0',
    }}>
      <span style={{
        fontSize: 18, fontWeight: 600, color: winner ? '#e74c3c' : '#333',
      }}>
        {statusText}
      </span>

      <button
        onClick={onUndo}
        disabled={!canUndo}
        style={{
          padding: '6px 16px',
          border: 'none',
          borderRadius: 6,
          background: canUndo ? '#3498db' : '#ddd',
          color: canUndo ? '#fff' : '#999',
          cursor: canUndo ? 'pointer' : 'not-allowed',
          fontSize: 14,
        }}
      >
        悔棋
      </button>

      <button
        onClick={onReset}
        disabled={aiThinking}
        style={{
          padding: '6px 16px',
          border: 'none',
          borderRadius: 6,
          background: '#e67e22',
          color: '#fff',
          cursor: aiThinking ? 'not-allowed' : 'pointer',
          fontSize: 14,
          opacity: aiThinking ? 0.6 : 1,
        }}
      >
        重置
      </button>
    </div>
  );
}
