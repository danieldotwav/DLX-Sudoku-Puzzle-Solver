#ifndef DANCINGLINKS_H
#define DANCINGLINKS_H

#include <iostream>
#include <vector>
#include <ctime>
#include <sstream>

#include "Node.h"
#include "DLXConstants.h"

class DancingLinks {
private:
	Node dlxHead;
	Node* dlxHeadNode;
	Node* solution[MAX_SOLUTIONS];
	Node* originalValues[MAX_SOLUTIONS];
	bool isSolved;
	int Grid[SIZE][SIZE] = { {0} };
	clock_t timer1, timer2;

public:
	DancingLinks();
	~DancingLinks();

	// Dancing Links Algorithm Implementation
	void coverColumn(Node* column);
	void uncoverColumn(Node* column);
	void search(int n);

	// Build Exact Cover Matrix (each constraint is a column)
	void buildExactCoverMatrix(bool grid[NUM_ROWS][NUM_COLS]);

	// Build Doubly Linked List (from the exact cover matrix)
	void buildDoublyLinkedList(bool grid[NUM_ROWS][NUM_COLS]);

	// Transform the current grid to a list of constraints
	//void transformListToCurrentGrid(int Puzzle[][SIZE]);
	void transformListToCurrentGrid(int sudoku[][SIZE]);

	// Once a solution is found, maps the current solution from the linked list back to the Sudoku grid format
	void mapSolutionToGrid(int sudoku[][SIZE]);

	// Wrapper function to take in a SudokuBoard object and solve it using DLX
	void solveSudoku(int sudoku[][SIZE]);

	void printGridWithBorders(int sudoku[][SIZE]);

	void printMemberGrid() { printGridWithBorders(Grid); }

};

#endif