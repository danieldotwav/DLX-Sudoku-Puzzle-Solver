#include "DancingLinks.h"

// Constructor
DancingLinks::DancingLinks() : dlxHeadNode(&dlxHead), isSolved(false), solution{}, originalValues{} {
	dlxHead.left = &dlxHead;
	dlxHead.right = &dlxHead;
	dlxHead.up = &dlxHead;
	dlxHead.down = &dlxHead;
	dlxHead.head = &dlxHead;
	dlxHead.size = -1;
}

// Destructor
DancingLinks::~DancingLinks() {
	for (int i = 0; i < MAX_SOLUTIONS; i++) {
		delete solution[i];
		solution[i] = nullptr;

		delete originalValues[i];
		originalValues[i] = nullptr;
	}
}

void DancingLinks::coverColumn(Node* column) {
	column->left->right = column->right; // Disconnects column from left neighbor
	column->right->left = column->left; // Disconnexts column form right neighbor

	// For each row, disconnect row from neighbor's nodes vertically and decrement the size of its header
	for (Node* row = column->down; row != column; row = row->down) {
		for (Node* node = row->right; node != row; node = node->right) {
			node->up->down = node->down;
			node->down->up = node->up;
			node->head->size--;
		}
	}
}

void DancingLinks::uncoverColumn(Node* column) {
	for (Node* node = column->up; node != column; node = node->up) {
		for (Node* row = node->left; row != node; row = row->left) {
			row->head->size++;
			row->up->down = row;
			row->down->up = row;
		}
	}

	column->left->right = column;
	column->right->left = column;
}

// Here, n represents the current depth of the search, or number of decisions that have been made (number of rows selected)
// When a row is chosen (i.e., a decision is made to include a specific row in the solution), n is incremented before the next recursive call to search.
// When backtracking occurs (i.e., a decision is found to lead to no solution and needs to be reversed), n is effectively decremented since the function returns to the previous recursive call.
void DancingLinks::search(int n) {
	if (dlxHeadNode->right == dlxHeadNode) {
		timer2 = clock() - timer1;

		mapSolutionToGrid(Grid);

		std::cout << "Time Elapsed: " << static_cast<float>(timer2) / CLOCKS_PER_SEC << " seconds.\n\n";
		timer1 = clock();
		isSolved = true;
		return;
	}

	// Here, we choose the column with the smallest size to minimize the branching factor
	// This heuristic speeds up the search since columns with fewer 1s have fewer possibilities to explore
	Node* columnNode = dlxHeadNode->right;
	for (Node* temp = columnNode->right; temp != dlxHeadNode; temp = temp->right) {
		if (temp->size < columnNode->size) {
			columnNode = temp;
		}
	}

	coverColumn(columnNode);
	for (Node* temp = columnNode->down; temp != columnNode; temp = temp->down) {
		solution[n] = temp;
		for (Node* node = temp->right; node != temp; node = node->right) {
			coverColumn(node->head);
		}

		search(n + 1);

		if (isSolved) {
			return;
		}

		temp = solution[n];
		solution[n] = nullptr;
		columnNode = temp->head;
		for (Node* node = temp->left; node != temp; node = node->left) {
			uncoverColumn(node->head);
		}
	}

	uncoverColumn(columnNode);
}

