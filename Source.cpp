#include <iomanip>
#include <cstdlib>
#include "DancingLinks.h"
using namespace std;

const int TOTAL_WIDTH = 50;
const int PADDING_CHAR = '-';

enum MENU { RANDOM = 1, BACKTRACKING, DANCINGLINKS, EXIT };
enum STATES { UNASSIGNED };

// Type alias for a 2D vector of integers and 2D array (9x9 Sudoku board)
using VectorSudokuBoard = vector<vector<int>>;
using ArraySudokuBoard = int[SIZE][SIZE];

// Prototypes
VectorSudokuBoard createDifficultSudokuBoard();
VectorSudokuBoard createRandomSudokuBoard(int arrayBoard[][SIZE]);

bool solveSudokuUsingBacktracking(VectorSudokuBoard& board);
int findEmpty(const VectorSudokuBoard& board, int& row, int& col);
bool isSafe(const VectorSudokuBoard& board, int row, int col, int num);
void printCenteredTitle(string title, int total_width, char padding_char);
void clearBoards(VectorSudokuBoard vectorBoard, ArraySudokuBoard arrayBoard);
void purgeInputErrors(string error_mess);
void printArrayGridWithBorders(int vectorBoard[][SIZE]);
void printVectorGridWithBorders(vector<vector<int>> vectorBoard);

int main() {

    cout << "Welcome\n\n" <<
        "The purpose of this project is to demonstrate the efficacy of different approaches to the exact cover problem.\n"
        "For a standard 9x9 Sudoku Board, the exact cover problem is to find a solution that satisfies the following constraints:\n\n"
        "1. Cell Constraint: Each cell must contain exactly one number\n"
        "2. Row Constraint: Each number must appear exactly once in each row\n"
        "3. Column Constraint: Each number must appear exactly once in each column\n"
        "4. Box Constraint: Each number must appear exactly once in each 3x3 subgrid\n\n";
    

    printCenteredTitle("Backtracking Algorithm", TOTAL_WIDTH, PADDING_CHAR);
    cout << "Time Complexity:   O(9^(N*N)) --> For every unassigned index, there are 9 possible options\n"
        "Space Complexity:  O(N*N)\n\n";

    printCenteredTitle("Dancing Links Algorithm", TOTAL_WIDTH, PADDING_CHAR);
    cout << "Time Complexity:   O(N!) -------> At worst, the algorithm attempts every permutation of rows\n"
        "Space Complexity:  O(N*N)\n\n";

    printCenteredTitle("HOWEVER", TOTAL_WIDTH, PADDING_CHAR);
    cout << "Sudoku boards are typically sparse, meaning that most cells are empty.\n"
        "This means that the time complexity of the Dancing Links algorithm is much closer to O(N^2), as we will soon see.\n\n";

    int selection{ 0 };
    VectorSudokuBoard vectorBoard;
    ArraySudokuBoard arrayBoard = { {0} };
    DancingLinks dlx;

    do {
        cout << "MENU\nSelect one of the following:\n"
            "1. GENERATE RANDOM SUDOKU BOARD\n"
            "2. SOLVE USING BACKTRACKING\n"
            "3. SOLVE USING DANCING LINKS\n"
            "4. EXIT\n"
            "Selection: ";
        cin >> selection;

        switch (selection) {
        case RANDOM:
            // Clear boards before randomly generating values
            clearBoards(vectorBoard, arrayBoard);
            vectorBoard = createRandomSudokuBoard(arrayBoard);

            printCenteredTitle("Randomly Generated Sudoku Board", TOTAL_WIDTH, PADDING_CHAR);
            /*
            cout << "Initial Vector Sudoku Board:\n";
            printVectorGridWithBorders(vectorBoard);
            */

            cout << "Initial Array Sudoku Board:\n";
            printArrayGridWithBorders(arrayBoard);
            break;
            
        case BACKTRACKING:
            if (solveSudokuUsingBacktracking(vectorBoard)) {
                printCenteredTitle("Backtracking Algorithm", TOTAL_WIDTH, PADDING_CHAR);
                cout << "\nSolved Vector Sudoku Board:\n";
                printVectorGridWithBorders(vectorBoard);
            }
            else {
                cout << "\nNo solution exists for the given Sudoku board." << endl;
            }
            break;
        case DANCINGLINKS:
            printCenteredTitle("Dancing Links (DLX) Algorithm", TOTAL_WIDTH, PADDING_CHAR);
            /*
            cout << "Array Board Before passing to dlx:\n";
            printArrayGridWithBorders(arrayBoard);
            */
            dlx.solveSudoku(arrayBoard);
            
            cout << "Solved Array Sudoku Board:\n";
            printArrayGridWithBorders(arrayBoard);
            break;
        case EXIT:
            cout << "Terminating Program\n\n";
            break;
        default:
            purgeInputErrors("Invalid selection");
        }
    } while (selection != EXIT);

    return 0;
}

// Returns an example of a difficult-to-brute-force Sudoku board
VectorSudokuBoard createDifficultSudokuBoard() {
    VectorSudokuBoard board = {
        {8, 0, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 3, 6, 0, 0, 0, 0, 0},
        {0, 7, 0, 0, 9, 0, 2, 0, 0},
        {0, 5, 0, 0, 0, 7, 0, 0, 0},
        {0, 0, 0, 0, 4, 5, 7, 0, 0},
        {0, 0, 0, 1, 0, 0, 0, 3, 0},
        {0, 0, 1, 0, 0, 0, 0, 6, 8},
        {0, 0, 8, 5, 0, 0, 0, 1, 0},
        {0, 9, 0, 0, 0, 0, 4, 0, 0}
    };

    return board;
}

