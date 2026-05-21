import { BOARD_SIZE, EMPTY } from './board.js';

export function isValidMove(board, row, col) {
  return (
    row >= 0 && row < BOARD_SIZE &&
    col >= 0 && col < BOARD_SIZE &&
    board[row][col] === EMPTY
  );
}

const DIRECTIONS = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal
  [1, -1],  // anti-diagonal
];

export function checkWin(board, row, col) {
  const player = board[row][col];
  if (player === EMPTY) return null;

  for (const [dr, dc] of DIRECTIONS) {
    const line = [[row, col]];

    for (let i = 1; i < 5; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        line.push([r, c]);
      } else break;
    }

    for (let i = 1; i < 5; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        line.unshift([r, c]);
      } else break;
    }

    if (line.length >= 5) {
      return { winner: player, line: line.slice(0, 5) };
    }
  }

  return null;
}

export function isBoardFull(board) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY) return false;
    }
  }
  return true;
}

export function checkGameOver(board, row, col) {
  const win = checkWin(board, row, col);
  if (win) return win;
  if (isBoardFull(board)) return { winner: 'draw', line: null };
  return null;
}