// Constructs a binary matrix where each possible number placement is represented with 1's
void DancingLinks::buildExactCoverMatrix(bool grid[NUM_ROWS][NUM_COLS]) {
	// Row Constraint: Each row has at least one 'true' value
	int j{ 0 };
	int count{ 0 };

	for (int i = 0; i < NUM_ROWS; i++) {
		count++;
		grid[i][j] = true;
		if (count >= SIZE) {
			count = 0;
			j++;
		}
	}

	// Print for testing
	/*
	std::cout << "\nExact Cover Matrix After Constraint 1\n";
	for (int i = 0; i < NUM_ROWS; i++) {
		for (int j = 0; j < NUM_COLS; j++) {
			std::cout << grid[i][j] ;
		}
		std::cout << std::endl;
	}
	std::cout << std::endl;
	*/

	// Column Constraints
	int x{ 0 };
	count = 1;

	for (j = SIZE_SQUARED; j < 2 * SIZE_SQUARED; j++) {
		for (int i = x; i < count * SIZE_SQUARED; i += SIZE) {
			grid[i][j] = true;
		}

		if ((j + 1) % SIZE == 0) { // check for multiple of 9 (shift value of 81 by 1)
			x = count * SIZE_SQUARED;
			count++;
		}
		else {
			x++;
		}
	}

	// Print for testing
	/*
	std::cout << "\nExact Cover Matrix After Constraint 2\n";
	for (int i = 0; i < NUM_ROWS; i++) {
		for (int j = 0; j < NUM_COLS; j++) {
			std::cout << grid[i][j];
		}
		std::cout << std::endl;
	}
	std::cout << std::endl;
	*/

	// Constraint 3: Each number can only appear once in each column
	j = 2 * SIZE_SQUARED;

	for (int i = 0; i < NUM_ROWS; i++) {
		grid[i][j] = true;
		j++;

		if (j >= SIZE_SQRT * SIZE_SQUARED) {
			j = 2 * SIZE_SQUARED;
		}
	}

	// Print for testing
	/*
	std::cout << "\nExact Cover Matrix After Constraint 3\n";
	for (int i = 0; i < NUM_ROWS; i++) {
		for (int j = 0; j < NUM_COLS; j++) {
			std::cout << grid[i][j];
		}
		std::cout << std::endl;
	}
	std::cout << std::endl;
	*/


	// Constraint 4: Each number can only appear once in each subgrid
	x = 0;

	for (j = SIZE_SQRT * SIZE_SQUARED; j < NUM_COLS; j++) {
		for (int box = 0; box < SIZE_SQRT; box++) {
			for (int cell = 0; cell < SIZE_SQRT; cell++) {
				grid[x + box * SIZE + cell * SIZE_SQUARED][j] = true;
			}
		}

		int temp = j + 1 - SIZE_SQRT * SIZE_SQUARED;
		if (temp % (int)(SIZE_SQRT * SIZE) == 0) {
			x += (SIZE_SQRT - 1) * SIZE_SQUARED + (SIZE_SQRT - 1) * SIZE + 1;
		}
		else if (temp % SIZE == 0) {
			x += SIZE * (SIZE_SQRT - 1) + 1;
		}
		else {
			x++;
		}
	}

	// Print for testing
	/*
	std::cout << "\nExact Cover Matrix After Constraint 4\n";
	for (int i = 0; i < NUM_ROWS; i++) {
		for (int j = 0; j < NUM_COLS; j++) {
			std::cout << grid[i][j];
		}
		std::cout << std::endl;
	}
	std::cout << std::endl;
	*/

}

// Constructs a toroidal doubly linked list from a binary matrix.
// Creates column header nodes and links all nodes that represent 1s in the matrix
void DancingLinks::buildDoublyLinkedList(bool grid[NUM_ROWS][NUM_COLS]) {
	// Importantly, the header node acts as the entry point. Simplifies insertion and removal operations. It is the only node that is not part of a column or row.
	Node* header = new Node;
	header->left = header;
	header->right = header;
	header->down = header;
	header->up = header;
	header->size = -1;
	header->head = header;
	Node* temp = header;

	// Create column nodes
	for (int i = 0; i < NUM_COLS; i++) {
		Node* newNode = new Node;
		newNode->size = 0;
		newNode->up = newNode;
		newNode->down = newNode;
		newNode->head = newNode;
		newNode->right = header;
		newNode->left = temp;
		temp->right = newNode;
		temp = newNode;
	}

	int ID[3] = { 0, 1, 1 };

	for (int i = 0; i < NUM_ROWS; i++) {
		Node* top = header->right;
		Node* prev = nullptr;

		if ((i != 0) && (i % SIZE_SQUARED == 0)) {
			ID[0] -= SIZE - 1;
			ID[1]++;
			ID[2] -= SIZE - 1;
		}
		else if (i != 0 && (i % SIZE == 0)) {
			ID[0] -= SIZE - 1;
			ID[2]++;
		}
		else {
			ID[0]++;
		}

		for (int j = 0; j < NUM_COLS; j++, top = top->right) {
			if (grid[i][j]) {
				Node* newNode = new Node;
				newNode->rowID[0] = ID[0];
				newNode->rowID[1] = ID[1];
				newNode->rowID[2] = ID[2];

				if (prev == nullptr) {
					prev = newNode;
					prev->right = newNode;
				}

				newNode->left = prev;
				newNode->right = prev->right;
				newNode->right->left = newNode;
				prev->right = newNode;
				newNode->head = top;
				newNode->down = top;
				newNode->up = top->up;
				top->up->down = newNode;
				top->size++;
				top->up = newNode;

				if (top->down == top) {
					top->down = newNode;
				}

				prev = newNode;
			}
		}
	}

	dlxHeadNode = header;
}

