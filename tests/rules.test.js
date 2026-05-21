import { describe, it, expect } from 'vitest';
import { createBoard, EMPTY, BLACK, WHITE } from '../src/game/board.js';
import { isValidMove, checkWin, isBoardFull, checkGameOver } from '../src/game/rules.js';

describe('isValidMove', () => {
  it('returns true for empty cell within bounds', () => {
    const board = createBoard();
    expect(isValidMove(board, 7, 7)).toBe(true);
  });

  it('returns false for occupied cell', () => {
    const board = createBoard();
    board[7][7] = BLACK;
    expect(isValidMove(board, 7, 7)).toBe(false);
  });

  it('returns false for out-of-bounds row', () => {
    const board = createBoard();
    expect(isValidMove(board, -1, 0)).toBe(false);
    expect(isValidMove(board, 15, 0)).toBe(false);
  });

  it('returns false for out-of-bounds col', () => {
    const board = createBoard();
    expect(isValidMove(board, 0, -1)).toBe(false);
    expect(isValidMove(board, 0, 15)).toBe(false);
  });
});

describe('checkWin', () => {
  it('returns null when position is EMPTY', () => {
    const board = createBoard();
    expect(checkWin(board, 7, 7)).toBeNull();
  });

  it('detects horizontal win', () => {
    const board = createBoard();
    for (let c = 3; c <= 7; c++) board[5][c] = BLACK;
    const result = checkWin(board, 5, 5);
    expect(result).not.toBeNull();
    expect(result.winner).toBe(BLACK);
    expect(result.line).toHaveLength(5);
  });

  it('detects vertical win', () => {
    const board = createBoard();
    for (let r = 2; r <= 6; r++) board[r][7] = BLACK;
    const result = checkWin(board, 4, 7);
    expect(result.winner).toBe(BLACK);
  });

  it('detects diagonal win (top-left to bottom-right)', () => {
    const board = createBoard();
    for (let i = 0; i < 5; i++) board[3 + i][2 + i] = WHITE;
    const result = checkWin(board, 5, 4);
    expect(result.winner).toBe(WHITE);
  });

  it('detects anti-diagonal win (top-right to bottom-left)', () => {
    const board = createBoard();
    for (let i = 0; i < 5; i++) board[1 + i][8 - i] = WHITE;
    const result = checkWin(board, 3, 6);
    expect(result.winner).toBe(WHITE);
  });

  it('returns null for 4 in a row', () => {
    const board = createBoard();
    for (let c = 3; c <= 6; c++) board[5][c] = BLACK;
    expect(checkWin(board, 5, 5)).toBeNull();
  });

  it('returns null when line is broken by opponent', () => {
    const board = createBoard();
    board[5][3] = BLACK;
    board[5][4] = BLACK;
    board[5][5] = WHITE;
    board[5][6] = BLACK;
    board[5][7] = BLACK;
    expect(checkWin(board, 5, 3)).toBeNull();
  });

  it('detects win with more than 5 in a row', () => {
    const board = createBoard();
    for (let c = 3; c <= 8; c++) board[5][c] = BLACK;
    const result = checkWin(board, 5, 5);
    expect(result).not.toBeNull();
    expect(result.winner).toBe(BLACK);
  });
});

describe('isBoardFull', () => {
  it('returns false for empty board', () => {
    expect(isBoardFull(createBoard())).toBe(false);
  });

  it('returns false for partially filled board', () => {
    const board = createBoard();
    board[0][0] = BLACK;
    expect(isBoardFull(board)).toBe(false);
  });

  it('returns true for completely filled board', () => {
    const board = createBoard();
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        board[r][c] = r % 2 === 0 ? BLACK : WHITE;
      }
    }
    expect(isBoardFull(board)).toBe(true);
  });
});

describe('checkGameOver', () => {
  it('returns winner and line on win', () => {
    const board = createBoard();
    for (let c = 3; c <= 7; c++) board[5][c] = BLACK;
    const result = checkGameOver(board, 5, 5);
    expect(result.winner).toBe(BLACK);
    expect(result.line).not.toBeNull();
  });

  it('returns draw on full board with no winner', () => {
    const board = createBoard();
    // Fill with pattern that avoids 5-in-a-row: alternating BBWW per row, offset rows
    const pattern = [BLACK, BLACK, WHITE, WHITE];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        board[r][c] = pattern[(c + r * 2) % 4];
      }
    }
    const result = checkGameOver(board, 0, 0);
    expect(result.winner).toBe('draw');
  });

  it('returns null when game is not over', () => {
    const board = createBoard();
    board[0][0] = BLACK;
    const result = checkGameOver(board, 0, 0);
    expect(result).toBeNull();
  });
});
