#ifndef NODE_H
#define NODE_H

class Node {
public:
	Node() : up(nullptr), down(nullptr), left(nullptr),
		right(nullptr), head(nullptr), size(0), rowID{ 0, 0, 0 } {};

	Node* up;
	Node* down;
	Node* left;
	Node* right;
	Node* head;

	int size; // column header
	int rowID[3]; // identifies to map solutions to sudoku grid
};

#endif