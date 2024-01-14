let timer;
let startTime;
let elapsedTime = 0; // Hold the elapsed time when paused
let isPaused = true; // Track the state of the timer
let hasTimerStarted = false;

window.onload = function () {
	resetTimer();
	updateButton('Start Timer', 'fa-play');
};

function updateButton(text, iconClass) {
	const pauseButton = document.getElementById('PauseButton');
	pauseButton.innerHTML = `<i class="fas ${iconClass}"></i> ${text}`;
}

function startTimer() {
	if (isPaused) {
		isPaused = false;
		startTime = Date.now() - elapsedTime;
		timer = setInterval(updateTimer, 10); // Update every 10 milliseconds
		updateButton('Pause Timer', 'fa-pause'); // Change button to show "Pause Timer"
	}
}

function pauseTimer() {
	if (!isPaused) {
		clearInterval(timer); // Stop the timer
		timer = null;
		elapsedTime = Date.now() - startTime; // Save the elapsed time without resetting
		isPaused = true;
		// If elapsed time is greater than 0, show "Resume Timer", else show "Start Timer"
		const text = elapsedTime > 0 ? 'Resume Timer' : 'Start Timer';
		updateButton(text, 'fa-play');
	} else {
		// If paused and there is elapsed time, resume it
		if (elapsedTime > 0) {
			startTimer();
		}
	}
}

function stopTimer() {
	clearInterval(timer);
	timer = null;
	elapsedTime = 0; // Reset the elapsed time
	isPaused = true;
	hasTimerStarted = false; // Allow the timer to be started again
	document.getElementById('timer').innerHTML = 'Time: 00:00:000';
	updateButton('Start Timer', 'fa-play'); // Update the button to show "Start Timer"
}

function resetTimer() {
	stopTimer(); // This function will stop the timer and reset elapsed time
	updateButton('Start Timer', 'fa-play'); // Always reset button to "Start Timer" when fully resetting
}

function updateTimer() {
	elapsedTime = Date.now() - startTime;
	document.getElementById('timer').innerHTML = 'Time: ' + formatTime(elapsedTime);
}

function formatTime(milliseconds) {
	let totalSeconds = Math.floor(milliseconds / 1000);
	let minutes = Math.floor(totalSeconds / 60);
	let seconds = totalSeconds - (minutes * 60);
	let millis = milliseconds % 1000;

	if (minutes < 10) { minutes = "0" + minutes; }
	if (seconds < 10) { seconds = "0" + seconds; }
	millis = millis.toString().padStart(3, '0'); // Ensure three digits for milliseconds

	return minutes + ':' + seconds + ':' + millis;
}

document.addEventListener('DOMContentLoaded', () => {
	const cells = document.querySelectorAll('#SudokuGrid input[type="text"]');

	cells.forEach(cell => {
		cell.addEventListener('keydown', function (e) {
			// Check if the key pressed is backspace
			if (e.key === 'Backspace' || e.key === 'Delete') {
				// Check if the Sudoku grid is currently marked as invalid
				if (document.getElementById("OutcomeText").textContent === "Invalid Sudoku :(") {
					// Resume Timer
					startTimer();
					document.getElementById("OutcomeText").innerHTML = "&nbsp;";
				}
			}
		});
	});
});

document.getElementById('SolveButton').addEventListener('click', function () {
	if (hasTimerStarted && !isPaused) {
		pauseTimer(); // If the timer has started and is not paused, pause it.
	}
	solveSudoku();
});

document.getElementById('PauseButton').addEventListener('click', function () {
	if (!hasTimerStarted) {
		startTimer();
		hasTimerStarted = true;
	}
	else {
		// Toggle pause/resume based on the timer's state.
		if (isPaused) {
			startTimer();
		}
		else {
			pauseTimer();
		}
	}
});

document.getElementById('ResetButton').addEventListener('click', resetGrid);

const SIZE = 9;
const SIZE_SQUARED = SIZE * SIZE;
const SIZE_SQRT = Math.sqrt(SIZE);
const NUM_ROWS = SIZE * SIZE * SIZE;
const NUM_COLUMNS = 4 * SIZE * SIZE;
function Node() {
	this.up = this;
	this.down = this;
	this.left = this;
	this.right = this;

	this.head = this;
	this.size = 0;
	this.rowID = [0, 0, 0];
}

