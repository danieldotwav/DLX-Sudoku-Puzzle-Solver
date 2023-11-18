let timer;
let seconds = 0;

function startTimer() {
	timer = setInterval(function () {
		seconds++;
		document.getElementById('timer').innerHTML = 'Time: ' + formatTime(seconds);
	}, 1000);
}

function stopTimer() {
	clearInterval(timer);
}

function resetTimer() {
	stopTimer();
	seconds = 0;
	document.getElementById('timer').innerHTML = 'Time: 00:00';
}

function formatTime(sec) {
	let hours = Math.floor(sec / 3600);
	let minutes = Math.floor((sec - (hours * 3600)) / 60);
	let seconds = sec - (hours * 3600) - (minutes * 60);

	if (hours < 10) { hours = "0" + hours; }
	if (minutes < 10) { minutes = "0" + minutes; }
	if (seconds < 10) { seconds = "0" + seconds; }
	return hours + ':' + minutes + ':' + seconds;
}

// Start the timer when the page loads
window.onload = startTimer;

var SIZE = 9;
var SIZE_SQUARED = SIZE * SIZE;
var SIZE_SQRT = Math.sqrt(SIZE);
var NUM_ROWS = SIZE * SIZE * SIZE;
var NUM_COLUMNS = 4 * SIZE * SIZE;
function Node() {
	this.up = this;
	this.down = this;
	this.left = this;
	this.right = this;

	this.head = this;
	this.size = 0;
	this.rowID = [0, 0, 0];
}

var solution = [];
var originalValues = [];

var Grid = [];
var matrix = [];
var row = [];

var dlxHeadNode = new Node();

for (var i = 0; i < NUM_COLUMNS; i++) {
	row.push(0);
}
for (var i = 0; i < NUM_ROWS; i++) {
	matrix.push(row.slice());
}
var isSolved = false;

function SolveSudoku() {
	ConstructExactCoverMatrix(matrix);
	ConstructDoublyLinkedList(matrix);

	var Sudoku = [];
	var row_temp = [];
	for (var i = 0; i < SIZE; i++) {
		row_temp.push(0);
	}

	for (i = 0; i < SIZE; i++) {
		Sudoku.push(row_temp.slice());
	}

	var str = "R1C1";
	for (i = 1; i < SIZE + 1; i++) {
		str = str.slice(0, 1) + i + str.slice(2, 3);
		for (var j = 1; j < 10; j++) {
			str = str.slice(0, 3) + j;
			var value = Number(document.getElementById(str).value);
			if (value > 0) {
				Sudoku[i - 1][j - 1] = value;
			}
		}
	}

	TransformListToCurrentGrid(Sudoku);
	Search(0);

	if (!isSolved) {
		document.getElementById("OutcomeText").textContent = "No Solution";
	}
	else {
		document.getElementById("OutcomeText").textContent = "Solved";
	}
	isSolved = false;
}

function CoverColumn(column) {
	column.left.right = column.right;
	column.right.left = column.left;
	for (var node = column.down; node !== column; node = node.down) {
		for (var temp = node.right; temp !== node; temp = temp.right) {
			temp.down.up = temp.up;
			temp.up.down = temp.down;
			temp.head.size--;
		}
	}
}

function UncoverColumn(column) {
	for (var node = column.up; node !== column; node = node.up) {
		for (var temp = node.left; temp !== node; temp = temp.left) {
			temp.head.size++;
			temp.down.up = temp;
			temp.up.down = temp;
		}
	}
	column.left.right = column;
	column.right.left = column;
}

function Search(k) {

	if (dlxHeadNode.right === dlxHeadNode) {
		var row_temp = [];
		for (var u = 0; u < SIZE; u++) {
			row_temp.push(0);
		}
		for (u = 0; u < SIZE; u++) {
			Grid.push(row_temp.slice());
		}
		MapSolutionToGrid(Grid);
		SolvedPuzzleOutput(Grid);
		isSolved = true;
		return;
	}
	if (!isSolved) {
		var column = dlxHeadNode.right;
		for (var temp = column.right; temp.size > -1; temp = temp.right) {
			if (temp.size < column.size) {
				column = temp;
			}
		}
		CoverColumn(column);

		for (temp = column.down; temp !== column; temp = temp.down) {
			solution[k] = temp;
			for (var node = temp.right; node !== temp; node = node.right) {
				CoverColumn(node.head);
			}

			Search(k + 1);

			temp = solution[k];
			solution[k] = null;
			column = temp.head;
			for (node = temp.left; node !== temp; node = node.left) {
				UncoverColumn(node.head);
			}
		}
		UncoverColumn(column);
	}
}

function ConstructExactCoverMatrix(matrix) {
	var j = 0, counter = 0;

	for (var i = 0; i < NUM_ROWS; i++) {
		matrix[i][j] = 1;
		counter++;
		if (counter >= SIZE) {
			j++;
			counter = 0;
		}
	}

	var x = 0;
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

		for (var l = 0; l < SIZE_SQRT; l++) {
			for (var k = 0; k < SIZE_SQRT; k++)
				matrix[x + l * SIZE + k * SIZE_SQUARED][j] = 1;
		}

		var temp = j + 1 - SIZE_SQRT * SIZE_SQUARED;

		if (temp % (SIZE_SQRT * SIZE) === 0)
			x += (SIZE_SQRT - 1) * SIZE_SQUARED + (SIZE_SQRT - 1) * SIZE + 1;
		else if (temp % SIZE === 0)
			x += SIZE * (SIZE_SQRT - 1) + 1;
		else
			x++;
	}
}

