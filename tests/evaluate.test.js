import { describe, it, expect } from 'vitest';
import { createBoard, EMPTY, BLACK, WHITE } from '../src/game/board.js';
import { evaluatePosition, getBestGreedyMove } from '../src/game/ai/evaluate.js';

describe('evaluatePosition', () => {
  function placeStones(board, moves) {
    for (const [r, c, p] of moves) {
      board[r][c] = p;
    }
  }

  it('scores a winning move (connect 5) highest', () => {
    const board = createBoard();
    placeStones(board, [
      [5, 3, BLACK], [5, 4, BLACK], [5, 5, BLACK], [5, 6, BLACK],
    ]);
    board[5][7] = BLACK;
    const score = evaluatePosition(board, 5, 7, BLACK);
    board[5][7] = EMPTY;
    expect(score).toBeGreaterThanOrEqual(100000);
  });

  it('scores open four higher than closed four', () => {
    const board = createBoard();
    // Open four: both ends open
    placeStones(board, [
      [5, 3, BLACK], [5, 4, BLACK], [5, 5, BLACK], [5, 6, BLACK],
    ]);
    // Position at 5,7 gives open four -> 5 in a row (ends open but count=5)
    // Actually let me check 5,2 - that would be open four
    board[5][2] = BLACK;
    const openFourScore = evaluatePosition(board, 5, 2, BLACK);
    board[5][2] = EMPTY;

    expect(openFourScore).toBeGreaterThan(1000);
  });

  it('scores defensive moves (blocking opponent)', () => {
    const board = createBoard();
    // Opponent (WHITE) has 4 in a row
    placeStones(board, [
      [7, 3, WHITE], [7, 4, WHITE], [7, 5, WHITE], [7, 6, WHITE],
    ]);
    // Placing BLACK at 7,2 should get a high defensive score
    board[7][2] = BLACK;
    const score = evaluatePosition(board, 7, 2, BLACK);
    board[7][2] = EMPTY;
    // Should be high because it blocks opponent's open four
    expect(score).toBeGreaterThan(1000);
  });

  it('returns higher score for open three than closed three', () => {
    const board = createBoard();
    // Open three: XXX with both ends open
    // Place at 5,5: 5,3=BLACK, 5,4=BLACK, 5,5=BLACK => check at 5,2 or 5,6
    placeStones(board, [
      [5, 4, BLACK], [5, 5, BLACK], [5, 6, BLACK],
    ]);
    board[5][3] = BLACK;
    const openThreeScore = evaluatePosition(board, 5, 3, BLACK);
    board[5][3] = EMPTY;

    // Closed three: XXX with one end blocked
    const board2 = createBoard();
    placeStones(board2, [
      [10, 7, WHITE], // block one end
      [10, 4, BLACK], [10, 5, BLACK], [10, 6, BLACK],
    ]);
    board2[10][3] = BLACK;
    const closedThreeScore = evaluatePosition(board2, 10, 3, BLACK);
    board2[10][3] = EMPTY;

    expect(openThreeScore).toBeGreaterThan(closedThreeScore);
  });
});

describe('getBestGreedyMove', () => {
  it('returns the winning move when available', () => {
    const board = createBoard();
    board[5][3] = BLACK;
    board[5][4] = BLACK;
    board[5][5] = BLACK;
    board[5][6] = BLACK;

    const move = getBestGreedyMove(board, BLACK);
    expect(move).not.toBeNull();
    // Should complete the five
    expect(move.row).toBe(5);
    expect([2, 7]).toContain(move.col);
  });

  it('blocks opponent winning move', () => {
    const board = createBoard();
    // WHITE has 4 in a row
    board[7][3] = WHITE;
    board[7][4] = WHITE;
    board[7][5] = WHITE;
    board[7][6] = WHITE;

    const move = getBestGreedyMove(board, BLACK);
    expect(move).not.toBeNull();
    // Should block either end
    expect(move.row).toBe(7);
    expect([2, 7]).toContain(move.col);
  });

  it('returns null when board is full', () => {
    const board = createBoard();
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        board[r][c] = (r + c) % 2 === 0 ? BLACK : WHITE;
      }
    }
    expect(getBestGreedyMove(board, BLACK)).toBeNull();
  });

  it('returns center when board is empty', () => {
    const board = createBoard();
    const move = getBestGreedyMove(board, BLACK);
    expect(move).not.toBeNull();
    expect(move.row).toBe(7);
    expect(move.col).toBe(7);
  });
});
