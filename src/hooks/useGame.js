import { useReducer, useCallback } from 'react';
import { createBoard, cloneBoard, EMPTY, BLACK, WHITE, opponent } from '../game/board.js';
import { isValidMove, checkGameOver } from '../game/rules.js';

const initialState = {
  board: createBoard(),
  turn: BLACK,
  history: [],
  winner: null,
  winLine: null,
  mode: 'pvp',
  difficulty: 'medium',
  aiThinking: false,
  lastMove: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'PLACE': {
      if (state.winner || state.aiThinking) return state;
      if (!isValidMove(state.board, action.row, action.col)) return state;

      const newBoard = cloneBoard(state.board);
      newBoard[action.row][action.col] = state.turn;

      const historyEntry = {
        board: state.board,
        turn: state.turn,
        lastMove: state.lastMove,
      };

      const result = checkGameOver(newBoard, action.row, action.col);
      return {
        ...state,
        board: newBoard,
        turn: opponent(state.turn),
        history: [...state.history, historyEntry],
        winner: result?.winner ?? null,
        winLine: result?.line ?? null,
        lastMove: { row: action.row, col: action.col },
      };
    }

    case 'UNDO': {
      if (state.history.length === 0 || state.aiThinking) return state;

      const stepsBack = state.mode === 'pve' ? 2 : 1;
      if (state.history.length < stepsBack) return state;

      let newHistory = [...state.history];
      let prevState = null;

      for (let i = 0; i < stepsBack; i++) {
        const entry = newHistory.pop();
        if (i === stepsBack - 1) {
          prevState = entry;
        }
      }

      return {
        ...state,
        board: prevState.board,
        turn: prevState.turn,
        history: newHistory,
        winner: null,
        winLine: null,
        lastMove: prevState.lastMove,
      };
    }

    case 'RESET': {
      return { ...initialState, mode: state.mode, difficulty: state.difficulty };
    }

    case 'SET_MODE': {
      return {
        ...initialState,
        mode: action.mode,
        difficulty: state.difficulty,
      };
    }

    case 'SET_DIFFICULTY': {
      return { ...state, difficulty: action.difficulty };
    }

    case 'AI_START': {
      return { ...state, aiThinking: true };
    }

    case 'AI_END': {
      return { ...state, aiThinking: false };
    }

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const place = useCallback((row, col) => {
    dispatch({ type: 'PLACE', row, col });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const setMode = useCallback(mode => dispatch({ type: 'SET_MODE', mode }), []);
  const setDifficulty = useCallback(d => dispatch({ type: 'SET_DIFFICULTY', difficulty: d }), []);
  const aiStart = useCallback(() => dispatch({ type: 'AI_START' }), []);
  const aiEnd = useCallback(() => dispatch({ type: 'AI_END' }), []);

  return {
    ...state,
    place,
    undo,
    reset,
    setMode,
    setDifficulty,
    aiStart,
    aiEnd,
  };
}
