import { EMPTY } from '../board.js';
import { getBestGreedyMove } from './evaluate.js';
import { findBestMove } from './minimax.js';

function getRandomMove(board) {
  const empty = [];
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c] === EMPTY) {
        empty.push({ row: r, col: c });
      }
    }
  }
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

self.onmessage = function (e) {
  const { board, player, difficulty } = e.data;

  let move;
  switch (difficulty) {
    case 'easy':
      move = getRandomMove(board);
      break;
    case 'medium':
      move = getBestGreedyMove(board, player);
      break;
    case 'hard':
      move = findBestMove(board, player, 4);
      break;
    default:
      move = getBestGreedyMove(board, player);
  }

  if (move) {
    self.postMessage({ row: move.row, col: move.col });
  }
};
