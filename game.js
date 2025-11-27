// ==== 可以依需求調整的參數（規模 / 地雷數） ====
const ROWS = 10;   // 列數
const COLS = 10;   // 行數
const MINES = 15;  // 地雷數量
function updateScore(change) {
    score += change;
    document.getElementById('score').textContent = `分數：${score}`;
}
// ==== 遊戲狀態 ====
let board = [];        // 二維陣列，存每個格子的資訊
let gameOver = false;
let cellsLeft = 0;     // 還剩多少「不是地雷」的格子沒翻開

function initGame() {
    // 🎯 一開始重設分數
    score = 0;
    updateScore(0);
  board = [];
  gameOver = false;
  cellsLeft = ROWS * COLS - MINES;

  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');

  boardEl.innerHTML = '';
  statusEl.textContent = '加油！小心不要踩到地雷～';

  // 設定棋盤為 COLS 欄的 grid
  boardEl.style.gridTemplateColumns = `repeat(${COLS}, 32px)`;

  // 建立空棋盤資料
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = {
        isMine: false,
        adjacent: 0,
        revealed: false,
        flagged: false
      };
    }
  }

  // 隨機放地雷
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      placed++;
    }
  }

  // 計算每格周圍的地雷數
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isMine) continue;
      board[r][c].adjacent = countAdjacentMines(r, c);
    }
  }

  // 建立畫面上的格子元素
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cellEl = document.createElement('div');
      cellEl.className = 'cell';
      cellEl.dataset.row = r;
      cellEl.dataset.col = c;

      // 左鍵翻格子
      cellEl.addEventListener('click', onLeftClick);

      // 右鍵插旗
      cellEl.addEventListener('contextmenu', onRightClick);

      boardEl.appendChild(cellEl);
    }
  }
}

function inBounds(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function countAdjacentMines(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc].isMine) {
        count++;
      }
    }
  }
  return count;
}

function getCellEl(r, c) {
  return document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
}

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function showAllMines() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      const el = getCellEl(r, c);
      if (cell.isMine) {
        el.textContent = '💣';
        el.classList.add('mine', 'revealed');
      }
    }
  }
}

function revealCell(r, c) {
  const cell = board[r][c];
  const cellEl = getCellEl(r, c);

  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  cellEl.classList.add('revealed');

  // 踩到地雷
    if (cell.isMine) {
    updateScore(-50);
    cellEl.textContent = '💣';
    cellEl.classList.add('mine');
    gameOver = true;
    showAllMines();
    setStatus('💥 踩到地雷了！按「重新開始」再挑戰一次～');
    return;
  }

  // 正常格子
    cellsLeft--;
    updateScore(10);

  if (cell.adjacent > 0) {
    cellEl.textContent = cell.adjacent;
    cellEl.classList.add('n' + cell.adjacent);
  } else {
    // 0 的話，做「展開」，把周圍連續的 0 都打開
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc)) {
          revealCell(nr, nc);
        }
      }
    }
  }

  // 檢查是否通關（所有非地雷格子都翻開）
    if (!gameOver && checkWinCondition()) {
        gameOver = true;
        updateScore(100);
        setStatus('🎉 恭喜！你清掉所有地雷了！');
        alert(`🎉 恭喜你清掉所有地雷！最終分數：${score} 分`);
    }

}
function checkWinCondition() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = board[r][c];
            // 如果不是地雷但還沒被翻開，就還沒通關
            if (!cell.isMine && !cell.revealed) {
                return false;
            }
        }
    }
    return true;
}

function onLeftClick(e) {
  if (gameOver) return;
  const r = parseInt(this.dataset.row, 10);
  const c = parseInt(this.dataset.col, 10);
  revealCell(r, c);
}

function onRightClick(e) {
  e.preventDefault(); // 阻止預設右鍵選單
  if (gameOver) return;
  const r = parseInt(this.dataset.row, 10);
  const c = parseInt(this.dataset.col, 10);
  const cell = board[r][c];
  const cellEl = getCellEl(r, c);

  if (cell.revealed) return;

  cell.flagged = !cell.flagged;

    if (cell.flagged) {
        cellEl.textContent = '🚩';
        cellEl.classList.add('flagged');
    } else {
        cellEl.textContent = '';
        cellEl.classList.remove('flagged');
    }


}

// 初始載入與重新開始按鈕
window.addEventListener('DOMContentLoaded', () => {
   document.getElementById('reset').addEventListener('click', initGame);
  initGame();
});