void DancingLinks::transformListToCurrentGrid(int sudoku[][SIZE]) {
	int index = 0;
	bool found = false; // Flag to indicate if the condition to break the loops is met

	for (int i = 0; i < SIZE; i++) {
		for (int j = 0; j < SIZE; j++) {
			if (sudoku[i][j] != 0) {
				Node* columnNode = nullptr;
				Node* temp = nullptr;

				for (columnNode = dlxHeadNode->right; columnNode != dlxHeadNode; columnNode = columnNode->right) {
					for (temp = columnNode->down; temp != columnNode; temp = temp->down) {
						if (temp->rowID[0] == sudoku[i][j] && (temp->rowID[1] - 1) == i && (temp->rowID[2] - 1) == j) {
							found = true; // Set the flag to true as we found the condition
							break; // Break out of the innermost loop
						}
					}
					if (found) {
						break; // Break out of the second level loop
					}
				}

				if (found) {
					coverColumn(columnNode);
					originalValues[index] = temp;
					index++;

					for (Node* node = temp->right; node != temp; node = node->right) {
						coverColumn(node->head);
					}

					found = false; // Reset the flag for the next iteration
				}
			}
		}
	}
}

void DancingLinks::mapSolutionToGrid(int sudoku[][SIZE]) {
	for (int i = 0; solution[i] != nullptr; i++) {
		sudoku[solution[i]->rowID[1] - 1][solution[i]->rowID[2] - 1] = solution[i]->rowID[0];
	}
	for (int i = 0; originalValues[i] != nullptr; i++) {
		sudoku[originalValues[i]->rowID[1] - 1][originalValues[i]->rowID[2] - 1] = originalValues[i]->rowID[0];
	}
}

void DancingLinks::solveSudoku(int sudoku[][SIZE]) {
	bool grid[NUM_ROWS][NUM_COLS] = { {0} };
	timer1 = clock();

	// Set member grid to sudoku grid
	for (int i = 0; i < SIZE; i++) {
		for (int j = 0; j < SIZE; j++) {
			Grid[i][j] = sudoku[i][j];
		}
	}

	buildExactCoverMatrix(grid);
	buildDoublyLinkedList(grid);
	transformListToCurrentGrid(sudoku);

	// search grid for solutions
	search(0);

	// Map solution to grid if a solution is found
	mapSolutionToGrid(Grid);

	// Copy solved state from grid to sudoku
	for (int i = 0; i < SIZE; i++) {
		for (int j = 0; j < SIZE; j++) {
			sudoku[i][j] = Grid[i][j];
		}
	}

	if (isSolved) {

	}
	else {
		std::cout << "\n\nNo solution found for the given board\n\n";
	}

	isSolved = false;
}

void DancingLinks::printGridWithBorders(int sudoku[][SIZE]) {
	std::string borderEXT = "+", borderINT = "|";
	int counter = 1;
	int additional = 0;

	if (SIZE > 9) {
		additional = SIZE;
	}

	for (int i = 0; i < ((SIZE + SIZE_SQRT - 1) * 2 + additional + 1); i++) {
		borderEXT += '-';

		if (i > 0 && i % ((SIZE_SQRT * 2 + SIZE_SQRT * (SIZE > 9) + 1) * counter + counter - 1) == 0) {
			borderINT += '+';
			counter++;
		}
		else {
			borderINT += '-';
		}
	}

	borderEXT += '+';
	borderINT += "|";

	std::cout << borderEXT << std::endl;
	for (int i = 0; i < SIZE; i++) {
		std::cout << "| ";
		for (int j = 0; j < SIZE; j++) {
			if (sudoku[i][j] == 0) {
				std::cout << ". ";
			}
			else {
				std::cout << sudoku[i][j] << " ";
			}
			if (additional > 0 && sudoku[i][j] < 10) {
				std::cout << " ";
			}
			if ((j + 1) % SIZE_SQRT == 0) {
				std::cout << "| ";
			}
		}
		std::cout << std::endl;
		if ((i + 1) % SIZE_SQRT == 0 && (i + 1) < SIZE) {
			std::cout << borderINT << std::endl;
		}
	}
	std::cout << borderEXT << std::endl << std::endl;
}