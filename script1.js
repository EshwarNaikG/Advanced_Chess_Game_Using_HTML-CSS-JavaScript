// ================= SETUP =================
const boardEl = document.getElementById("board");
const turnText = document.getElementById("turn");

let currentPlayer = "white";
let selected = null;

const board = [
  ["br","bn","bb","bq","bk","bb","bn","br"],
  ["bp","bp","bp","bp","bp","bp","bp","bp"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["wp","wp","wp","wp","wp","wp","wp","wp"],
  ["wr","wn","wb","wq","wk","wb","wn","wr"]
];

const symbols = {
  wp:"♙", wr:"♖", wn:"♘", wb:"♗", wq:"♕", wk:"♔",
  bp:"♟", br:"♜", bn:"♞", bb:"♝", bq:"♛", bk:"♚"
};

// ================= UI =================
function createBoard() {
  boardEl.innerHTML = "";

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {

      const sq = document.createElement("div");
      sq.className = "square " + ((r + c) % 2 === 0 ? "white" : "black");

      sq.dataset.r = r;
      sq.dataset.c = c;

      const piece = board[r][c];
      sq.textContent = piece ? symbols[piece] : "";

      sq.onclick = () => handleClick(r, c);

      boardEl.appendChild(sq);
    }
  }
}

// ================= PLAYER MOVE =================
function handleClick(r, c) {
  if (currentPlayer !== "white") return; // player = white

  const piece = board[r][c];

  if (selected) {
    const moves = getLegalMoves(selected.r, selected.c);

    if (moves.some(m => m.r === r && m.c === c)) {
      movePiece(selected.r, selected.c, r, c);

      if (isCheckmate("black")) {
        alert("🎉 Checkmate! You win!");
        return;
      }

      currentPlayer = "black";
      updateTurn();

      setTimeout(aiMove, 300);
    }

    selected = null;
    createBoard();
    return;
  }

  if (piece && piece[0] === "w") {
    selected = { r, c };
  }
}

// ================= AI MOVE =================
function aiMove() {
  let bestMove = minimaxRoot(2, true);

  if (!bestMove) {
    alert("Draw!");
    return;
  }

  movePiece(bestMove.sr, bestMove.sc, bestMove.tr, bestMove.tc);

  if (isCheckmate("white")) {
    alert("💀 Checkmate! AI wins!");
    return;
  }

  currentPlayer = "white";
  updateTurn();
  createBoard();
}

// ================= MINIMAX =================
function minimaxRoot(depth, isMaximizing) {
  let moves = getAllMoves("black");
  let bestScore = -Infinity;
  let bestMove = null;

  for (let move of moves) {
    let copy = cloneBoard(board);

    movePiece(move.sr, move.sc, move.tr, move.tc);

    let score = minimax(depth - 1, false);

    board.splice(0, 8, ...copy);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(depth, isMaximizing) {
  if (depth === 0) return evaluateBoard();

  let moves = getAllMoves(isMaximizing ? "black" : "white");

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of moves) {
      let copy = cloneBoard(board);

      movePiece(move.sr, move.sc, move.tr, move.tc);

      let evalScore = minimax(depth - 1, false);

      board.splice(0, 8, ...copy);
      maxEval = Math.max(maxEval, evalScore);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of moves) {
      let copy = cloneBoard(board);

      movePiece(move.sr, move.sc, move.tr, move.tc);

      let evalScore = minimax(depth - 1, true);

      board.splice(0, 8, ...copy);
      minEval = Math.min(minEval, evalScore);
    }
    return minEval;
  }
}

// ================= EVALUATION =================
function evaluateBoard() {
  const values = { p:10, r:50, n:30, b:30, q:90, k:900 };
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let piece = board[r][c];
      if (piece) {
        let val = values[piece[1]];
        score += piece[0] === "b" ? val : -val;
      }
    }
  }
  return score;
}

// ================= CHECK / CHECKMATE =================
function isCheck(color) {
  let kingPos;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === color[0] + "k") {
        kingPos = { r, c };
      }
    }
  }

  let opponent = color === "white" ? "black" : "white";
  let moves = getAllMoves(opponent);

  return moves.some(m => m.tr === kingPos.r && m.tc === kingPos.c);
}

function isCheckmate(color) {
  if (!isCheck(color)) return false;

  let moves = getAllMoves(color);
  return moves.length === 0;
}

// ================= MOVES =================
function getAllMoves(color) {
  let moves = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let piece = board[r][c];
      if (piece && piece[0] === color[0]) {
        let valid = getLegalMoves(r, c);
        valid.forEach(m => {
          moves.push({ sr:r, sc:c, tr:m.r, tc:m.c });
        });
      }
    }
  }

  return moves;
}

function getLegalMoves(r, c) {
  let moves = getPseudoMoves(r, c);
  let legal = [];

  for (let m of moves) {
    let copy = cloneBoard(board);

    movePiece(r, c, m.r, m.c);

    if (!isCheck(board[m.r][m.c][0] === "w" ? "white" : "black")) {
      legal.push(m);
    }

    board.splice(0, 8, ...copy);
  }

  return legal;
}

// ================= BASIC MOVES (reuse from previous) =================
// 👉 keep your pawnMoves, rookMoves, bishopMoves, etc.
// 👉 rename getValidMoves → getPseudoMoves

// ================= HELPERS =================
function movePiece(sr, sc, tr, tc) {
  board[tr][tc] = board[sr][sc];
  board[sr][sc] = "";
}

function cloneBoard(b) {
  return b.map(row => [...row]);
}

function updateTurn() {
  turnText.textContent = "Turn: " + currentPlayer;
}

// IMPORTANT: rename your old getValidMoves → getPseudoMoves