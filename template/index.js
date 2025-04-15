let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/UGABDL5F4/';

let video;
let label = '';
let board = ['', '', '', '', '', '', '', '', '']; 
let currentIndex = 0; 
let inputReady = true; 
let currentPlayer = 'X'; 
let winner = null;
let lastLabel = ''; // Speichert das zuletzt erkannte Symbol

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

    // Nur das richtige Symbol darf gesetzt werden
    if (!winner && inputReady && board[currentIndex] === '') {
        // Prüfen, ob das erkannte Symbol mit dem aktuellen Spieler übereinstimmt
        if ((currentPlayer === 'X' && label.toLowerCase() === 'x') || 
            (currentPlayer === 'O' && label.toLowerCase() === 'o')) {
            
            // Symbol nur setzen, wenn es sich von dem zuletzt gesetzten unterscheidet
            if (label !== lastLabel) {
                console.log(`Setze ${currentPlayer} auf Position ${currentIndex}`);
                board[currentIndex] = currentPlayer;
                inputReady = false; // Eingabe blockieren, bis der Spieler die nächste Aktion ausführt
                lastLabel = label; // Speichere das zuletzt gesetzte Symbol
                winner = checkWinner();
                if (!winner) {
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                }
            }
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