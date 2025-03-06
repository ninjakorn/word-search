# Advanced Word Search Game

An interactive word search game built with HTML5, CSS3, and JavaScript. The game features algorithmic word placement, endless levels with random word categories, smooth animations, mobile touch support, and fun visual effects to enhance the user experience.

## Features

- **Random Word Categories:**  
  Uses a separate `categories.js` file to provide 30 different word categories. A random category is chosen for each level, ensuring variety.

- **Algorithmic Word Placement:**  
  Words are automatically placed on a 10×10 grid using eight possible directions (horizontal, vertical, and diagonal). The remaining grid cells are filled with random letters.

- **Endless Levels:**  
  As you complete a level by finding all words, you can click the "Next Level" button (which changes color upon level completion) to generate a new puzzle with a fresh random category and word list.

- **Cell Selection & Animations:**  
  - **Straight-line Selection:** Cells are selected along a snapped straight line (using eight allowed directions) when dragging across the grid.
  - **Mouse Trail Effect:** As you hover over cells, a temporary trail animation appears.
  - **Found Word Highlighting:** When a valid word is found, its cells remain permanently highlighted with a random color and pulse briefly.
  - **Bounce Animation:** The "Next Level" button bounces on hover for a playful effect.
  - **Level Complete Indicator:** When all words are found, the button color changes to signal that you can proceed to the next level.

- **Mobile Touch Support:**  
  The app supports touch events so that the game works seamlessly on mobile devices.

## File Structure

- **index.html:**  
  Contains the HTML markup for the game, including the grid, word list, and the next level button.  
  _Note: It includes references to both `categories.js` and `script.js` (in that order)._

- **style.css:**  
  Provides styling for the game elements. It includes rules for the grid layout, cell animations (trail, pulse, bounce), word list styling, and the next level button with its state changes.

- **script.js:**  
  Contains the game logic. Key responsibilities include:
  - Randomly selecting a category and setting up the word pool.
  - Generating the grid, placing words, validating the puzzle, and filling empty cells.
  - Handling cell selection (via mouse and touch events) with straight-line snapping.
  - Checking for valid words, marking found words with a random color, and triggering level completion.

- **categories.js:**  
  Exports a `categories` object that lists 30 categories (e.g., Animals, Colors, Fruits, etc.) with corresponding words. This file is used to dynamically populate the word pool for each level.

## How to Run

1. **Clone or Download the Repository:**  
   Clone the repo or download the files to your local machine.

2. **Open the App:**  
   Open `index.html` in your web browser to start playing.

3. **Customize:**  
   - To add or modify categories and word lists, edit the `categories.js` file.
   - To adjust animations or game logic, update `style.css` and `script.js` respectively.

## Development & Contributions
