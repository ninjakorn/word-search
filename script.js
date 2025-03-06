// Global variables for level, grid dimensions, and game state
let level = 1;
const gridRows = 10;
const gridCols = 10;
let gridData = [];        // 2D array to store letters in each cell
let wordsToFind = [];     // Array of words that must be found in the current level
let foundWords = [];      // Array to keep track of words that have been found

// Variables for tracking cell selection (straight-line selection)
let isSelecting = false;
let startCell = null;
let selectedCells = [];

// References to DOM elements
const gridContainer = document.getElementById("word-search-grid");
const nextLevelBtn = document.getElementById("next-level-btn");

// --- New Snippet ---
// Instead of a fixed list, get the word pool from categories.js.
// Randomly select one category and use its words as the pool.
const categoryNames = Object.keys(categories);
const selectedCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
const allWords = categories[selectedCategory];
console.log("Selected Category:", selectedCategory, allWords);

// Allowed directions for word placement and selection (dx = columns, dy = rows)
const directions = [
    { dx: 1, dy: 0 },    // right
    { dx: 0, dy: 1 },    // down
    { dx: 1, dy: 1 },    // diagonal down-right
    { dx: -1, dy: 0 },   // left
    { dx: 0, dy: -1 },   // up
    { dx: -1, dy: -1 },  // diagonal up-left
    { dx: 1, dy: -1 },   // diagonal up-right
    { dx: -1, dy: 1 }    // diagonal down-left
];

// ------------- Level Generation and Grid Setup -------------
function generateLevel() {
// Instead of a fixed list, get the word pool from categories.js.
// Randomly select one category and use its words as the pool.
    const categoryNames = Object.keys(categories);
    const selectedCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const allWords = categories[selectedCategory];
    console.log("Selected Category:", selectedCategory, allWords);

    // Clear previous state
    gridContainer.innerHTML = "";
    foundWords = [];
    
    // Determine the number of words for this level
    let wordCount = Math.min(level + 4, allWords.length);
    wordsToFind = [];
    let wordsPool = [...allWords];
    for (let i = 0; i < wordCount; i++) {
        let idx = Math.floor(Math.random() * wordsPool.length);
        wordsToFind.push(wordsPool.splice(idx, 1)[0]);
    }
    
    // Initialize gridData with empty strings
    gridData = [];
    for (let r = 0; r < gridRows; r++) {
        gridData[r] = [];
        for (let c = 0; c < gridCols; c++) {
            gridData[r][c] = "";
        }
    }
    
    // Place each word into the grid
    for (let word of wordsToFind) {
        if (!placeWord(word)) {
            console.error("Failed to place word: " + word + ". Regenerating level...");
            return generateLevel();
        }
    }
    
    // Validate that every word is in the grid
    if (!validateWordsInGrid()) {
        console.error("Validation failed. Regenerating level...");
        return generateLevel();
    }
    
    // Fill empty cells with random letters
    fillEmptyCells();
    
    // Render the grid and word list in the DOM
    renderGrid();
    renderWordList();
    
    // Disable the Next Level button until the level is completed
    nextLevelBtn.disabled = true;
}

function placeWord(word) {
    const maxAttempts = 100;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let dir = directions[Math.floor(Math.random() * directions.length)];
        let maxRow = (dir.dy === 1) ? gridRows - word.length : (dir.dy === -1 ? word.length - 1 : gridRows - 1);
        let maxCol = (dir.dx === 1) ? gridCols - word.length : (dir.dx === -1 ? word.length - 1 : gridCols - 1);
        let startRow = Math.floor(Math.random() * (maxRow + 1));
        let startCol = Math.floor(Math.random() * (maxCol + 1));
        
        let fits = true;
        let r = startRow, c = startCol;
        for (let i = 0; i < word.length; i++) {
            if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) {
                fits = false;
                break;
            }
            if (gridData[r][c] !== "" && gridData[r][c] !== word[i]) {
                fits = false;
                break;
            }
            r += dir.dy;
            c += dir.dx;
        }
        if (fits) {
            r = startRow;
            c = startCol;
            for (let i = 0; i < word.length; i++) {
                gridData[r][c] = word[i];
                r += dir.dy;
                c += dir.dx;
            }
            return true;
        }
    }
    return false;
}

function fillEmptyCells() {
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            if (gridData[r][c] === "") {
                gridData[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }
}

function renderGrid() {
    gridContainer.innerHTML = "";
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            let cell = document.createElement("div");
            cell.classList.add("grid-cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.textContent = gridData[r][c];
            
            // Add mouse trail effect on mouseenter
            cell.addEventListener("mouseenter", function() {
                cell.classList.add("trail");
                setTimeout(() => {
                    if (!cell.classList.contains("found-cell")) {
                        cell.classList.remove("trail");
                    }
                }, 300);
            });
            
            gridContainer.appendChild(cell);
        }
    }
}

