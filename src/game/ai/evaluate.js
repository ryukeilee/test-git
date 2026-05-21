import { BOARD_SIZE, EMPTY } from '../board.js';

const SCORES = {
  FIVE: 100000,
  OPEN_FOUR: 10000,
  CLOSED_FOUR: 5000,
  OPEN_THREE: 1000,
  CLOSED_THREE: 500,
  OPEN_TWO: 100,
  CLOSED_TWO: 50,
};

const DEFENSE_WEIGHT = {
  OPEN_FOUR: 1.2,
  CLOSED_FOUR: 1.0,
  OPEN_THREE: 1.1,
  CLOSED_THREE: 0.9,
  OPEN_TWO: 0.8,
  CLOSED_TWO: 0.7,
};

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function countInDirection(board, row, col, dr, dc, player) {
  let count = 0;
  let r = row + dr;
  let c = col + dc;
  while (
    r >= 0 && r < BOARD_SIZE &&
    c >= 0 && c < BOARD_SIZE &&
    board[r][c] === player
  ) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

function getEndStatus(board, row, col, dr, dc, forward, backward) {
  const r1 = row + dr * (forward + 1);
  const c1 = col + dc * (forward + 1);
  const r2 = row - dr * (backward + 1);
  const c2 = col - dc * (backward + 1);

  const open1 = r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === EMPTY;
  const open2 = r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === EMPTY;

  if (open1 && open2) return 'open';
  if (open1 || open2) return 'semi-open';
  return 'closed';
}

function evaluateDirection(board, row, col, player) {
  let totalScore = 0;

  for (const [dr, dc] of DIRECTIONS) {
    const forward = countInDirection(board, row, col, dr, dc, player);
    const backward = countInDirection(board, row, col, -dr, -dc, player);
    const total = forward + backward + 1;

    if (total >= 5) {
      totalScore += SCORES.FIVE;
      continue;
    }

    const endStatus = getEndStatus(board, row, col, dr, dc, forward, backward);

    if (total === 4) {
      totalScore += endStatus === 'open' ? SCORES.OPEN_FOUR : SCORES.CLOSED_FOUR;
    } else if (total === 3) {
      totalScore += endStatus === 'open' ? SCORES.OPEN_THREE : SCORES.CLOSED_THREE;
    } else if (total === 2) {
      totalScore += endStatus === 'open' ? SCORES.OPEN_TWO : SCORES.CLOSED_TWO;
    }
  }

  return totalScore;
}

function evaluateDefense(board, row, col, player, opponentPlayer) {
  const opponentScore = evaluateDirection(board, row, col, opponentPlayer);

  if (opponentScore >= SCORES.FIVE) return SCORES.FIVE * 2;
  if (opponentScore >= SCORES.OPEN_FOUR) return SCORES.OPEN_FOUR * DEFENSE_WEIGHT.OPEN_FOUR;
  if (opponentScore >= SCORES.CLOSED_FOUR) return SCORES.CLOSED_FOUR * DEFENSE_WEIGHT.CLOSED_FOUR;
  if (opponentScore >= SCORES.OPEN_THREE) return SCORES.OPEN_THREE * DEFENSE_WEIGHT.OPEN_THREE;
  if (opponentScore >= SCORES.CLOSED_THREE) return SCORES.CLOSED_THREE * DEFENSE_WEIGHT.CLOSED_THREE;

  return opponentScore * 0.5;
}

export function evaluatePosition(board, row, col, player) {
  const opponentPlayer = player === 1 ? 2 : 1;
  const offenseScore = evaluateDirection(board, row, col, player);
  const defenseScore = evaluateDefense(board, row, col, player, opponentPlayer);
  return offenseScore + defenseScore;
}

export function getBestGreedyMove(board, player) {
  const candidates = getCandidateMoves(board);
  if (candidates.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = candidates[0];

  for (const { row, col } of candidates) {
    board[row][col] = player;
    const score = evaluatePosition(board, row, col, player);
    board[row][col] = EMPTY;
    if (score > bestScore) {
      bestScore = score;
      bestMove = { row, col };
    }
  }

  return bestMove;
}

export function getCandidateMoves(board, radius = 2) {
  const candidates = new Set();
  let hasStone = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== EMPTY) {
        hasStone = true;
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 && nr < BOARD_SIZE &&
              nc >= 0 && nc < BOARD_SIZE &&
              board[nr][nc] === EMPTY
            ) {
              candidates.add(`${nr},${nc}`);
            }
          }
        }
      }
    }
  }

  if (!hasStone) {
    const mid = Math.floor(BOARD_SIZE / 2);
    return [{ row: mid, col: mid }];
  }

  return Array.from(candidates).map(s => {
    const [row, col] = s.split(',').map(Number);
    return { row, col };
  });
}
