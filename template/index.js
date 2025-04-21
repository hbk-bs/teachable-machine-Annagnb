let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/9dac-6h8u/';

let video;
let label = '';
let board = ['', '', '', '', '', '', '', '', ''];
let currentIndex = 0;
let inputReady = true;
let currentPlayer = 'X';
let winner = null;
let scoreX = 0;
let scoreO = 0;
let gameMode = null;

let showWinnerMessage = false;
let winnerMessage = '';
let messageTimer = null;

function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
  let canvas = createCanvas(400, 700);
  canvas.parent('sketch');

  video = createCapture(VIDEO);
  video.size(200, 150);
  video.hide();
  classifyVideo();

  select('#resetButton').mousePressed(resetGame);
  select('#pvpButton').mousePressed(() => {
    gameMode = 'PVP';
    resetGame();
  });
  select('#aiButton').mousePressed(() => {
    gameMode = 'AI';
    resetGame();
  });
}

function draw() {
  background('#FFECEA');

  select('#labelText').html('Erkannt: ' + label);
  if (winner) {
    select('#winnerText').html('Gewinner: ' + winner).style('display', 'block');
  } else {
    select('#winnerText').style('display', 'none');
    select('#playerText').html('Spieler: ' + currentPlayer);
  }

  drawBoard();

  if (!winner && inputReady && board[currentIndex] === '') {
    if ((currentPlayer === 'X' && label.toLowerCase() === 'x') ||
        (currentPlayer === 'O' && label.toLowerCase() === 'o')) {
      board[currentIndex] = currentPlayer;
      inputReady = false;
      winner = checkWinner();
      if (winner) handleWin(winner);
      else currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
  }

  if (gameMode === 'AI' && !winner && currentPlayer === 'O') {
    aiMove();
    winner = checkWinner();
    if (winner) handleWin(winner);
    else currentPlayer = 'X';
  }
}

function classifyVideo() {
  classifier.classify(video, gotResult);
}

function gotResult(results) {
  if (results && results[0]) {
    label = results[0].label;
  }
  classifyVideo();
}

function keyPressed() {
  if (winner) return;

  let moved = false;

  if (key === 'ArrowRight') currentIndex = (currentIndex + 1) % 9;
  else if (key === 'ArrowLeft') currentIndex = (currentIndex + 8) % 9;
  else if (key === 'ArrowUp') currentIndex = (currentIndex + 6) % 9;
  else if (key === 'ArrowDown') currentIndex = (currentIndex + 3) % 9;

  inputReady = true;
}

function drawBoard() {
  let size = 100;
  for (let i = 0; i < 9; i++) {
    let x = (i % 3) * size + 45;
    let y = floor(i / 3) * size + 2;

    if (board[i] === 'X') fill('#F1A8C6');
    else if (board[i] === 'O') fill('#C2CDFF');
    else fill('#FFECEA');

    stroke('#424790');
    rect(x, y, size, size);

    fill('#424790');
    textSize(36);
    textAlign(CENTER, CENTER);
    text(board[i], x + size / 2, y + size / 2);

    if (i === currentIndex) {
      noFill();
      stroke('#EB5200');
      strokeWeight(3);
      rect(x + 2, y + 2, size - 4, size - 4);
      strokeWeight(1);
    }
  }
}

function checkWinner() {
  const combos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let combo of combos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      if (board[a] === 'X') scoreX++;
      if (board[a] === 'O') scoreO++;
      return board[a];
    }
  }
  if (!board.includes('')) return "Unentschieden";
  return null;
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentIndex = 0;
  inputReady = true;
  currentPlayer = 'X';
  winner = null;
  showWinnerMessage = false;
  clearTimeout(messageTimer);
  select('#overlay').style('display', 'none');
}

function aiMove() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      if (checkWinner() === 'O') return;
      board[i] = '';
    }
  }
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'X';
      if (checkWinner() === 'X') {
        board[i] = 'O';
        return;
      }
      board[i] = '';
    }
  }

  let emptyFields = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
  let randomIndex = emptyFields[Math.floor(Math.random() * emptyFields.length)];
  board[randomIndex] = 'O';
}

function handleWin(winner) {
  let msg = '';
  if (winner === 'X' || winner === 'O') {
    msg = `Spieler ${winner} hat gewonnen!`;
    if (gameMode === 'AI' && winner === 'O') msg = 'KI hat gewonnen!';
  } else {
    msg = 'Unentschieden!';
  }

  select('#overlayText').html(msg);
  select('#overlay').style('display', 'flex');

  // Starte Konfetti
  confetti();

  messageTimer = setTimeout(() => {
    select('#overlay').style('display', 'none');
  }, 5000);
}

// Konfetti mit JSConfetti
function confetti() {
  const jsConfetti = new JSConfetti();
  jsConfetti.addConfetti({
    emojis: ['🌟', '✨', '⭐️'],
    emojiSize: 50,
    confettiNumber: 150,
  });
}