const boardEl = document.getElementById("board");
const turnText = document.getElementById("turn");

let selected = null;
let currentPlayer = "white";

// Board with piece + color
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

function createBoard() {
  boardEl.innerHTML = "";

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {

      const sq = document.createElement("div");
      sq.classList.add("square");
      sq.classList.add((r + c) % 2 === 0 ? "white" : "black");

      sq.dataset.r = r;
      sq.dataset.c = c;

      const piece = board[r][c];
      sq.textContent = piece ? symbols[piece] : "";

      sq.addEventListener("click", () => handleClick(r, c));

      boardEl.appendChild(sq);
    }
  }
}

function handleClick(r, c) {
  const piece = board[r][c];

  if (selected) {
    const moves = getValidMoves(selected.r, selected.c);

    const isValid = moves.some(m => m.r === r && m.c === c);

    if (isValid) {
      movePiece(selected.r, selected.c, r, c);
      currentPlayer = currentPlayer === "white" ? "black" : "white";
      turnText.textContent = "Turn: " + capitalize(currentPlayer);
    }

    selected = null;
    clearHighlights();
    createBoard();
    return;
  }

  if (piece && piece[0] === currentPlayer[0]) {
    selected = { r, c };
    highlightMoves(r, c);
  }
}

function movePiece(sr, sc, tr, tc) {
  board[tr][tc] = board[sr][sc];
  board[sr][sc] = "";
}

// ================= MOVE LOGIC =================

function getValidMoves(r, c) {
  const piece = board[r][c];
  if (!piece) return [];

  const type = piece[1];
  const color = piece[0];

  let moves = [];

  if (type === "p") moves = pawnMoves(r, c, color);
  if (type === "r") moves = rookMoves(r, c, color);
  if (type === "n") moves = knightMoves(r, c, color);
  if (type === "b") moves = bishopMoves(r, c, color);
  if (type === "q") moves = queenMoves(r, c, color);
  if (type === "k") moves = kingMoves(r, c, color);

  return moves;
}

// -------- Pawn --------
function pawnMoves(r, c, color) {
  let dir = color === "w" ? -1 : 1;
  let moves = [];

  if (!board[r + dir]?.[c]) moves.push({ r: r + dir, c });

  // capture
  [-1, 1].forEach(dc => {
    let target = board[r + dir]?.[c + dc];
    if (target && target[0] !== color) {
      moves.push({ r: r + dir, c: c + dc });
    }
  });

  return moves;
}

// -------- Rook --------
function rookMoves(r, c, color) {
  return linearMoves(r, c, color, [[1,0],[-1,0],[0,1],[0,-1]]);
}

// -------- Bishop --------
function bishopMoves(r, c, color) {
  return linearMoves(r, c, color, [[1,1],[1,-1],[-1,1],[-1,-1]]);
}

// -------- Queen --------
function queenMoves(r, c, color) {
  return linearMoves(r, c, color, [
    [1,0],[-1,0],[0,1],[0,-1],
    [1,1],[1,-1],[-1,1],[-1,-1]
  ]);
}

// -------- King --------
function kingMoves(r, c, color) {
  let moves = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      let nr = r + dr, nc = c + dc;
      if (isInside(nr, nc) && (!board[nr][nc] || board[nr][nc][0] !== color)) {
        moves.push({ r: nr, c: nc });
      }
    }
  }
  return moves;
}

// -------- Knight --------
function knightMoves(r, c, color) {
  const steps = [
    [2,1],[2,-1],[-2,1],[-2,-1],
    [1,2],[1,-2],[-1,2],[-1,-2]
  ];
  let moves = [];

  steps.forEach(([dr, dc]) => {
    let nr = r + dr, nc = c + dc;
    if (isInside(nr, nc) && (!board[nr][nc] || board[nr][nc][0] !== color)) {
      moves.push({ r: nr, c: nc });
    }
  });

  return moves;
}

// -------- Helpers --------
function linearMoves(r, c, color, directions) {
  let moves = [];

  directions.forEach(([dr, dc]) => {
    let nr = r + dr, nc = c + dc;

    while (isInside(nr, nc)) {
      if (!board[nr][nc]) {
        moves.push({ r: nr, c: nc });
      } else {
        if (board[nr][nc][0] !== color) {
          moves.push({ r: nr, c: nc });
        }
        break;
      }
      nr += dr;
      nc += dc;
    }
  });

  return moves;
}

function isInside(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// -------- UI --------
function highlightMoves(r, c) {
  clearHighlights();

  const moves = getValidMoves(r, c);

  document.querySelectorAll(".square").forEach(sq => {
    if (sq.dataset.r == r && sq.dataset.c == c) {
      sq.classList.add("selected");
    }

    moves.forEach(m => {
      if (sq.dataset.r == m.r && sq.dataset.c == m.c) {
        sq.classList.add("valid");
      }
    });
  });
}

function clearHighlights() {
  document.querySelectorAll(".square").forEach(sq => {
    sq.classList.remove("selected", "valid");
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

createBoard();