function ConstructDoublyLinkedList(matrix) {
	var header = new Node();
	header.size = -1;

	var temp = header;

	for (var i = 0; i < NUM_COLUMNS; i++) {
		var newNode = new Node();
		newNode.left = temp;
		newNode.right = header;
		temp.right = newNode;
		temp = newNode;
	}

	var ID = [0, 1, 1];
	for (i = 0; i < NUM_ROWS; i++) {
		var topNode = header.right;
		var prev = 5;

		if (i !== 0 && i % SIZE_SQUARED === 0) {
			ID = new Array(ID[0] - (SIZE - 1), ID[1] + 1, ID[2] - (SIZE - 1));
		}
		else if (i !== 0 && i % SIZE === 0) {
			ID = new Array(ID[0] - (SIZE - 1), ID[1], ID[2] + 1);
		}
		else {
			ID = new Array(ID[0] + 1, ID[1], ID[2]);
		}

		for (var j = 0; j < NUM_COLUMNS; j++, topNode = topNode.right) {
			if (matrix[i][j] === 1) {
				var tempNode = new Node();
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
function TransformListToCurrentGrid(Puzzle) {
	originalValues = [];
	for (var i = 0; i < SIZE; i++) {
		for (var j = 0; j < SIZE; j++) {
			if (Puzzle[i][j] > 0) {
				loop1:
				for (var column = dlxHeadNode.right; column !== dlxHeadNode; column = column.right) {
					loop2:
					for (temp = column.down; temp !== column; temp = temp.down) {
						if (temp.rowID[0] === Puzzle[i][j] && (temp.rowID[1] - 1) == i && (temp.rowID[2] - 1) == j) {
							break loop1;
						}
					}
				}
				CoverColumn(column);
				originalValues.push(temp);
				for (var node = temp.right; node != temp; node = node.right) {
					CoverColumn(node.head);
				}
			}
		}
	}
}

function MapSolutionToGrid(grid) {
	for (var t = 0; solution[t] != null; t++) {
		grid[solution[t].rowID[1] - 1][solution[t].rowID[2] - 1] = solution[t].rowID[0];
	}
	for (t = 0; originalValues[t] != null; t++) {
		grid[originalValues[t].rowID[1] - 1][originalValues[t].rowID[2] - 1] = originalValues[t].rowID[0];
	}
}
function SolvedPuzzleOutput(Sudoku) {

	str = "R1C1";
	for (var i = 1; i < 10; i++) {
		str = str.slice(0, 1) + i + str.slice(2, 3);
		for (var j = 1; j < 10; j++) {
			str = str.slice(0, 3) + j;
			var puzzleCell = document.getElementById(str);
			if (puzzleCell.value == '')
				puzzleCell.style.color = "#000000";
			puzzleCell.value = Sudoku[i - 1][j - 1];
			puzzleCell.readOnly = true;
		}
	}
}

function ResetGrid() {

	str = "R1C1";
	for (var i = 1; i < SIZE + 1; i++) {
		str = str.slice(0, 1) + i + str.slice(2, 3);
		for (var j = 1; j < SIZE + 1; j++) {
			str = str.slice(0, 3) + j;
			var puzzleCell = document.getElementById(str);
			puzzleCell.readOnly = false;
			puzzleCell.value = "";
			puzzleCell.style.color = "#beb0e9";
		}
	}
	document.getElementById("OutcomeText").innerHTML = "&nbsp";
}

document.addEventListener('DOMContentLoaded', () => {
	const inputs = document.querySelectorAll('#SudokuGrid input[type="text"]');

	inputs.forEach(input => {
		input.addEventListener('keypress', function (e) {
			validateSudokuInput(e, this.value);
		});
	});
});

function validateSudokuInput(e, number) {
	var key = e.key;

	if (!key.match(/[1-9]/) || number.length == 1) {
		e.preventDefault();
		return false;
	}
	return true;
}

////////////////////////////////////////
// Enable Directional Navigation
///////////////////////////////////

function moveFocus(currentId, direction) {
	// Extract the row and column number from the current ID
	var row = parseInt(currentId.substring(1, 2), 10);
	var col = parseInt(currentId.substring(3), 10);

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
	var newId = 'R' + row + 'C' + col;

	// Focus the new cell
	var newCell = document.getElementById(newId);
	if (newCell) {
		newCell.focus();
	}
}

// Add event listeners to all input elements
var inputs = document.querySelectorAll('#SudokuGrid input[type="text"]');
inputs.forEach(function (input) {
	input.addEventListener('keydown', function (e) {
		if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
			moveFocus(this.id, e.key);
			e.preventDefault(); // Prevent default scrolling behavior
		}
	});
});

var solveButton = document.getElementById("SolveButton");
var resetButton = document.getElementById("ResetButton");
solveButton.addEventListener('click', SolveSudoku);
resetButton.addEventListener('click', ResetGrid);