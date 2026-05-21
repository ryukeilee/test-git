# 五子棋 (Gomoku)

浏览器端五子棋游戏，支持双人对战和人机对战。React 工程 + 独立单文件双版本。

## 快速开始

### 方式一：双击打开（推荐）

直接双击 `gomoku.html`，零依赖，打开即玩。

### 方式二：开发模式

```bash
npm install
npm run dev       # 启动开发服务器 → http://localhost:5173
npm run build     # 生产构建 → dist/
npm test          # 运行 32 个单测
```

## 功能

- 标准 15×15 棋盘，Canvas 渲染，响应式自适应
- **双人对战（PvP）**：两人共用同一设备轮流落子
- **人机对战（PvE）**：三档 AI 难度
  - 简单：随机落子
  - 中等：贪心评分函数（进攻 + 防守权重）
  - 困难：Minimax + Alpha-Beta 剪枝，搜索深度 4
- 悔棋（PvP 撤回 1 步，PvE 撤回 2 步）、重置
- Hover 预览、最后落子高亮、获胜连线高亮
- 获胜 confetti 动画

## 技术栈

| 层面 | React 版 | 单文件版 |
|------|---------|---------|
| 框架 | React 18 + Vite | 原生 JS |
| 渲染 | Canvas | Canvas |
| AI | Web Worker | setTimeout 异步 |
| 测试 | Vitest（32 用例） | — |
| 构建 | Vite | 零构建 |

## 目录结构

```
src/
├── game/
│   ├── board.js          # 棋盘状态（纯函数）
│   ├── rules.js          # 落子规则、胜负判断
│   └── ai/
│       ├── evaluate.js   # 棋型评分函数
│       ├── minimax.js    # Minimax + Alpha-Beta
│       └── worker.js     # Web Worker 入口
├── hooks/
│   └── useGame.js        # useReducer 游戏状态
├── components/
│   ├── Board.jsx         # Canvas 棋盘
│   ├── Controls.jsx      # 模式/难度控制
│   ├── StatusBar.jsx     # 状态栏 + 操作按钮
│   └── Confetti.jsx      # 获胜粒子动画
├── App.jsx
├── main.jsx
└── styles/index.css
tests/
├── board.test.js
├── rules.test.js
└── evaluate.test.js
```