let solution = [];
let originalValues = [];

let Grid = [];
let matrix = [];
let row = [];

let dlxHeadNode = new Node();

for (let i = 0; i < NUM_COLUMNS; i++) {
	row.push(0);
}
for (let i = 0; i < NUM_ROWS; i++) {
	matrix.push(row.slice());
}
let isSolved = false;

function solveSudoku() {
	constructExactCoverMatrix(matrix);
	constructDoublyLinkedList(matrix);

	let Sudoku = [];
	let row_temp = [];
	for (let i = 0; i < SIZE; i++) {
		row_temp.push(0);
	}

	for (i = 0; i < SIZE; i++) {
		Sudoku.push(row_temp.slice());
	}

	for (let i = 1; i <= SIZE; i++) {
		for (let j = 1; j <= SIZE; j++) {
			let cellId = `R${i}C${j}`;
			let value = Number(document.getElementById(cellId).value);
			if (value > 0) {
				Sudoku[i - 1][j - 1] = value;
			}
		}
	}

	transformListToCurrentGrid(Sudoku);
	search(0);

	if (!isSolved) {
		document.getElementById("OutcomeText").textContent = "Invalid Sudoku :(";
	}
	else {
		document.getElementById("OutcomeText").textContent = "Solved!";
	}
	isSolved = false;
}

function coverColumn(column) {
	column.left.right = column.right;
	column.right.left = column.left;
	for (let node = column.down; node !== column; node = node.down) {
		for (let temp = node.right; temp !== node; temp = temp.right) {
			temp.down.up = temp.up;
			temp.up.down = temp.down;
			temp.head.size--;
		}
	}
}

function uncoverColumn(column) {
	for (let node = column.up; node !== column; node = node.up) {
		for (let temp = node.left; temp !== node; temp = temp.left) {
			temp.head.size++;
			temp.down.up = temp;
			temp.up.down = temp;
		}
	}
	column.left.right = column;
	column.right.left = column;
}

function search(k) {

	if (dlxHeadNode.right === dlxHeadNode) {
		let row_temp = [];
		for (let u = 0; u < SIZE; u++) {
			row_temp.push(0);
		}
		for (u = 0; u < SIZE; u++) {
			Grid.push(row_temp.slice());
		}
		mapSolutionToGrid(Grid);
		solvedPuzzleOutput(Grid);
		isSolved = true;
		return;
	}
	if (!isSolved) {
		let column = dlxHeadNode.right;
		for (let temp = column.right; temp.size > -1; temp = temp.right) {
			if (temp.size < column.size) {
				column = temp;
			}
		}
		coverColumn(column);

		for (temp = column.down; temp !== column; temp = temp.down) {
			solution[k] = temp;
			for (let node = temp.right; node !== temp; node = node.right) {
				coverColumn(node.head);
			}

			search(k + 1);

			temp = solution[k];
			solution[k] = null;
			column = temp.head;
			for (node = temp.left; node !== temp; node = node.left) {
				uncoverColumn(node.head);
			}
		}
		uncoverColumn(column);
	}
}

function constructExactCoverMatrix(matrix) {
	let j = 0, counter = 0;

	// Filling in the Row-Value Constraints
	for (let i = 0; i < NUM_ROWS; i++) {
		matrix[i][j] = 1;
		counter++;
		if (counter >= SIZE) {
			j++; // Move to the next column after filling SIZE cells
			counter = 0; // Reset counter
		}
	}

	// Filling in the Column-Value Constraints
	let x = 0;
	counter = 1;
	for (j = SIZE_SQUARED; j < 2 * SIZE_SQUARED; j++) {
		for (i = x; i < counter * SIZE_SQUARED; i += SIZE) {
			matrix[i][j] = 1;
		}

		// Adjusting row and counter values for each constraint
		if ((j + 1) % SIZE === 0) {
			x = counter * SIZE_SQUARED;
			counter++;
		}
		else {
			x++;
		}
	}

	// Filling in the Box-Value Constraints
	j = 2 * SIZE_SQUARED;
	for (i = 0; i < NUM_ROWS; i++) {
		matrix[i][j] = 1;
		j++;
		if (j >= SIZE_SQRT * SIZE_SQUARED) {
			j = 2 * SIZE_SQUARED;
		}
	}

	// Filling in the Cell Occupancy Constraint
	x = 0;
	for (j = SIZE_SQRT * SIZE_SQUARED; j < NUM_COLUMNS; j++) {

		// Nested loops to set the appropriate cells to 1
		for (let l = 0; l < SIZE_SQRT; l++) {
			for (let k = 0; k < SIZE_SQRT; k++) {
				matrix[x + l * SIZE + k * SIZE_SQUARED][j] = 1;
			}
		}

		// Logic to update the row position based on the constraints
		let temp = j + 1 - SIZE_SQRT * SIZE_SQUARED;
		if (temp % (SIZE_SQRT * SIZE) === 0) {
			x += (SIZE_SQRT - 1) * SIZE_SQUARED + (SIZE_SQRT - 1) * SIZE + 1;
		}
		else if (temp % SIZE === 0) {
			x += SIZE * (SIZE_SQRT - 1) + 1;
		}
		else {
			x++;
		}
	}
}

