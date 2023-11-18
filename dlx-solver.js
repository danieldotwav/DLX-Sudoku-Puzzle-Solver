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
		document.getElementById("OutcomeText").textContent = "Invalid Sudoku";
	}
	else {
		document.getElementById("OutcomeText").textContent = "Solved";
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

	for (let i = 0; i < NUM_ROWS; i++) {
		matrix[i][j] = 1;
		counter++;
		if (counter >= SIZE) {
			j++;
			counter = 0;
		}
	}

	let x = 0;
	counter = 1;
	for (j = SIZE_SQUARED; j < 2 * SIZE_SQUARED; j++) {
		for (i = x; i < counter * SIZE_SQUARED; i += SIZE)
			matrix[i][j] = 1;

		if ((j + 1) % SIZE === 0) {
			x = counter * SIZE_SQUARED;
			counter++;
		}
		else
			x++;
	}

	j = 2 * SIZE_SQUARED;
	for (i = 0; i < NUM_ROWS; i++) {
		matrix[i][j] = 1;
		j++;
		if (j >= SIZE_SQRT * SIZE_SQUARED)
			j = 2 * SIZE_SQUARED;
	}

	x = 0;
	for (j = SIZE_SQRT * SIZE_SQUARED; j < NUM_COLUMNS; j++) {

		for (let l = 0; l < SIZE_SQRT; l++) {
			for (let k = 0; k < SIZE_SQRT; k++)
				matrix[x + l * SIZE + k * SIZE_SQUARED][j] = 1;
		}

		let temp = j + 1 - SIZE_SQRT * SIZE_SQUARED;

		if (temp % (SIZE_SQRT * SIZE) === 0)
			x += (SIZE_SQRT - 1) * SIZE_SQUARED + (SIZE_SQRT - 1) * SIZE + 1;
		else if (temp % SIZE === 0)
			x += SIZE * (SIZE_SQRT - 1) + 1;
		else
			x++;
	}
}

function constructDoublyLinkedList(matrix) {
	let header = new Node();
	header.size = -1;

	let temp = header;

	for (let i = 0; i < NUM_COLUMNS; i++) {
		let newNode = new Node();
		newNode.left = temp;
		newNode.right = header;
		temp.right = newNode;
		temp = newNode;
	}

	let ID = [0, 1, 1];
	for (i = 0; i < NUM_ROWS; i++) {
		let topNode = header.right;
		let prev = 5;

		if (i !== 0 && i % SIZE_SQUARED === 0) {
			ID = new Array(ID[0] - (SIZE - 1), ID[1] + 1, ID[2] - (SIZE - 1));
		}
		else if (i !== 0 && i % SIZE === 0) {
			ID = new Array(ID[0] - (SIZE - 1), ID[1], ID[2] + 1);
		}
		else {
			ID = new Array(ID[0] + 1, ID[1], ID[2]);
		}

		for (let j = 0; j < NUM_COLUMNS; j++, topNode = topNode.right) {
			if (matrix[i][j] === 1) {
				let tempNode = new Node();
				tempNode.rowID = ID;
				if (prev === 5) {
					prev = tempNode;
				}

				tempNode.left = prev;
				tempNode.right = prev.right;
				tempNode.right.left = tempNode;
				prev.right = tempNode;
				tempNode.head = topNode;
				tempNode.down = topNode;
				tempNode.up = topNode.up;
				topNode.up.down = tempNode;
				topNode.up = tempNode;

				if (topNode.size === 0) {
					topNode.down = tempNode;
				}
				topNode.size++;
				prev = tempNode;
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
				loop1:
				for (column = dlxHeadNode.right; column !== dlxHeadNode; column = column.right) {
					loop2:
					for (temp = column.down; temp !== column; temp = temp.down) {
						if (temp.rowID[0] === Puzzle[i][j] && (temp.rowID[1] - 1) == i && (temp.rowID[2] - 1) == j) {
							break loop1;
						}
					}
				}
				coverColumn(column);
				originalValues.push(temp);
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
			puzzleCell.style.color = "#beb0e9";
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


