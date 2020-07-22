/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log("hi");

//hello

const size = +location.search.substr(1) || 3;

const $ = e => document.querySelectorAll(e);
let memory = [],
  shortterm = [],
  pointer = 0;

let gamedata = {
  games: 0,
  you: 0,
  ai: 0
};

let board = setdefault();
let squares;
let score = -3,
  farthest = 0;

function setdefault() {
  let end = [];
  for (let i = 0; i < size; i++) {
    let x = [];
    for (let j = 0; j < size; j++) {
      if (i === 0) x.push(1);
      else if (i === size - 1) x.push(-1);
      else x.push(0);
    }
    end.push(x);
  }
  return end;
}

function drawboard() {
  board.forEach((i, n) => {
    i.forEach((j, x) => {
      squares[n * size + x].innerHTML = "";
    });
  });
  board.forEach((i, n) => {
    i.forEach((j, x) => {
      let square = squares[n * size + x];
      switch (j) {
        case 1:
          square.innerHTML =
            '<img src="https://thumbs.dreamstime.com/b/black-color-queen-pawn-placed-middle-white-isolated-background-empty-180145468.jpg" />';
          break;
        case -1:
          square.innerHTML =
            '<img src="https://c8.alamy.com/comp/H2JYWW/white-pawn-H2JYWW.jpg" />';
          break;
      }
    });
  });
}

function move(x, y, x1, y1) {
  board[y1][x1] = board[y][x];
  board[y][x] = 0;
  drawboard();
}

function findMoves(x, y) {
  let dir = board[y][x];
  if (!dir) return [];
  let moves = [];
  if (board[y + dir]) {
    if (board[y + dir][x] === 0) moves.push([x, y + dir]);
    if (board[y + dir][x + 1] === -dir) moves.push([x + 1, y + dir]);
    if (board[y + dir][x - 1] === -dir) moves.push([x - 1, y + dir]);
  }
  return moves;
}

function checkWin() {
  if (board[0].some(j => j === -1)) return -1;
  if (board[size - 1].some(j => j === 1)) return 1;
  return 0;
}

function isStuck() {
  let me = [];
  board.forEach((i, y) => {
    i.forEach((j, x) => {
      if (j === -1) {
        me.push([x, y]);
      }
    });
  });

  let options = me.map(i => findMoves(...i)).filter(i => i.length);
  return options.length === 0;
}

function decide() {
  let me = [];
  board.forEach((i, y) => {
    i.forEach((j, x) => {
      if (j === 1) me.push([x, y]);
    });
  });

  let options = me.map(i => findMoves(...i));

  let mapped = [];
  for (let i = 0; i < options.length; i++) {
    for (let j of options[i]) {
      mapped.push(me[i]);
    }
  }
  me = mapped;
  mapped = [];

  options = options.reduce((a, i) => a.concat(i));

  if (me.length === 0) return false;

  let freq = [];
  me.forEach((i, x) => {
    if (!memory[pointer]) return freq.push(3);
    if (!memory[pointer][posToName(...i)]) return freq.push(3);
    freq.push(memory[pointer][posToName(...i)][posToName(...options[x])] || 3);
  });

  freq.forEach((i, x) => {
    for (let j = 0; j < i; j++) {
      mapped.push(x);
    }
  });

  let fin = mapped[Math.floor(Math.random() * mapped.length)];
  shortterm[pointer] = shortterm[pointer] || {};
  shortterm[pointer][posToName(...me[fin])] =
    shortterm[posToName(...me[fin])] || {};
  shortterm[pointer][posToName(...me[fin])][posToName(...options[fin])] = true;

  if (board[options[fin][1]][options[fin][0]] === -1) {
    score += 0.5;
  }

  if (options[fin][1] > farthest) {
    score += 0.5;
    farthest = options[fin][1];
  }

  move(...me[fin], ...options[fin]);
  pointer++;
  return true;
}

async function reset(won = false) {
  if (won) score += 7;
  for (let n = 0; n < shortterm.length; n++) {
    for (let i in shortterm[n]) {
      if (!memory[n]) memory[n] = {};
      if (!memory[n].hasOwnProperty(i)) memory[n][i] = {};
      for (let j in shortterm[i]) {
        if (!memory[n][i].hasOwnProperty(j)) memory[n][i][j] = 3;
        memory[n][i][j] += Math.floor(score);
        if (memory[n][i][j] < 1) memory[n][i][j] = 1;
      }
    }
  }
  score = -3;
  farthest = 0;
  shortterm = [];
  uncolor();
  pointer = 0;

  gamedata.games++;
  gamedata.you += won ? 1 : 0;
  gamedata.ai += won ? 0 : 1;
  $(
    "#wins"
  )[0].innerHTML = `Games: ${gamedata.games} <br />You: ${gamedata.you} - AI: ${gamedata.ai}`;
  $("#again")[0].classList.remove("hidden");

  await new Promise(x => {
    let btn = $("#again")[0];
    function next() {
      $("#again")[0].classList.add("hidden");
      btn.removeEventListener("click", next);
      x();
    }

    btn.addEventListener("click", next);
  });

  board = setdefault();
  drawboard();
}

function isValid(x, y, x1, y1) {
  return findMoves(x, y).some(i => i[0] === x1 && i[1] === y1);
}

function posToName(x, y) {
  return String.fromCharCode(y + 97) + x;
}

function uncolor() {
  squares.forEach(i => {
    i.style.backgroundColor = "";
  });
}

let selecting = -1;
function init() {
  document.documentElement.style.setProperty(
    "--rows",
    "repeat(" + size + ", 1fr)"
  );
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let div = document.createElement("div");
      div.id = posToName(j, i);
      $("#board")[0].appendChild(div);
    }
  }
  squares = $("#board div");
  squares.forEach((i, x) => {
    i.dataset.id = x;
    i.addEventListener("click", e => {
      let pos = n => [n % size, Math.floor(n / size)];

      if (selecting === -1) {
        if (board[pos(i.dataset.id)[1]][pos(i.dataset.id)[0]] === -1) {
          i.style.backgroundColor = "blue";
          selecting = i.dataset.id;
        }
      } else if (selecting === i.dataset.id) {
        i.style.backgroundColor = "";
        selecting = -1;
      } else {
        if (isValid(...pos(selecting), ...pos(i.dataset.id))) {
          move(...pos(selecting), ...pos(i.dataset.id));
          if (checkWin() !== 0 || isStuck()) {
            if (isStuck()) reset(true);
            else reset(checkWin() < 0);
            uncolor();
            selecting = -1;
            return;
          }
          if (!decide()) {
            reset(false);
            uncolor();
            selecting = -1;
            return;
          }
          if (checkWin() !== 0 || isStuck()) {
            if (isStuck()) reset(true);
            else reset(checkWin() < 0);
          }
          drawboard();
          uncolor();
          selecting = -1;
        }
      }
    });
  });
  drawboard();
}

init();
