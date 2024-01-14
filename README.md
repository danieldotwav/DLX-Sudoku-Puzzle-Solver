# DLX-Sudoku-Puzzle-Solver

This Sudoku Solver project is an interactive web application designed to solve Sudoku puzzles. It combines HTML, CSS, JavaScript, and C++ to create a user-friendly interface for inputting puzzles, a timer to track solving time, and an efficient algorithm to solve the puzzles.

**Click on the link below, enter a Sudoku puzzle, and use the solve feature. The web-based application also supports random puzzle generation, offering three tiers of difficulty**

[Online Sudoku Solver](https://danieldotwav.github.io/DLX-Sudoku-Puzzle-Solver/)

# Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [System Requirements](#system-requirements)
5. [Web-Based Solver](#web-based-solver)
6. [Installation and Setup](#installation-and-setup)
7. [Usage](#usage)
   - [Starting the Puzzle](#starting-the-puzzle)
   - [Using the Solver](#using-the-solver)
   - [Timer Functionality](#timer-functionality)
   - [Resetting the Puzzle](#resetting-the-puzzle)
8. [Technical Implementation](#technical-implementation)
   - [Front-End Development (HTML/CSS/JavaScript)](#front-end-development-html-css-javascript)
   - [Back-End Logic (C++)](#back-end-logic-c)
   - [Integration of Technologies](#integration-of-technologies)
   - [Event Handling and DOM Manipulation](#event-handling-and-dom-manipulation)
   - [Algorithmic Efficiency](#algorithmic-efficiency)
9. [Acknowledgements](#acknowledgements)

![Screenshot 2023-12-19 214241](https://github.com/danieldotwav/DLX-Sudoku-Puzzle-Solver/assets/31682816/597b3228-e0d6-45c2-b625-7d7c0b14969d)

# Introduction

This repository contains the DLX Sudoku Solver, an advanced Sudoku puzzle solver implementing Donald Knuth's Dancing Links Algorithm. This project not only allows for solving traditional Sudoku puzzles but also offers a unique, interactive experience through its web-based interface.

# Features

- **Sophisticated Sudoku Solver**: Employs Donald Knuth's Dancing Links algorithm for efficient puzzle solving.
- **Interactive User Interface**: Easy-to-use web interface for inputting and solving puzzles.
- **Timer Functionality**: Tracks time spent on solving puzzles, enhancing the user experience.
- **Reset and New Puzzle Options**: Allows users to start new puzzles or reset the current puzzle easily.

# Technologies Used

- **HTML**: For structuring the web application's content.
- **CSS**: For styling the application, including the Sudoku grid and buttons.
- **JavaScript**: To add interactivity, manage the timer, and handle user inputs.
- **C++**: Used for implementing the Sudoku solving algorithm.

# System Requirements

- A modern web browser capable of running HTML5, CSS3, and JavaScript.
- A C++ compiler for running the Sudoku solving algorithm.

### Web-Based Solver: 

- **Interactive Solver**: Enter Sudoku puzzles manually or paste pre-filled grids.
- **Automatic Solution**: Solves puzzles instantly and indicates if no solution exists.
- **Modern UI**: Aesthetically pleasing interface with intuitive design and responsive layout.
- **Cross-Platform Compatibility**: Accessible through any modern web browser

# Installation and Setup

1. Clone the repository: `git clone [github.com/danieldotwav/dlxsudokusolver]`.
2. Open the `index.html` file in a web browser to view the application.
3. Compile the C++ code for the Sudoku solver algorithm.

# Usage

## Starting the Puzzle
Input numbers into the Sudoku grid to start a puzzle.

## Using the Solver
Click the "Solve" button to trigger the solving algorithm.

## Timer Functionality
The timer starts automatically when you begin the puzzle and pauses during solving.

## Resetting the Puzzle
Use the "Reset" button to clear the grid and input a new puzzle.
 
# Technical Implementation

## Front-End Development (HTML/CSS/JavaScript)
- **HTML/CSS**: Structured and styled the web application, including the interactive Sudoku grid.
- **JavaScript**: Handles user input, manages the puzzle state, and interacts with the C++ solver.

## Back-End Logic (C++)
- **Dancing Links Algorithm (DLX)**: The core of the Sudoku solver uses Donald Knuth's Dancing Links algorithm, a highly efficient method for solving exact cover problems which in this case is applied to Sudoku. This showcases the application of complex algorithmic concepts in a practical scenario.
- **C++ Implementation**: The DLX algorithm is implemented in C++, known for its efficiency, making the solver both fast and reliable.

## Integration of Technologies
- The application demonstrates a seamless integration of web technologies (HTML, CSS, JavaScript) with advanced C++ programming, highlighting the capability to bridge front-end interactivity with back-end computational power.

## Event Handling and DOM Manipulation
- JavaScript is used for responsive event handling and dynamic DOM manipulation, providing an engaging and interactive user experience.

## Algorithmic Efficiency
- The use of DLX not only emphasizes the project's computational efficiency but also highlights a deep understanding of advanced algorithmic techniques.

# Acknowledgements
- Donald Knuth for the Dancing Links Algorithm
For a detailed explanation of the underlying algorithm, refer to the research paper:
[Efficient Algorithm for Sudoku Solving using Dancing Links](https://arxiv.org/pdf/cs/0011047.pdf).
