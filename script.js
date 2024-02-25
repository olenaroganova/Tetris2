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

function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

let playField;
let tetromino;

function generatePlayField() {
    for(let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement('div');
        document.querySelector('.grid').append(div);
    }

    playField = new Array(PLAYFIELD_ROWS).fill()
                        .map( () => new Array(PLAYFIELD_COLUMNS).fill(0) );
   
    

}


function generateTetromino() {
    const index = Math.floor(Math.random() * TETROMINO_NAMES.length)
    const name = TETROMINO_NAMES[index];
    const matrix = TETROMINOES[name];
    const column = PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
    

    tetromino = {
        name,
        matrix,
        row: 0,
        column: column,
    }
}

function placeTetromino() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if(tetromino.matrix[row][column]) {
                playField[tetromino.row + row][tetromino.column + column] = tetromino.name;
            }
        }
    }
    generateTetromino();
}


generatePlayField();
generateTetromino();

const cells = document.querySelectorAll('.grid div');

function drawPlayField() {
    for(let row = 0; row < PLAYFIELD_ROWS; row++) {
        for(let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if(playField[row][column] == 0) continue;

            const name = playField[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            // console.log(cellIndex);
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
            if(!tetromino.matrix[row][column]) continue;
            const cellIndex = convertPositionToIndex(
                tetromino.row + row,
                tetromino.column + column
            );
           
            // console.log(cellIndex);
            
            cells[cellIndex].classList.add(name);
            

        }
        //column
    }
    //row
}
// drawTetromino();
// drawPlayField();


function draw() {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawTetromino();
    drawPlayField();
}


function rotateTetromino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    // showRotated = rotateMatrix(showRotated);
    tetromino.matrix = rotatedMatrix;
    if(!isValid()) {
        tetromino.matrix = oldMatrix;
    }

}
let showRotated = [
    [1,2,3],
    [4,5,6],
    [7,8,9]
]
draw();

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
    switch(e.key) {
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

    // draw();
    
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
   
    return rotateMatrix
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

function isValid () {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            // if(tetromino.matrix[row][column]) continue;
            if(isOutsideOfGameboard(row, column)) { return false;}
            if(hasCollisions(row, column)) { return false;}
        }
    }
    return true;
}

function isOutsideOfGameboard (row, column) {
    return tetromino.matrix[row][column] &&
    (   tetromino.column + column < 0 
        ||tetromino.column + column >= PLAYFIELD_COLUMNS 
        ||tetromino.row + row >= PLAYFIELD_ROWS
    )
}

function hasCollisions (row, column) {
    return tetromino.matrix[row][column] 
     && playField[tetromino.row + row][tetromino.column + column]
}
