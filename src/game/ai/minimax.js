import { BOARD_SIZE, EMPTY } from '../board.js';
import { evaluatePosition, getCandidateMoves } from './evaluate.js';

export function findBestMove(board, player, depth = 4) {
  const candidates = getCandidateMoves(board, 2);

  if (candidates.length === 0) return null;

  // Optimization: order candidates by heuristic score for better pruning
  const scored = candidates.map(({ row, col }) => {
    board[row][col] = player;
    const score = evaluatePosition(board, row, col, player);
    board[row][col] = EMPTY;
    return { row, col, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // If only one candidate or depth is 1, return best heuristic
  if (scored.length === 1 || depth <= 1) {
    return { row: scored[0].row, col: scored[0].col };
  }

  let bestScore = -Infinity;
  let bestMove = scored[0];

  for (const { row, col } of scored) {
    board[row][col] = player;
    const score = minimax(board, depth - 1, -Infinity, Infinity, false, player);
    board[row][col] = EMPTY;

    if (score > bestScore) {
      bestScore = score;
      bestMove = { row, col };
    }
  }

  return bestMove;
}

function minimax(board, depth, alpha, beta, isMaximizing, player) {
  const opponentPlayer = player === 1 ? 2 : 1;

  if (depth === 0) {
    return evaluateBoard(board, player);
  }

  const candidates = getCandidateMoves(board, 2);
  if (candidates.length === 0) return 0;

  // Fast heuristic ordering
  if (depth <= 2 && candidates.length > 10) {
    const current = isMaximizing ? player : opponentPlayer;
    candidates.sort((a, b) => {
      board[a.row][a.col] = current;
      const sa = evaluatePosition(board, a.row, a.col, current);
      board[a.row][a.col] = EMPTY;
      board[b.row][b.col] = current;
      const sb = evaluatePosition(board, b.row, b.col, current);
      board[b.row][b.col] = EMPTY;
      return sb - sa;
    });
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const { row, col } of candidates) {
      board[row][col] = player;

      // Quick win check
      if (checkImmediateWin(board, row, col, player)) {
        board[row][col] = EMPTY;
        return 100000 + depth;
      }

      const score = minimax(board, depth - 1, alpha, beta, false, player);
      board[row][col] = EMPTY;
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const { row, col } of candidates) {
      board[row][col] = opponentPlayer;

      // Quick win check
      if (checkImmediateWin(board, row, col, opponentPlayer)) {
        board[row][col] = EMPTY;
        return -100000 - depth;
      }

      const score = minimax(board, depth - 1, alpha, beta, true, player);
      board[row][col] = EMPTY;
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
}

function checkImmediateWin(board, row, col, player) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) count++;
      else break;
    }
    for (let i = 1; i < 5; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) count++;
      else break;
    }
    if (count >= 5) return true;
  }
  return false;
}

function evaluateBoard(board, player) {
  let score = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === player) {
        score += evaluatePosition(board, r, c, player);
      } else if (board[r][c] !== EMPTY) {
        score -= evaluatePosition(board, r, c, player === 1 ? 2 : 1) * 0.9;
      }
    }
  }
  return score;
}