function constructDoublyLinkedList(matrix) {
	let header = new Node();
	header.size = -1;

	let temp = header;

	// Creating the header nodes for each column
	for (let i = 0; i < NUM_COLUMNS; i++) {
		let newNode = new Node();
		newNode.left = temp;
		newNode.right = header;
		temp.right = newNode;
		temp = newNode;
	}

	// Creating and linking the rest of the nodes
	let ID = [0, 1, 1];
	for (i = 0; i < NUM_ROWS; i++) {
		let topNode = header.right;
		let prev = 5;

		// Logic to adjust the ID array based on the current row
		if (i !== 0 && i % SIZE_SQUARED === 0) {
			ID = new Array(ID[0] - (SIZE - 1), ID[1] + 1, ID[2] - (SIZE - 1));
		}
		else if (i !== 0 && i % SIZE === 0) {
			ID = new Array(ID[0] - (SIZE - 1), ID[1], ID[2] + 1);
		}
		else {
			ID = new Array(ID[0] + 1, ID[1], ID[2]);
		}

		// Creating nodes and linking them in the list
		for (let j = 0; j < NUM_COLUMNS; j++, topNode = topNode.right) {
			if (matrix[i][j] === 1) {
				let tempNode = new Node();
				tempNode.rowID = ID;
				if (prev === 5) {
					prev = tempNode;
				}

				// Linking the new node with its neighbors
				tempNode.left = prev;
				tempNode.right = prev.right;
				tempNode.right.left = tempNode;
				prev.right = tempNode;

				// Linking the node to the topNode and updating pointers
				tempNode.head = topNode;
				tempNode.down = topNode;
				tempNode.up = topNode.up;
				topNode.up.down = tempNode;
				topNode.up = tempNode;

				// Setting the down pointer of topNode when it's the first node in its column
				if (topNode.size === 0) {
					topNode.down = tempNode;
				}
				topNode.size++; // Incrementing the size of the column
				prev = tempNode; // Moving to the next node
			}
		}
	}
	dlxHeadNode = header;
}
function transformListToCurrentGrid(Puzzle) {
	originalValues = [];
	let column, temp;
	for (let i = 0; i < SIZE; i++) {
		for (let j = 0; j < SIZE; j++) {
			if (Puzzle[i][j] > 0) {
				// Searching the linked list for the corresponding node
				loop1:
				for (column = dlxHeadNode.right; column !== dlxHeadNode; column = column.right) {
					loop2:
					for (temp = column.down; temp !== column; temp = temp.down) {
						// Finding the node that matches the puzzle value and position
						if (temp.rowID[0] === Puzzle[i][j] && (temp.rowID[1] - 1) == i && (temp.rowID[2] - 1) == j) {
							break loop1;
						}
					}
				}
				// Covering the column and storing the original values
				coverColumn(column);
				originalValues.push(temp);
				// Covering the remaining columns in the row
				for (let node = temp.right; node != temp; node = node.right) {
					coverColumn(node.head);
				}
			}
		}
	}
}

