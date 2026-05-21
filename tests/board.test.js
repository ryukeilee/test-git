import { describe, it, expect } from 'vitest';
import { createBoard, cloneBoard, opponent, EMPTY, BLACK, WHITE, BOARD_SIZE } from '../src/game/board.js';

describe('createBoard', () => {
  it('creates a 15x15 board', () => {
    const board = createBoard();
    expect(board).toHaveLength(BOARD_SIZE);
    board.forEach(row => {
      expect(row).toHaveLength(BOARD_SIZE);
    });
  });

  it('fills board with EMPTY cells', () => {
    const board = createBoard();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        expect(board[r][c]).toBe(EMPTY);
      }
    }
  });
});

describe('cloneBoard', () => {
  it('creates an independent copy', () => {
    const board = createBoard();
    board[0][0] = BLACK;
    const clone = cloneBoard(board);
    expect(clone[0][0]).toBe(BLACK);
    clone[0][0] = WHITE;
    expect(board[0][0]).toBe(BLACK);
  });

  it('deep clones all rows', () => {
    const board = createBoard();
    board[7][7] = BLACK;
    const clone = cloneBoard(board);
    clone[3][3] = WHITE;
    expect(board[3][3]).toBe(EMPTY);
  });
});

describe('opponent', () => {
  it('returns WHITE for BLACK', () => {
    expect(opponent(BLACK)).toBe(WHITE);
  });

  it('returns BLACK for WHITE', () => {
    expect(opponent(WHITE)).toBe(BLACK);
  });
});
