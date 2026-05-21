import { useRef, useEffect, useCallback, useState } from 'react';
import { BOARD_SIZE, EMPTY, BLACK, WHITE } from '../game/board.js';

const STAR_POINTS = [
  [3, 3], [3, 7], [3, 11],
  [7, 3], [7, 7], [7, 11],
  [11, 3], [11, 7], [11, 11],
];

const MIN_CELL = 20;
const MAX_CELL = 40;

function computeCellSize(available) {
  const grid = BOARD_SIZE - 1;
  const cell = (available - 48) / grid;
  return Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(cell)));
}

function drawBoard(ctx, size, cellSize, padding) {
  ctx.fillStyle = '#deb887';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;

  for (let i = 0; i < BOARD_SIZE; i++) {
    const pos = padding + i * cellSize;

    ctx.beginPath();
    ctx.moveTo(padding, pos);
    ctx.lineTo(padding + (BOARD_SIZE - 1) * cellSize, pos);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pos, padding);
    ctx.lineTo(pos, padding + (BOARD_SIZE - 1) * cellSize);
    ctx.stroke();
  }

  for (const [r, c] of STAR_POINTS) {
    ctx.beginPath();
    ctx.arc(padding + c * cellSize, padding + r * cellSize, cellSize * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
  }
}

function drawStone(ctx, x, y, r, player, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  if (player === BLACK) {
    gradient.addColorStop(0, '#555');
    gradient.addColorStop(1, '#111');
  } else {
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#ccc');
  }

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = player === BLACK ? '#000' : '#999';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

export default function Board({ game, onPlace }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const hoverRef = useRef(null);
  const [cellSize, setCellSize] = useState(MAX_CELL);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const available = Math.min(rect.width, rect.height, window.innerHeight - 220);
      setCellSize(computeCellSize(Math.max(available, 300)));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const padding = cellSize * 0.7;
  const stoneRadius = cellSize * 0.42;
  const canvasPixelSize = (BOARD_SIZE - 1) * cellSize + padding * 2;

  const toCanvas = useCallback((pos) => padding + pos * cellSize, [padding, cellSize]);

  const fromCanvas = useCallback((coord) => {
    const pos = Math.round((coord - padding) / cellSize);
    if (pos < 0 || pos >= BOARD_SIZE) return -1;
    const dist = Math.abs(coord - padding - pos * cellSize);
    if (dist > stoneRadius + 2) return -1;
    return pos;
  }, [padding, cellSize, stoneRadius]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasPixelSize * dpr;
    canvas.height = canvasPixelSize * dpr;
    canvas.style.width = `${canvasPixelSize}px`;
    canvas.style.height = `${canvasPixelSize}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawBoard(ctx, canvasPixelSize, cellSize, padding);

    const { board, lastMove, winLine } = game;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] !== EMPTY) {
          drawStone(ctx, toCanvas(c), toCanvas(r), stoneRadius, board[r][c]);
        }
      }
    }

    if (lastMove && !winLine) {
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(toCanvas(lastMove.col), toCanvas(lastMove.row), cellSize * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }

    if (winLine) {
      for (const [r, c] of winLine) {
        const x = toCanvas(c);
        const y = toCanvas(r);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, stoneRadius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (const [r, c] of winLine) {
        drawStone(ctx, toCanvas(c), toCanvas(r), stoneRadius, game.board[r][c]);
      }
    }

    if (hoverRef.current) {
      const { row, col, player } = hoverRef.current;
      if (game.board[row][col] === EMPTY && !game.winner && !game.aiThinking) {
        drawStone(ctx, toCanvas(col), toCanvas(row), stoneRadius, player, 0.35);
      }
    }
  }, [game, cellSize, padding, stoneRadius, canvasPixelSize, toCanvas]);

  useEffect(() => { draw(); }, [draw]);

  const getBoardPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasPixelSize / rect.width;
    const scaleY = canvasPixelSize / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const col = fromCanvas(x);
    const row = fromCanvas(y);
    if (row === -1 || col === -1) return null;
    return { row, col };
  }, [canvasPixelSize, fromCanvas]);

  const handleClick = useCallback((e) => {
    if (game.winner || game.aiThinking) return;
    const pos = getBoardPos(e);
    if (pos && game.board[pos.row][pos.col] === EMPTY) {
      onPlace(pos.row, pos.col);
    }
  }, [game, getBoardPos, onPlace]);

  const handleMouseMove = useCallback((e) => {
    const pos = getBoardPos(e);
    hoverRef.current = pos ? { row: pos.row, col: pos.col, player: game.turn } : null;
    draw();
  }, [game.turn, getBoardPos, draw]);

  const handleMouseLeave = useCallback(() => {
    hoverRef.current = null;
    draw();
  }, [draw]);

  const cursor = game.winner || game.aiThinking ? 'default' : 'pointer';

  return (
    <div ref={containerRef} style={{
      width: '100%', maxWidth: canvasPixelSize, aspectRatio: '1', margin: '0 auto',
    }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={(e) => { e.preventDefault(); handleClick(e); }}
        style={{ cursor, borderRadius: 4, display: 'block' }}
      />
    </div>
  );
}