// Generates a random 9x9 Sudoku board
VectorSudokuBoard createRandomSudokuBoard(int arrayBoard[][SIZE]) {
    // Seed the random number generator with the current time
    srand(static_cast<unsigned>(time(nullptr)));

    // Initialize an empty 9x9 Sudoku board with zeros
    VectorSudokuBoard board = VectorSudokuBoard(9, vector<int>(9, 0));


    // Fill a random number of cells with valid numbers (between 1 and 9)
    for (int i = 0; i < 20; i++) {  // Adjust the number of filled cells as needed
        int row = rand() % 9;
        int col = rand() % 9;
        int num = rand() % 9 + 1;  // Random number between 1 and 9
        if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            arrayBoard[row][col] = num;
        }
    }

    return board;
}

// Uses backtracking to solve the Sudoku board
bool solveSudokuUsingBacktracking(VectorSudokuBoard& board) {
    int row, col;
    clock_t timer1;

    // If there are no unassigned locations, we are done
    if (!findEmpty(board, row, col))
        return true; // success!

    // Consider digits 1 to 9
    for (int num = 1; num <= 9; num++) {
        // Check if it looks promising
        if (isSafe(board, row, col, num)) {
            // Make tentative assignment
            board[row][col] = num;

            // Return, if success
            if (solveSudokuUsingBacktracking(board)) {
                return true;
            }
            // Failure, unmake & try again
            board[row][col] = UNASSIGNED;
        }
    }
    // This triggers backtracking
    return false;
}

// Searches the Sudoku board to find an empty cell
int findEmpty(const VectorSudokuBoard& board, int& row, int& col) {
    for (row = 0; row < 9; row++) {
        for (col = 0; col < 9; col++) {
            if (board[row][col] == 0) {
                return 1;
            }
        }
    }
    return 0;
}

// Checks if it's safe to place a number in the given cell
bool isSafe(const VectorSudokuBoard& board, int row, int col, int num) {
    // Check if the number is not already present in the current row
    for (int i = 0; i < 9; i++) {
        if (board[row][i] == num) {
            return false;
        }
    }

    // Check if the number is not already present in the current column
    for (int i = 0; i < 9; i++) {
        if (board[i][col] == num) {
            return false;
        }
    }

    // Check if the number is not already present in the current 3x3 subgrid
    auto subgridStartRow = static_cast<vector<vector<int>>::size_type> (row) - (row % 3);
    auto subgridStartCol = static_cast<vector<vector<int>>::size_type> (col) - (col % 3);
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            if (board[subgridStartRow + i][subgridStartCol + j] == num) {
                return false;
            }
        }
    }
    // If none of the above conditions are violated, it's safe to place the number
    return true;
}

void printCenteredTitle(string title, int total_width, char padding_char) {
    int title_length = title.length();

    string truncatedTitle = title;
    if (title_length > total_width) {
        truncatedTitle = title.substr(0, total_width);
        title_length = truncatedTitle.length();
    }

    // Determine Padding
    int num_padding_chars = (total_width - title_length) / 2;
    string padding(num_padding_chars, padding_char);

    // Ensure symmetry by checking for odd total width and even title length
    bool needs_extra_padding = (total_width % 2 != 0) && (title_length % 2 == 0);

    // Use std::string for efficient string concatenation
    string output = "\n";

    // Append padding and title to output
    output += padding;
    if (needs_extra_padding) {
        output += padding_char;
    }

    // Check for non-empty title
    if (title_length > 0) {
        output += " " + truncatedTitle + " " + padding;
    }
    else {
        output += std::string(2, padding_char) + padding;
    }
    cout << output << "\n\n";
}

void clearBoards(VectorSudokuBoard vectorBoard, ArraySudokuBoard arrayBoard) {
    vectorBoard.clear();

    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            arrayBoard[i][j] = 0;
        }
    }
}

void purgeInputErrors(string error_mess) {
    cout << "ERROR: " << error_mess << "\n";
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

void printArrayGridWithBorders(int sudoku[][SIZE]) {
    string borderEXT = "+", borderINT = "|";
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

    cout << borderEXT << endl;
    for (int i = 0; i < SIZE; i++) {
        cout << "| ";
        for (int j = 0; j < SIZE; j++) {
            if (sudoku[i][j] == 0) {
                cout << ". ";
            }
            else {
                cout << sudoku[i][j] << " ";
            }
            if (additional > 0 && sudoku[i][j] < 10) {
                cout << " ";
            }
            if ((j + 1) % SIZE_SQRT == 0) {
                cout << "| ";
            }
        }
        cout << endl;
        if ((i + 1) % SIZE_SQRT == 0 && (i + 1) < SIZE) {
            cout << borderINT << endl;
        }
    }
    cout << borderEXT << endl << endl;
}

void printVectorGridWithBorders(vector<vector<int>> vectorBoard) {
    string borderEXT = "+", borderINT = "|";
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

    cout << borderEXT << endl;
    for (int i = 0; i < SIZE; i++) {
        cout << "| ";
        for (int j = 0; j < SIZE; j++) {
            if (vectorBoard[i][j] == 0) {
                cout << ". ";
            }
            else {
                cout << vectorBoard[i][j] << " ";
            }
            if (additional > 0 && vectorBoard[i][j] < 10) {
                cout << " ";
            }
            if ((j + 1) % SIZE_SQRT == 0) {
                cout << "| ";
            }
        }
        cout << endl;
        if ((i + 1) % SIZE_SQRT == 0 && (i + 1) < SIZE) {
            cout << borderINT << endl;
        }
    }
    cout << borderEXT << endl << endl;
}