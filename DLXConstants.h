#ifndef DLXCONSTANTS_H
#define DLXCONSTANTS_H

#include <cmath>

const int SIZE = 9; // Size of sudoku grid
const int SIZE_SQUARED = SIZE * SIZE; // Total number of cells in sudoku grid
const int SIZE_SQRT = sqrt(SIZE); // Size of the smaller sub-grids in the sudoku grid
const int NUM_ROWS = SIZE * SIZE * SIZE; // Number of rows in the exact cover matrix
const int NUM_COLS = SIZE * SIZE * 4; // Number of columns in the exact cover matrix
const int MAX_SOLUTIONS = 1000; // Maximum number of solutions to find

#endif