function renderWordList() {
    const wordListEl = document.getElementById("words");
    wordListEl.innerHTML = "";
    wordsToFind.forEach(word => {
        let li = document.createElement("li");
        li.textContent = word;
        wordListEl.appendChild(li);
    });
}

function validateWordsInGrid() {
    for (let word of wordsToFind) {
        if (!isWordInGrid(word)) {
            console.error("Word " + word + " not found in grid.");
            return false;
        }
    }
    return true;
}

function isWordInGrid(word) {
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            for (let dir of directions) {
                let found = true;
                let rr = r, cc = c;
                for (let i = 0; i < word.length; i++) {
                    if (rr < 0 || rr >= gridRows || cc < 0 || cc >= gridCols || gridData[rr][cc] !== word[i]) {
                        found = false;
                        break;
                    }
                    rr += dir.dy;
                    cc += dir.dx;
                }
                if (found) return true;
            }
        }
    }
    return false;
}

// ------------- New Cell Selection Logic (Straight-line from A to B) -------------
function getCell(row, col) {
    return document.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
}

function clearSelection() {
    selectedCells.forEach(cell => {
        if (!cell.classList.contains("found-cell")) {
            cell.classList.remove("selected");
        }
    });
    selectedCells = [];
}

function updateSelectionLine(currentCell) {
    if (!startCell) return;
    
    let startRow = parseInt(startCell.dataset.row, 10);
    let startCol = parseInt(startCell.dataset.col, 10);
    let currentRow = parseInt(currentCell.dataset.row, 10);
    let currentCol = parseInt(currentCell.dataset.col, 10);
    
    let deltaRow = currentRow - startRow;
    let deltaCol = currentCol - startCol;
    let angle = Math.atan2(deltaRow, deltaCol);
    
    let bestDirection = directions[0];
    let bestDiff = Infinity;
    directions.forEach(candidate => {
        let candidateAngle = Math.atan2(candidate.dy, candidate.dx);
        let diff = Math.abs(angle - candidateAngle);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        if (diff < bestDiff) {
            bestDiff = diff;
            bestDirection = candidate;
        }
    });
    
    let steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
    let newSelection = [];
    for (let i = 0; i <= steps; i++) {
        let r = startRow + i * bestDirection.dy;
        let c = startCol + i * bestDirection.dx;
        if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) break;
        newSelection.push(getCell(r, c));
    }
    
    clearSelection();
    selectedCells = newSelection;
    selectedCells.forEach(cell => cell.classList.add("selected"));
}

function checkSelectedWord() {
    let word = selectedCells.map(cell => cell.textContent).join("");
    let validWord = null;
    if (wordsToFind.includes(word) && !foundWords.includes(word)) {
        validWord = word;
    } else {
        let reversed = word.split("").reverse().join("");
        if (wordsToFind.includes(reversed) && !foundWords.includes(reversed)) {
            validWord = reversed;
        }
    }
    
    if (validWord) {
        markWordFound(validWord, selectedCells);
        selectedCells = [];
    } else {
        clearSelection();
    }
    startCell = null;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function markWordFound(word, cells) {
    foundWords.push(word);
    const randomColor = getRandomColor();
    cells.forEach(cell => {
        cell.style.backgroundColor = randomColor;
        cell.classList.remove("selected");
        cell.classList.add("found-cell");
    });
    const items = document.querySelectorAll("#words li");
    items.forEach(item => {
        if (item.textContent === word) {
            item.classList.add("found");
        }
    });
    if (foundWords.length === wordsToFind.length) {
        nextLevelBtn.disabled = false;
        nextLevelBtn.classList.add("level-complete");
        alert("Level " + level + " complete!");
    }
}

// --- Mouse and Touch Event Listeners for Straight-line Selection ---
gridContainer.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("grid-cell")) {
        isSelecting = true;
        startCell = e.target;
        updateSelectionLine(e.target);
    }
});

gridContainer.addEventListener("mouseover", function (e) {
    if (isSelecting && e.target.classList.contains("grid-cell")) {
        updateSelectionLine(e.target);
    }
});

document.addEventListener("mouseup", function () {
    if (isSelecting) {
        isSelecting = false;
        checkSelectedWord();
    }
});

gridContainer.addEventListener("touchstart", function (e) {
    e.preventDefault();
    let touch = e.touches[0];
    let target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.classList.contains("grid-cell")) {
        isSelecting = true;
        startCell = target;
        updateSelectionLine(target);
    }
});

gridContainer.addEventListener("touchmove", function (e) {
    e.preventDefault();
    let touch = e.touches[0];
    let target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (isSelecting && target && target.classList.contains("grid-cell")) {
        updateSelectionLine(target);
    }
});

gridContainer.addEventListener("touchend", function () {
    if (isSelecting) {
        isSelecting = false;
        checkSelectedWord();
    }
});

nextLevelBtn.addEventListener("click", function () {
  // Remove the level-complete styling so it resets to the default color
  nextLevelBtn.classList.remove("level-complete");
  
  level++;
  generateLevel();
});

document.addEventListener("DOMContentLoaded", function () {
    generateLevel();
});
