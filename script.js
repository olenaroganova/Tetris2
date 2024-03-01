const btnRestart = document.querySelector('.btn-restart');
const scoreElement = document.querySelector('.score');
const overlay = document.querySelector('.overlay');

let playfield;
let tetromino;
let score = 0;
let isGameOver = false;
let timedId = null;
let isPaused = false;

const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const TETROMINO_NAMES = [
    'O',
    'J',
    'I',
    'L',
    'S',
    'T',
    'Z'
]
const TETROMINOES = {
    'O': [
        [1, 1],
        [1, 1],
        
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
        ],
    'T': [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0],
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],

}

let totalSeconds = 0;
let timerInterval;
let cells;
init();

function init() {
    isGameOver = false;
    generatePlayField();
    generateTetromino();
    cells = document.querySelectorAll('.grid div');
    moveDown();
    score = 0;
    scoreElement.innerHTML = 0;
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    totalSeconds++;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    document.querySelector('.timer').innerText = `${minutes} : ${seconds}`;
}

btnRestart.addEventListener('click', function() {
    document.querySelector('.grid').innerHTML = '';
    overlay.style.display = 'none';
    clearInterval(timerInterval);
    alert('GAME IS OVER. YOUR TIME IS: ' + document.querySelector('.timer').innerText)
    totalSeconds = 0;
    init();
})

function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length)
    return array[randomIndex];
}

function countScore(destroyRows) {
    switch(destroyRows) {
        case 1:
            score +=10;
            break;
        case 2:
            score +=20;
            break;
        case 3:
            score +=50;
            break;
        case 4:
            score +=100;
            break;
    }
    scoreElement.innerHTML = score;
}

function generatePlayField() {
    for(let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement('div');
        document.querySelector('.grid').append(div);
    }

    playfield = new Array(PLAYFIELD_ROWS).fill()
                        .map( () => new Array(PLAYFIELD_COLUMNS).fill(0) );
}

function generateTetromino() {
    const name = getRandomElement(TETROMINO_NAMES);
    const matrix = TETROMINOES[name];
    const column = PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
    const rowTetro = -2;
    

    tetromino = {
        name,
        matrix,
        row: rowTetro,
        column,
    }
}

function placeTetromino() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if(isOutsideOfTopboard(row)) {
                isGameOver = true;
                return;
            }

            if(tetromino.matrix[row][column]) {
                playfield[tetromino.row + row][tetromino.column + column] = tetromino.name;
            }
        }
    }

    const filledRows = findFilledRows();
    removeFillRows(filledRows);
    generateTetromino();
    countScore(filledRows.length);
}

function removeFillRows(filledRows) {
    for(let i = 0; i < filledRows.length; i++) {
        const row = filledRows[i];
        dropRowsAbove(row);
    }
}

