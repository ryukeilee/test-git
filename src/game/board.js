export const BOARD_SIZE = 15;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export function createBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
}

export function cloneBoard(board) {
  return board.map(row => [...row]);
}

export function opponent(player) {
  return player === BLACK ? WHITE : BLACK;
}