function mapSolutionToGrid(grid) {
	for (let sol of solution) {
		if (sol != null) {
			grid[sol.rowID[1] - 1][sol.rowID[2] - 1] = sol.rowID[0];
		}
	}
	for (let origVal of originalValues) {
		if (origVal != null) {
			grid[origVal.rowID[1] - 1][origVal.rowID[2] - 1] = origVal.rowID[0];
		}
	}
}
function solvedPuzzleOutput(Sudoku) {
	for (let i = 1; i <= SIZE; i++) {
		for (let j = 1; j <= SIZE; j++) {
			let cellId = `R${i}C${j}`;
			let puzzleCell = document.getElementById(cellId);
			if (puzzleCell.value == '') {
				puzzleCell.style.color = "#000000";
			}
			puzzleCell.value = Sudoku[i - 1][j - 1];
			puzzleCell.readOnly = true;
		}
	}
}

function resetGrid() {
	for (let i = 1; i <= SIZE; i++) {
		for (let j = 1; j <= SIZE; j++) {
			const cellId = `R${i}C${j}`;
			const puzzleCell = document.getElementById(cellId);
			puzzleCell.readOnly = false;
			puzzleCell.value = "";
			puzzleCell.style.color = "#FF7F50";
		}
	}
	document.getElementById("OutcomeText").innerHTML = "&nbsp;";
	resetTimer();
	updateButton('Start Timer', 'fa-play');
}

document.addEventListener('DOMContentLoaded', () => {
	const inputs = document.querySelectorAll('#SudokuGrid input[type="text"]');

	inputs.forEach(input => {
		input.addEventListener('keypress', function (e) {
			if (validateSudokuInput(e, this.value) && !hasTimerStarted) {
				startTimer();
				hasTimerStarted = true; // The timer has now been started
			}
		});
	});
});

function validateSudokuInput(e, number) {
	let key = e.key;

	if (!key.match(/[1-9]/) || number.length == 1) {
		e.preventDefault();
		return false;
	}
	return true;
}

////////////////////////////////////////
// Directional Navigation
///////////////////////////////////

function moveFocus(currentId, direction) {
	// Extract the row and column number from the current ID
	let row = parseInt(currentId.substring(1, 2), 10);
	let col = parseInt(currentId.substring(3), 10);

	// Determine the new row and column based on the direction
	switch (direction) {
		case 'ArrowLeft':
			col = col - 1;
			break;
		case 'ArrowRight':
			col = col + 1;
			break;
		case 'ArrowUp':
			row = row - 1;
			break;
		case 'ArrowDown':
			row = row + 1;
			break;
		default:
			return; // Not an arrow key
	}

	// Ensure the new row and column are within the grid bounds
	if (row < 1) row = 9;
	if (row > 9) row = 1;
	if (col < 1) col = 9;
	if (col > 9) col = 1;

	// Construct the new ID
	let newId = `R${row}C${col}`;

	// Focus the new cell
	let newCell = document.getElementById(newId);
	if (newCell) {
		newCell.focus();
	}
}

// Add event listeners to all input elements
let inputs = document.querySelectorAll('#SudokuGrid input[type="text"]');
inputs.forEach(function (input) {
	input.addEventListener('keydown', function (e) {
		if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
			moveFocus(this.id, e.key);
			e.preventDefault(); // Prevent default scrolling behavior
		}
	});
});

////////////////////////////////////////
// Random Sudoku Generation
///////////////////////////////////

// Fisher-Yates shuffle algorithm for an unbiased shuffle
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function generateFullSolution() {
	let board = new Array(SIZE).fill(0).map(() => new Array(SIZE).fill(0));

	function solveBoard(board, row, col) {
		if (col === SIZE) {
			row++;
			col = 0;
		}

		if (row === SIZE) {
			return true; // Puzzle solved
		}

		if (board[row][col] !== 0) {
			return solveBoard(board, row, col + 1); // Skip filled cells
		}

		let numbers = Array.from({ length: SIZE }, (_, i) => i + 1);
		shuffleArray(numbers);

		for (let num of numbers) {
			if (isSafe(board, row, col, num)) {
				board[row][col] = num;

				if (solveBoard(board, row, col + 1)) {
					return true;
				}

				board[row][col] = 0; // Backtrack
			}
		}
		return false;
	}

	solveBoard(board, 0, 0);
	return board;
}

function createRandomSudokuBoard(difficulty) {
	let board = generateFullSolution();
	let cellsToRemove = determineCellsToRemoveBasedOnDifficulty(difficulty);
	removeCellsFromBoard(board, cellsToRemove);
	return board;
}