function dropRowsAbove(rowDelete) {
    for(let row = rowDelete; row > 0; row--) {
        playfield[row] = playfield[row - 1];
    }

    playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function findFilledRows() {
    const fillRows = [];
    for(let row = 0; row < PLAYFIELD_ROWS; row++) {
        let filledColumns = 0;
        for(let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if(playfield[row][column] != 0){
                filledColumns++;
            }
        }
        if(PLAYFIELD_COLUMNS === filledColumns) {
            fillRows.push(row);
        }
    }
    return fillRows;
}

function drawPlayField() {
    for(let row = 0; row < PLAYFIELD_ROWS; row++) {
        for(let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if(playfield[row][column] == 0) continue;

            const name = playfield[row][column];
            const cellIndex = convertPositionToIndex(row,column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawTetromino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;

    for(let row = 0; row < tetrominoMatrixSize; row++) {
        for(let column = 0; column < tetrominoMatrixSize; column++) {
            // щоб подивитись результат алгоритм з функції rotateMatrix()!!!!!!!!!!!!!!!!!!!!!!!
            // const cellIndex = convertPositionToIndex(
            //     tetromino.row + row,
            //     tetromino.column + column
            // );
            // cells[cellIndex].innerHTML = showRotated[row][column];
            if(isOutsideOfTopboard(row)) continue;
            if(!tetromino.matrix[row][column]) continue;
            const cellIndex = convertPositionToIndex(
                tetromino.row + row,
                tetromino.column + column
            );
            
            cells[cellIndex].classList.add(name);
        }
        //column
    }
    //row
}

function draw() {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawPlayField();
    drawTetromino();
}

function rotateTetromino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    tetromino.matrix = rotatedMatrix;
    if(!isValid()) {
        tetromino.matrix = oldMatrix;
    }
}

function rotate() {
    rotateTetromino();
    draw();
}

document.addEventListener('keydown', onKeyDown);
document.querySelector('.left').addEventListener('click', moveTetrominoLeft);
document.querySelector('.right').addEventListener('click', moveTetrominoRight);
document.querySelector('.down').addEventListener('click', moveTetrominoDown);
document.querySelector('.rotate').addEventListener('click', rotate);

function onKeyDown(e) {
    if(e.key == 'Escape') {
        togglePauseGame();
    }
    if(!isPaused) {
        switch(e.key) {
            case ' ':
                dropTetrominoDown();
                break;
            case 'ArrowUp': 
                rotate();
                break;
            case 'ArrowDown':
                moveTetrominoDown();
                break;
            case 'ArrowLeft':
                moveTetrominoLeft();
                break;
            case 'ArrowRight':
                moveTetrominoRight();
                break;
        }
    }
    draw();
}

function dropTetrominoDown() {
    while(isValid()) {
        tetromino.row++;
    }
    tetromino.row--;
}

function rotateMatrix(matrixTetromino) {
    const N = matrixTetromino.length;
    const rotateMatrix = [];
    for(let i = 0; i < N; i++) {
        rotateMatrix[i] = [];
        for(let j = 0; j < N; j++) {
            rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
        }
    }
    return rotateMatrix;
}

function moveTetrominoDown() {
    tetromino.row += 1;
    if(!isValid()) {
        tetromino.row -= 1;
        placeTetromino();
    }
    draw();
}

function moveTetrominoLeft() {
    tetromino.column -= 1;
    if(!isValid()) {
        tetromino.column += 1;
    }
    draw();
}

function moveTetrominoRight() {
    tetromino.column += 1;
    if(!isValid()) {
        tetromino.column -= 1;
    }
    draw();
}

function moveDown() {
    moveTetrominoDown();
    draw();
    stopLoop();
    startLoop();
    if(isGameOver) {
        gameOver();
    }
}

function gameOver() {
    stopLoop();
    overlay.style.display = 'flex';
}

function startLoop() {
    if(!timedId) {
        timedId = setTimeout(()=>{ requestAnimationFrame(moveDown) }, 700)
    }
}

function stopLoop() {
    cancelAnimationFrame(timedId);
    clearTimeout(timedId);
    timedId = null;
}

function togglePauseGame() {
    if(isPaused === false) {
        stopLoop();
    } else {
        startLoop();
    }
    isPaused = !isPaused;
}

function isValid () {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            // if(tetromino.matrix[row][column]) continue;
            if(isOutsideOfGameboard(row, column)) { return false; }
            if(hasCollisions(row, column)) { return false; }
        }
    }
    return true;
}

function isOutsideOfTopboard(row) {
    return tetromino.row + row < 0;
}

function isOutsideOfGameboard (row, column) {
    return tetromino.matrix[row][column] &&
    (   
        tetromino.column + column < 0 
        ||tetromino.column + column >= PLAYFIELD_COLUMNS 
        ||tetromino.row + row >= PLAYFIELD_ROWS
    );
}

function hasCollisions (row, column) {
    return tetromino.matrix[row][column] 
     && playfield[tetromino.row + row]?.[tetromino.column + column];
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault(); 
    }
});

document.querySelector('.newgame').addEventListener('click', function() {
    document.querySelector('.grid').innerHTML = '';
    overlay.style.display = 'none';
    clearInterval(timerInterval);
    totalSeconds = 0;
    init();
})

// let showRotated = [
//     [1,2,3],
//     [4,5,6],
//     [7,8,9]
// ]

// draw();