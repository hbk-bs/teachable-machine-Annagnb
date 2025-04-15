let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/9dac-6h8u/';

let video;
let label = '';
let board = ['', '', '', '', '', '', '', '', '']; 
let currentIndex = 0; 
let inputReady = true; 
let currentPlayer = 'X'; 
let winner = null;
let lastLabel = ''; // Speichert das zuletzt erkannte Symbol
let scoreX = 0;
let scoreO = 0;
let gameMode = null;

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
    createCanvas(600, 700); 
    video = createCapture(VIDEO);
    video.size(200, 150);
    video.hide();
    classifyVideo();

    // Reset-Button
    let button = createButton('Spiel zurücksetzen');
    button.position(20, 20);
    button.style('font-size', '16px');
    button.mousePressed(resetGame);

    let pvpButton = createButton('Spieler vs. Spieler');
    pvpButton.position(width / 2 - 100, height / 2 - 50);
    pvpButton.mousePressed(() => gameMode = 'PVP');

    let aiButton = createButton('Spieler vs. KI');
    aiButton.position(width / 2 - 100, height / 2);
    aiButton.mousePressed(() => gameMode = 'AI');
}

function draw() {
    background('#FFECEA');

    fill('#424790');
    textSize(32);
    textAlign(CENTER);
    text('Tic Tac Teachable!', width / 2, 60);

    textSize(18);
    text("Erkannt: " + label, width / 2, 270);

    if (winner) {
        fill('#EB5200');
        textSize(24);
        text("Gewinner: " + winner, width / 2, 295);
    } else {
        fill('#424790');
        text("Spieler: " + currentPlayer, width / 2, 295);
    }

    drawBoard();

    // Spielerzug
    if (!winner && inputReady && board[currentIndex] === '') {
        if ((currentPlayer === 'X' && label.toLowerCase() === 'x') || 
            (currentPlayer === 'O' && label.toLowerCase() === 'o')) {
            console.log(`Setze ${currentPlayer} auf Position ${currentIndex}`);
            board[currentIndex] = currentPlayer;
            inputReady = false;
            winner = checkWinner();
            if (!winner) {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            }
        }
    }

    // KI-Zug
    if (!winner && currentPlayer === 'O') {
        aiMove();
        winner = checkWinner(); // Prüfen, ob die KI gewonnen hat
        if (!winner) {
            currentPlayer = 'X'; // Wechsel zurück zum Spieler
        }
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

    // Bewegung auf dem Spielfeld
    if (key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % 9;
        moved = true;
    } else if (key === 'ArrowLeft') {
        currentIndex = (currentIndex + 8) % 9;
        moved = true;
    } else if (key === 'ArrowUp') {
        currentIndex = (currentIndex + 6) % 9;
        moved = true;
    } else if (key === 'ArrowDown') {
        currentIndex = (currentIndex + 3) % 9;
        moved = true;
    }

    // Eingabe wieder aktivieren, wenn der Spieler eine Bewegung macht
    if (moved) {
        console.log("Aktuelle Position:", currentIndex);
        inputReady = true;
    }
}

function drawBoard() {
    let size = 100; 
    for (let i = 0; i < 9; i++) {
        let x = (i % 3) * size + 20; 
        let y = floor(i / 3) * size + 340; 

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
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
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
}

function aiMove() {
    console.log("KI macht einen Zug...");

    // 1. Prüfen, ob die KI gewinnen kann
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            if (checkWinner() === 'O') {
                console.log("KI gewinnt!");
                return;
            }
            board[i] = ''; // Rückgängig machen
        }
    }

    // 2. Prüfen, ob der Spieler gewinnen kann, und blockieren
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'X';
            if (checkWinner() === 'X') {
                board[i] = 'O'; // Blockieren
                console.log("KI blockiert!");
                return;
            }
            board[i] = ''; // Rückgängig machen
        }
    }

    // 3. Andernfalls das erste freie Feld wählen
    let emptyFields = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
    let randomIndex = emptyFields[Math.floor(Math.random() * emptyFields.length)];
    board[randomIndex] = 'O';
    console.log(`KI setzt O auf Position ${randomIndex}`);
}