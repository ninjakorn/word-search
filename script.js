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

// Pool of available words – adjust or extend this list as needed
const allWords = ["CAT", "DOG", "BIRD", "FISH", "LION", "TIGER", "HORSE", "BEAR", "WOLF", "SNAKE"];

// Allowed directions for word placement and for selection (dx = columns, dy = rows)
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

// Generate a new level
function generateLevel() {
  // Clear previous state
  gridContainer.innerHTML = "";
  foundWords = [];
  
  // Determine the number of words for this level (level 1 starts with 5 words, etc.)
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
  
  // Attempt to place each word in the grid
  for (let word of wordsToFind) {
    if (!placeWord(word)) {
      console.error("Failed to place word: " + word + ". Regenerating level...");
      return generateLevel(); // Restart level generation if a word cannot be placed
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

// Try to place a given word into gridData using a random direction and position
function placeWord(word) {
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let dir = directions[Math.floor(Math.random() * directions.length)];
    // Calculate bounds for starting position to ensure the word fits
    let maxRow = (dir.dy === 1) ? gridRows - word.length : (dir.dy === -1 ? word.length - 1 : gridRows - 1);
    let maxCol = (dir.dx === 1) ? gridCols - word.length : (dir.dx === -1 ? word.length - 1 : gridCols - 1);
    let startRow = Math.floor(Math.random() * (maxRow + 1));
    let startCol = Math.floor(Math.random() * (maxCol + 1));
    
    // Check if the word fits (cells are empty or match the letter)
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
      // Place the word into the grid
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

// Fill empty cells in gridData with random uppercase letters
function fillEmptyCells() {
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (gridData[r][c] === "") {
        gridData[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }
}

// Render the grid to the DOM based on gridData
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
          // Remove the trail only if the cell hasn't been permanently highlighted
          if (!cell.classList.contains("found-cell")) {
            cell.classList.remove("trail");
          }
        }, 300);
      });
      
      gridContainer.appendChild(cell);
    }
  }
}

// Render the word list (words to find) in the DOM
function renderWordList() {
  const wordListEl = document.getElementById("words");
  wordListEl.innerHTML = "";
  wordsToFind.forEach(word => {
    let li = document.createElement("li");
    li.textContent = word;
    wordListEl.appendChild(li);
  });
}

// Validate that each word in wordsToFind can be found in gridData
function validateWordsInGrid() {
  for (let word of wordsToFind) {
    if (!isWordInGrid(word)) {
      console.error("Word " + word + " not found in grid.");
      return false;
    }
  }
  return true;
}

// Search gridData for a given word in any allowed direction
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

// Returns the DOM cell element at the specified row and column
function getCell(row, col) {
  return document.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
}

// Clears temporary selection highlight from cells that are not permanently marked as found
function clearSelection() {
  selectedCells.forEach(cell => {
    if (!cell.classList.contains("found-cell")) {
      cell.classList.remove("selected");
    }
  });
  selectedCells = [];
}

// Updates the current selection line from the start cell to the provided current cell,
// snapping the direction to one of the allowed eight directions.
function updateSelectionLine(currentCell) {
  if (!startCell) return;
  
  let startRow = parseInt(startCell.dataset.row, 10);
  let startCol = parseInt(startCell.dataset.col, 10);
  let currentRow = parseInt(currentCell.dataset.row, 10);
  let currentCol = parseInt(currentCell.dataset.col, 10);
  
  let deltaRow = currentRow - startRow;
  let deltaCol = currentCol - startCol;
  let angle = Math.atan2(deltaRow, deltaCol);
  
  // Snap to the nearest allowed direction
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
  
  // Determine how many steps (cells) to include in the line.
  let steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
  let newSelection = [];
  for (let i = 0; i <= steps; i++) {
    let r = startRow + i * bestDirection.dy;
    let c = startCol + i * bestDirection.dx;
    if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) break;
    newSelection.push(getCell(r, c));
  }
  
  // Update highlighting: clear old temporary selection and mark the new selection.
  clearSelection();
  selectedCells = newSelection;
  selectedCells.forEach(cell => cell.classList.add("selected"));
}

// When selection is complete (mouse or touch release), check if the formed word is valid.
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

// Returns a random hex color string (e.g. "#3FA2B1")
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Mark a word as found and update the word list in the DOM.
// Permanently highlight the cells used for the found word with a random color.
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
    alert("Level " + level + " complete!");
  }
}

// ------------- Mouse and Touch Event Listeners for Straight-line Selection -------------

// --- Mouse Events ---
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

// --- Touch Events for Mobile Devices ---
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

// ------------- Next Level Control -------------
nextLevelBtn.addEventListener("click", function () {
  level++;
  generateLevel();
});

// Generate the first level when the page loads
document.addEventListener("DOMContentLoaded", function () {
  generateLevel();
});
