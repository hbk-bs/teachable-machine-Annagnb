let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/UGABDL5F4/';

let video;
let label = '';
let board = ['', '', '', '', '', '', '', '', '']; 
let currentIndex = 0; 
function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
    console.log(classifier);
}

function setup() {
    createCanvas(600, 600); 
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();
    classifyVideo();
}

function draw() {
    background(255); 
    image(video, 0, 0);

    fill(0);
    textSize(16);
    textAlign(CENTER);
    text("Erkannt: " + label, width / 2, 270); 
}
    drawBoard(); 

function classifyVideo() {
    classifier.classify(video, gotResult); 
}

function gotResult(results) {
    console.log(results);
    label = results[0].label; 
}
    
    if ((label === 'X' || label === 'O') && board[currentIndex] === '') {
        board[currentIndex] = label;
        currentIndex = (currentIndex + 1) % 9; 

    classifyVideo(); 

function keyPressed() {
    
    if (key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % 9; 
    }
    if (key === 'ArrowLeft') {
        currentIndex = (currentIndex + 8) % 9; 
    }
    if (key === 'ArrowUp') {
        currentIndex = (currentIndex + 6) % 9; 
    }
    if (key === 'ArrowDown') {
        currentIndex = (currentIndex + 3) % 9; 
}}

function drawBoard() {
    let size = 100; 
    for (let i = 0; i < 9; i++) {
        let x = (i % 3) * size + 20; 
        let y = floor(i / 3) * size + 300; 
        stroke(0); 
        noFill();
        rect(x, y, size, size); 

        
        fill("pink"); 
        textSize(32);
        textAlign(CENTER, CENTER);
        text(board[i], x + size / 2, y + size / 2); 
        
        if (i === currentIndex) {
            noFill();
            stroke(0, 200, 0);
            strokeWeight(3);
            rect(x + 2, y + 2, size - 4, size - 4);
            strokeWeight(1);
        }
    }
}

//bittefunktionier lol