function determineCellsToRemoveBasedOnDifficulty(difficulty) {
	switch (difficulty) {
		case 'Easy': return 30;
		case 'Medium': return 50;
		case 'Hard': return 65;
		default: return 20;
	}
}

function removeCellsFromBoard(board, cellsToRemove) {
	for (let i = 0; i < cellsToRemove; i++) {
		let row, col;
		do {
			row = Math.floor(Math.random() * SIZE);
			col = Math.floor(Math.random() * SIZE);
		} while (board[row][col] === 0);
		board[row][col] = 0;
	}
}

function setupPuzzle(puzzle) {
	for (let i = 0; i < SIZE; i++) {
		for (let j = 0; j < SIZE; j++) {
			let cellId = `R${i + 1}C${j + 1}`;
			let puzzleCell = document.getElementById(cellId);
			puzzleCell.value = puzzle[i][j] !== 0 ? puzzle[i][j] : '';
			puzzleCell.readOnly = puzzle[i][j] !== 0;
			puzzleCell.style.color = puzzle[i][j] !== 0 ? "#000000" : "#FF7F50";
		}
	}
}

// Event listeners for generating puzzles
document.getElementById('GenerateEasyButton').addEventListener('click', function () {
	let puzzle = createRandomSudokuBoard('Easy');
	setupPuzzle(puzzle);
	document.getElementById("OutcomeText").innerHTML = "&nbsp;";
	resetTimer();
	
});

document.getElementById('GenerateMediumButton').addEventListener('click', function () {
	let puzzle = createRandomSudokuBoard('Medium');
	setupPuzzle(puzzle);
	document.getElementById("OutcomeText").innerHTML = "&nbsp;";
	resetTimer();

});

document.getElementById('GenerateHardButton').addEventListener('click', function () {
	let puzzle = createRandomSudokuBoard('Hard');
	setupPuzzle(puzzle);
	document.getElementById("OutcomeText").innerHTML = "&nbsp;";
	resetTimer();
	
});

function solveSudokuUsingBacktracking(board) {
	let emptySpot = findEmpty(board);
	if (!emptySpot) return true; // Puzzle solved

	let [row, col] = emptySpot;

	for (let num = 1; num <= SIZE; num++) {
		if (isSafe(board, row, col, num)) {
			board[row][col] = num;
			if (solveSudokuUsingBacktracking(board)) {
				return true;
			}
			board[row][col] = 0; // Backtrack
		}
	}

	return false;
}

function isSafe(board, row, col, num) {
	// Check if the number is not already present in the current row
	for (let i = 0; i < SIZE; i++) {
		if (board[row][i] === num) {
			return false;
		}
	}

	// Check if the number is not already present in the current column
	for (let i = 0; i < SIZE; i++) {
		if (board[i][col] === num) {
			return false;
		}
	}

	// Check if the number is not already present in the current 3x3 subgrid
	let subgridStartRow = row - row % 3;
	let subgridStartCol = col - col % 3;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[subgridStartRow + i][subgridStartCol + j] === num) {
				return false;
			}
		}
	}

	// If none of the above conditions are violated, it's safe to place the number
	return true;
}


function findEmpty(board) {
	for (let i = 0; i < SIZE; i++) {
		for (let j = 0; j < SIZE; j++) {
			if (board[i][j] == 0) {
				return [i, j]; // Return the row, col where an empty cell is found
			}
		}
	}
	return null; // No empty cell is found
}

function setupPuzzle(puzzle) {
	for (let i = 0; i < SIZE; i++) {
		for (let j = 0; j < SIZE; j++) {
			let cellId = `R${i + 1}C${j + 1}`;
			let puzzleCell = document.getElementById(cellId);
			let value = puzzle[i][j];
			puzzleCell.value = value !== 0 ? value : ''; // Set the value if it's not zero, otherwise set to empty string
			puzzleCell.readOnly = value !== 0; // Set readOnly if the cell is part of the puzzle
			if (value !== 0) {
				puzzleCell.style.color = "#000000"; // Change text color to black for puzzle numbers
			} else {
				puzzleCell.style.color = "#FF7F50"; // Change text color to light gray for empty cells
			}
		}
	}
}


////////////////////////////////////////
// Banner Generation
///////////////////////////////////

document.querySelector(".banner__close").addEventListener("click", function () {
	this.closest(".banner").style.display = "none";
})