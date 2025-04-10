import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TicTacToe.css';

const TicTacToe = ({ quboCode, log }) => {
  const [gameSetup, setGameSetup] = useState(false);
  const [player1Type, setPlayer1Type] = useState('Human');
  const [player2Type, setPlayer2Type] = useState('CPU');
  const [player1Difficulty, setPlayer1Difficulty] = useState('Easy');
  const [player2Difficulty, setPlayer2Difficulty] = useState('Easy');
  const [unlockedDifficulties, setUnlockedDifficulties] = useState(['Easy']);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [cells, setCells] = useState(Array(9).fill(''));
  const [playerWins, setPlayerWins] = useState({ X: 0, O: 0 });
  const [turnIndicator, setTurnIndicator] = useState('');
  const [gameOver, setGameOver] = useState(false); 
  const [nextGameReady, setNextGameReady] = useState(false); 
  const [gameMode, setGameMode] = useState('Classic'); 
  const [modeSelection, setModeSelection] = useState(true); 
  const [processingMove, setProcessingMove] = useState(false);
  const [quantumError, setQuantumError] = useState(null);

  const MAX_WINS_DISPLAY = 3; 
  const MOVE_DELAY = 1000; 

  // Helper function for server communication
  const sendQuboToServer = async (qubo) => {
    try {
      // Deep clone and sanitize the QUBO object
      const sanitizedQubo = JSON.parse(JSON.stringify(qubo));
      
      // Ensure required fields exist
      sanitizedQubo.variables = sanitizedQubo.variables || {};
      sanitizedQubo.Constraints = sanitizedQubo.Constraints || [];
      sanitizedQubo.Objective = sanitizedQubo.Objective || "0";
      
      // Make sure variables is an object, not an array
      if (Array.isArray(sanitizedQubo.variables)) {
        const varsObj = {};
        sanitizedQubo.variables.forEach((v, i) => {
          varsObj[`x${i}`] = { type: "Binary" };
        });
        sanitizedQubo.variables = varsObj;
      }
      
      // Check if variables are empty
      if (Object.keys(sanitizedQubo.variables).length === 0) {
        throw new Error("No variables defined in QUBO model");
      }
      
      // Ensure all variables have proper type
      Object.keys(sanitizedQubo.variables).forEach(key => {
        if (typeof sanitizedQubo.variables[key] !== 'object') {
          sanitizedQubo.variables[key] = { type: "Binary" };
        }
        if (!sanitizedQubo.variables[key].type) {
          sanitizedQubo.variables[key].type = "Binary";
        }
      });
      
      // Ensure Constraints is an array
      if (!Array.isArray(sanitizedQubo.Constraints)) {
        sanitizedQubo.Constraints = [];
      }
      
      // Ensure Objective is a string
      if (typeof sanitizedQubo.Objective !== 'string') {
        sanitizedQubo.Objective = "0";
      }
      
      // Add timeout to prevent hanging
      const response = await axios.post('http://localhost:8000/quantum', sanitizedQubo, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 seconds timeout
      });
      
      // Check for error in the response
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error("Server communication error:", error);
      
      // Handle the error and provide clear feedback
      let errorDetails = "Unknown error";
      
      if (error.response) {
        errorDetails = `Server error: ${
          error.response.data?.error || JSON.stringify(error.response.data)
        }`;
      } else if (error.request) {
        errorDetails = "Server did not respond. Is the server running?";
      } else {
        errorDetails = error.message;
      }
      
      return {
        status: 'error',
        error: errorDetails
      };
    }
  };

  // Format QUBO data for user-friendly display
  const formatQuboForLog = (quboData, currentBoard) => {
    if (!quboData) {
      return "No QUBO data received from server";
    }
    
    // Use the extractCellWeights helper to get weights
    const variableWeights = extractCellWeights(quboData, null, currentBoard);
    
    // Format the output
    let output = "📊 QUBO Analysis:\n";
    
    // If no weights were found, add a warning
    if (Object.keys(variableWeights).length === 0) {
      output += "\n⚠️ Warning: No valid cell weights could be extracted from the QUBO response.\n";
      return output;
    }
    
    // If server provided explanations, use them
    if (quboData.explanation) {
      if (quboData.explanation.method) {
        output += `\n🔬 Method: ${quboData.explanation.method === "quantum_annealing" ? 
                  "Quantum Annealing" : "Alternative Solution"}\n`;
      }
      
      if (quboData.explanation.highlights && quboData.explanation.highlights.length > 0) {
        output += "\n💡 Insights:\n";
        quboData.explanation.highlights.forEach(highlight => {
          output += `   • ${highlight}\n`;
        });
      }
    }
    
    // Only include available cells that are empty on the board
    const availableCellWeights = {};
    Object.keys(variableWeights).forEach(cell => {
      const cellIdx = parseInt(cell);
      // Check if the cell is valid and empty on the board
      if (!isNaN(cellIdx) && cellIdx >= 0 && cellIdx < 9 && 
          (!currentBoard || currentBoard[cellIdx] === '')) {
        availableCellWeights[cellIdx] = variableWeights[cellIdx];
      }
    });
    
    // Variable weights section
    output += "\n🎯 Cell Weights (higher values are better):\n";
    
    // Check if any weights were found
    if (Object.keys(availableCellWeights).length > 0) {
      // Sort from highest to lowest value
      const sortedVars = Object.keys(availableCellWeights)
        .map(cell => ({ cell: parseInt(cell), weight: availableCellWeights[cell] }))
        .sort((a, b) => b.weight - a.weight); // Sort from highest to lowest
      
      sortedVars.forEach(({ cell, weight }, index) => {
        // Add star to highest value (best) option
        output += `   Cell ${cell}: ${weight.toFixed(1)}${index === 0 ? " ⭐" : ""}\n`;
      });
    }
    
    // Add visual board representation with weights
    output += "\n" + createBoardVisual(variableWeights, currentBoard) + "\n";
    
    // Summarize the QUBO logic - removed the line about interaction terms
    output += "\n🧠 QUBO Strategy Explanation:\n";
    output += "   • The algorithm assigns weights to each empty cell\n";
    output += "   • Higher weight values are preferred (maximization problem)\n";
    
    if (quboData.explanation && quboData.explanation.problem_type) {
      output += `   • Problem type: ${quboData.explanation.problem_type.replace(/_/g, " ")}\n`;
    }
    
    return output;
  };

  // Helper function to explain cell positions in a readable format
  const explainCellPosition = (cell) => {
    const positions = {
      0: "top-left corner",
      1: "top-center edge", 
      2: "top-right corner",
      3: "middle-left edge",
      4: "center",
      5: "middle-right edge",
      6: "bottom-left corner",
      7: "bottom-center edge",
      8: "bottom-right corner"
    };
    
    return positions[cell] || `cell ${cell}`;
  };

// Create a visual board representation with weights
const createBoardVisual = (weights, board) => {
  let visual = "   Board Weights:\n";
  visual += "   ┌─────┬─────┬─────┐\n";
  
  for (let row = 0; row < 3; row++) {
    visual += "   │";
    for (let col = 0; col < 3; col++) {
      const cellIdx = row * 3 + col;
      const cellContent = board[cellIdx];
      
      // Fill the cell with formatted content
      let cellDisplay = "";
      
      if (cellContent !== '') {
        // For X and O, center with spaces on both sides
        cellDisplay = `  ${cellContent}   `;
      } else if (weights[cellIdx] !== undefined) {
        const weightStr = Math.round(weights[cellIdx]).toString();
        
        // Center the weight with appropriate spacing
        switch (weightStr.length) {
          case 1: // Single digit: "  5   "
            cellDisplay = `  ${weightStr}   `;
            break;
          case 2: // Two digits: "  15  "
            cellDisplay = `  ${weightStr}  `;
            break;
          case 3: // Three digits: " 375 "
            cellDisplay = ` ${weightStr} `;
            break;
          default: // Four or more digits, fit as best as possible
            if (weightStr.length === 4) {
              cellDisplay = `${weightStr} `;
            } else {
              cellDisplay = weightStr.substring(0, 5);
            }
            break;
        }
      } else {
        // Empty cell
        cellDisplay = "     ";
      }
      
      // Ensure cell is always exactly 5 characters wide
      while (cellDisplay.length < 5) {
        cellDisplay += " ";
      }
      if (cellDisplay.length > 5) {
        cellDisplay = cellDisplay.substring(0, 5);
      }
      
      visual += `${cellDisplay}│`;
    }
    visual += "\n";
    
    if (row < 2) {
      visual += "   ├─────┼─────┼─────┤\n";
    } else {
      visual += "   └─────┴─────┴─────┘\n";
    }
  }
  
  return visual;
};

// Helper function to extract cell weights from QUBO response
const extractCellWeights = (responseData, availableCells, currentBoard) => {
  const cellWeights = {};

  // Process diagonal terms from QUBO matrix
  if (Object.keys(responseData.qubo || {}).length > 0) {
    Object.keys(responseData.qubo).forEach((key) => {
      try {
        // Look for diagonal terms like ('x0', 'x0')
        const diagMatch = key.match(/\('([a-zA-Z_]+)(\d+)', '([a-zA-Z_]+)(\d+)'\)/);
        if (diagMatch && diagMatch[2] === diagMatch[4]) {
          const cellIdx = parseInt(diagMatch[2]);
          
          if (!isNaN(cellIdx) && (!availableCells || availableCells.includes(cellIdx)) &&
              (!currentBoard || currentBoard[cellIdx] === '')) {
            // Use absolute value of diagonal terms (they're typically negative in QUBO)
            cellWeights[cellIdx] = Math.abs(responseData.qubo[key]);
          }
          return;
        }
        
        // Also try to match single variable patterns like ('x0')
        const singleMatch = key.match(/\('([a-zA-Z_]+)(\d+)'\)/);
        if (singleMatch && singleMatch[2]) {
          const cellIdx = parseInt(singleMatch[2]);
          
          if (!isNaN(cellIdx) && (!availableCells || availableCells.includes(cellIdx)) &&
              (!currentBoard || currentBoard[cellIdx] === '')) {
            // Store absolute value of weight
            cellWeights[cellIdx] = Math.abs(responseData.qubo[key]);
          }
        }
      } catch (parseError) {
        console.error("Error parsing variable name:", parseError, "Key:", key);
      }
    });
  }

  // If sample contains a selected cell (value=1), boost its weight slightly
  if (responseData.sample && Object.keys(cellWeights).length > 0) {
    Object.entries(responseData.sample).forEach(([key, value]) => {
      if (value === 1) {
        const match = key.match(/\d+/);
        if (match) {
          const cellIdx = parseInt(match[0]);
          if (!isNaN(cellIdx) && cellWeights[cellIdx] && 
              (!availableCells || availableCells.includes(cellIdx)) && 
              (!currentBoard || currentBoard[cellIdx] === '')) {
            // Boost the weight of the selected cell slightly (by 1)
            cellWeights[cellIdx] += 1;
          }
        }
      }
    });
  }

  // No fallback - if no weights were extracted, return empty object
  return cellWeights;
};

  // Setup effect for player turns
  useEffect(() => {
    if (gameSetup && !gameOver && !nextGameReady) {
      // Prevent executing move logic if the game is already processing a move
      if (processingMove) return;
      
      // Additional check to make sure there are valid moves
      const availableCells = cells.filter(cell => cell === '').length;
      if (availableCells === 0) return;
      
      if (currentPlayer === 'X' && player1Type === 'CPU') {
        setTurnIndicator('Player 1 (CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          handleCPUMove(player1Difficulty);
          setProcessingMove(false);
        }, MOVE_DELAY);
      } else if (currentPlayer === 'O' && player2Type === 'CPU') {
        setTurnIndicator('Player 2 (CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          handleCPUMove(player2Difficulty);
          setProcessingMove(false);
        }, MOVE_DELAY);
      } else if (currentPlayer === 'O' && player2Type === 'Quantum CPU') { 
        setTurnIndicator('Player 2 (Quantum CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          fetchQuantumMove();
        }, MOVE_DELAY);
      } else if (currentPlayer === 'X' && player1Type === 'Quantum CPU') {
        setTurnIndicator('Player 1 (Quantum CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          fetchQuantumMove();
        }, MOVE_DELAY);
      } else {
        setTurnIndicator(
          `It's ${currentPlayer === 'X' ? 'Player 1' : 'Player 2'}'s turn`
        );
      }
    }
  }, [currentPlayer, gameSetup, gameOver, processingMove, nextGameReady, cells]);

  // Main function to fetch quantum move
  const fetchQuantumMove = async () => {
    // If already processing a move or game is over, exit early
    if (gameOver || nextGameReady) {
      console.log("Quantum move prevented - game state doesn't allow moves");
      setProcessingMove(false);
      return;
    }
    
    setQuantumError(null);
    let availableCells = [];
  
    try {
      // Define available cells first
      availableCells = cells
        .map((cell, index) => (cell === '' ? index : null))
        .filter((index) => index !== null);
  
      if (availableCells.length === 0) {
        log('> No available moves to make\n\n');
        setProcessingMove(false);
        return;
      }
  
      // Basic validation of QUBO code
      if (!quboCode || typeof quboCode !== "string" || quboCode.trim() === '') {
        throw new Error("Invalid or empty Blockly code");
      }
  
      // Check if code contains the required function
      if (!quboCode.includes('createQuboForSingleMove')) {
        throw new Error("Function 'createQuboForSingleMove' not found in your code");
      }
  
      log('> Evaluating your quantum algorithm...\n\n');
  
      // More robust function evaluation
      const functionBody = `
        try {
          ${quboCode}
          return typeof createQuboForSingleMove === 'function' ? createQuboForSingleMove : null;
        } catch (err) {
          console.error("Function evaluation error:", err);
          return null;
        }
      `;
      
      // Create function in a safer way
      const functionCreator = new Function('board', functionBody);
      const createQuboForSingleMove = functionCreator(cells);
  
      if (typeof createQuboForSingleMove !== 'function') {
        throw new Error("Could not create a valid function from your code");
      }
  
      // Get QUBO data
      let qubo;
      try {
        qubo = createQuboForSingleMove(cells);
      } catch (quboError) {
        console.error("Error getting QUBO data:", quboError);
        throw new Error(`Error when running your algorithm: ${quboError.message}`);
      }
  
      // Validate QUBO output
      if (!qubo || typeof qubo !== 'object') {
        throw new Error("Your algorithm must return a valid QUBO object");
      }
  
      // Send QUBO to server
      log("> Sending quantum problem to solver...\n\n");
      const serverResult = await sendQuboToServer(qubo);
      
      // Handle error response from server
      if (serverResult.status === 'error') {
        throw new Error(serverResult.error || "Unknown server error");
      }
  
      const responseData = serverResult.data;
  
      // Check for empty response
      if (!responseData || !responseData.qubo || Object.keys(responseData.qubo).length === 0) {
        throw new Error("Server returned an empty QUBO model");
      }
      
      // Display the formatted QUBO data for educational purposes
      log(`> Received quantum solution\n\n`);
      log(formatQuboForLog(responseData, cells) + "\n\n");
  
      // Extract cell weights from response using our helper function
      const cellWeights = extractCellWeights(responseData, availableCells, cells);
  
      // If no weights were extracted, this is an error that should stop the game
      if (Object.keys(cellWeights).length === 0) {
        throw new Error("No valid weights could be extracted from the QUBO model. Cannot determine optimal move.");
      }
  
      log(`> Analyzed ${Object.keys(cellWeights).length} possible moves\n\n`);
  
      // Find the best move (highest weight)
      let bestCell = availableCells[0];
      let bestWeight = -Infinity;
  
      Object.keys(cellWeights).forEach((cellIdx) => {
        const weight = cellWeights[cellIdx];
        if (weight > bestWeight) {
          bestWeight = weight;
          bestCell = parseInt(cellIdx);
        }
      });
      
      // Make the chosen move
      makeMove(bestCell, currentPlayer);
      log(`> Quantum algorithm selected the ${explainCellPosition(bestCell)}\n\n`);
  
    } catch (error) {
      console.error("Quantum Move Error:", error);
      
      // Single, clear error message instead of multiple logs
      log(`> ⚠️ Quantum Algorithm Error: ${error.message}\n`);
      log(`> Game cannot proceed. Please fix your code and try again.\n\n`);
      
      // Set an error message that will be displayed to the user
      setQuantumError(error.message);
      
      // Reset the game to setup state
      setTimeout(() => {
        resetToSetup();
      }, 1000);
    }
    
    // Always set processing to false at the end
    setProcessingMove(false);
  };

  // Function to handle CPU moves
  const handleCPUMove = (difficulty) => {
    // If game is over or processing, exit early
    if (processingMove || gameOver || nextGameReady) {
      console.log("CPU move prevented - game state doesn't allow moves");
      return;
    }
    
    const availableCells = cells
      .map((cell, index) => (cell === '' ? index : null))
      .filter((index) => index !== null);
  
    if (availableCells.length === 0) {
      console.log("No available cells for CPU move");
      return;
    }
    
    log(`> Available cells for CPU: ${availableCells.join(',')}\n`);
    let chosenCell = null;
  
    if (difficulty === 'Easy') {
      // Easy: Random move
      chosenCell = availableCells[Math.floor(Math.random() * availableCells.length)];
      log(`> CPU (Easy) chose cell: ${chosenCell}\n`);
    } else if (difficulty === 'Medium') {
      // Medium: Check for winning or blocking moves first
      chosenCell = findStrategicMove(availableCells, cells, currentPlayer);
      if (chosenCell === null) {
        chosenCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        log(`> CPU (Medium) chose random move: ${chosenCell}\n`);
      }
    } else if (difficulty === 'Hard') {
      // Hard: Minimax algorithm for optimal move
      chosenCell = getBestMove(cells, currentPlayer);
      log(`> CPU (Hard) chose cell: ${chosenCell}\n`);
    }
  
    makeMove(chosenCell);
  };
  
  // Find strategic moves (win or block)
  const findStrategicMove = (availableCells, board, player) => {
    const opponent = player === 'X' ? 'O' : 'X';
  
    for (let cell of availableCells) {
      let testBoard = [...board];
      testBoard[cell] = player;
      if (checkWinner(testBoard, player)) {
        log(`> CPU found winning move: ${cell}\n`);
        return cell;
      }
  
      testBoard = [...board];
      testBoard[cell] = opponent;
      if (checkWinner(testBoard, opponent)) {
        log(`> CPU found blocking move: ${cell}\n`);
        return cell;
      }
    }
    return null;
  };
  
  // Minimax algorithm for optimal moves
  const getBestMove = (board, player) => {
    const opponent = player === 'X' ? 'O' : 'X';
  
    const minimax = (newBoard, currentPlayer, depth = 0, isMaximizing = true) => {
      const availableCells = newBoard
        .map((cell, index) => (cell === '' ? index : null))
        .filter((index) => index !== null);
  
      if (checkWinner(newBoard, player)) {
        return { score: 10 - depth };
      } else if (checkWinner(newBoard, opponent)) {
        return { score: depth - 10 };
      } else if (availableCells.length === 0) {
        return { score: 0 }; // Draw
      }
  
      // Limit depth for performance
      if (depth > 5) {
        return { score: 0 };
      }
  
      const moves = [];
      for (let cell of availableCells) {
        let testBoard = [...newBoard];
        testBoard[cell] = currentPlayer;
        
        const result = minimax(
          testBoard, 
          currentPlayer === 'X' ? 'O' : 'X',
          depth + 1,
          !isMaximizing
        );
        
        moves.push({ index: cell, score: result.score });
      }
  
      // Find best move
      if (isMaximizing) {
        const bestMove = moves.reduce((best, move) => 
          move.score > best.score ? move : best, { score: -Infinity });
        return bestMove;
      } else {
        const bestMove = moves.reduce((best, move) => 
          move.score < best.score ? move : best, { score: Infinity });
        return bestMove;
      }
    };
  
    return minimax(board, player).index;
  };

  // Function to handle cell clicks
  const handleCellClick = (index) => {
    // Strict check of game state before allowing moves
    if (cells[index] !== '' || !gameSetup || gameOver || processingMove || nextGameReady) {
      return;
    }
  
    if ((currentPlayer === 'X' && player1Type === 'Human') ||
        (currentPlayer === 'O' && player2Type === 'Human')) {
      makeMove(index);
    }
  };

  // Function to make a move
  const makeMove = (index, player = currentPlayer) => {
    // More strict checking to prevent unwanted moves
    if (processingMove || gameOver || nextGameReady || cells[index] !== '') {
      console.log("Move prevented: game state doesn't allow moves", { 
        processingMove, gameOver, nextGameReady, cellOccupied: cells[index] !== '' 
      });
      return;
    }
    
    const newCells = [...cells];
    newCells[index] = player;
    setCells(newCells);
    log(`> Placed ${player} at cell ${index}\n\n`);
  
    // Save game state first
    saveGame({ cells: newCells, currentPlayer: player === 'X' ? 'O' : 'X' });
  
    // Check for win or draw immediately
    if (checkWinner(newCells, player)) {
      // Call handleWin which handles all game over logic
      handleWin(player);
      return;
    } else if (checkDraw(newCells)) {
      setGameOver(true);
      log("> Game ended in a draw\n\n");
      setTimeout(() => {
        alert("It's a draw!");
        prepareNextGame();
      }, 100);
      return;
    }
  
    // Only change player if the game continues
    setCurrentPlayer(player === 'X' ? 'O' : 'X');
  };
  
  // Check for a winner
  const checkWinner = (board, player) => {
    const winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
  
    return winningCombos.some((combo) =>
      combo.every((index) => board[index] === player)
    );
  };  

  // Check for a draw
  const checkDraw = (currentCells) => {
    return currentCells.every(cell => cell !== '');
  };

  // Handle a win
  const handleWin = (player) => {
    // CRITICAL: Check if we're already processing a win to prevent double counting
    if (processingMove || gameOver) {
      console.log("Win already being processed, ignoring duplicate win detection");
      return;
    }
    
    // IMMEDIATELY lock ALL game state 
    setGameOver(true);
    setProcessingMove(true);
    
    // Make a local copy of wins that we'll work with
    const currentWins = {...playerWins};
    currentWins[player] += 1;
    
    // Log for debugging
    console.log(`Player ${player} wins. Current wins:`, currentWins);
    
    // Set win state BEFORE showing any alerts
    setPlayerWins(currentWins);
    
    // Use a longer timeout to make sure state is fully updated
    setTimeout(() => {
      // First alert the win
      alert(`${player} wins!`);
      
      // Then check if series is won based on our local variable (not state)
      if (currentWins[player] >= MAX_WINS_DISPLAY) {
        // Freeze the entire UI completely
        document.body.style.pointerEvents = 'none';
        
        setTimeout(() => {
          alert(`Player ${player} has won the best-of-${MAX_WINS_DISPLAY} series!`);
          
          // Determine unlocks - code similar to before
          let shouldUnlockMedium = false;
          let shouldUnlockHard = false;
          
          // Medium unlock check
          if ((player === 'X' && player1Type === 'Human' && player2Type === 'CPU' && player2Difficulty === 'Easy') ||
              (player === 'O' && player2Type === 'Human' && player1Type === 'CPU' && player1Difficulty === 'Easy') ||
              (player === 'X' && player1Type === 'Quantum CPU' && player2Type === 'CPU' && player2Difficulty === 'Easy') ||
              (player === 'O' && player2Type === 'Quantum CPU' && player1Type === 'CPU' && player1Difficulty === 'Easy')) {
            shouldUnlockMedium = !unlockedDifficulties.includes('Medium');
          }
          
          // Hard unlock check
          if ((player === 'X' && player1Type === 'Human' && player2Type === 'CPU' && player2Difficulty === 'Medium') ||
              (player === 'O' && player2Type === 'Human' && player1Type === 'CPU' && player1Difficulty === 'Medium') ||
              (player === 'X' && player1Type === 'Quantum CPU' && player2Type === 'CPU' && player2Difficulty === 'Medium') ||
              (player === 'O' && player2Type === 'Quantum CPU' && player1Type === 'CPU' && player1Difficulty === 'Medium')) {
            shouldUnlockHard = !unlockedDifficulties.includes('Hard');
          }
          
          // Process unlocks in sequence with separate state updates
          if (shouldUnlockMedium) {
            setUnlockedDifficulties(prev => {
              if (prev.includes('Medium')) return prev;
              alert('Congratulations! "Medium" difficulty unlocked!');
              return [...prev, 'Medium']; 
            });
          } else if (shouldUnlockHard) {
            setUnlockedDifficulties(prev => {
              if (prev.includes('Hard')) return prev;
              alert('Congratulations! "Hard" difficulty unlocked!');
              return [...prev, 'Hard'];
            });
          }
          
          // Wait for UI updates then SYNCHRONOUSLY reset everything
          setTimeout(() => {
            // Clear all state in one atomic operation
            setCells(Array(9).fill(''));
            setCurrentPlayer('X');
            setPlayerWins({ X: 0, O: 0 });
            setGameSetup(false);
            setTurnIndicator('');
            setGameOver(false);
            setNextGameReady(false);
            setProcessingMove(false);
            setQuantumError(null);
            
            // Re-enable UI
            document.body.style.pointerEvents = '';
            
            log('> Reset to setup after series completion\n\n');
          }, 300);
        }, 200);
      } else {
        // Series not over - just prepare for next game
        setNextGameReady(true);
        setProcessingMove(false);
        log("> Game complete. Ready for next round\n\n");
      }
    }, 250);
  };

  // Modify startNextGame to be more atomic
  const startNextGame = () => {
    // Create a completely fresh board first
    const emptyBoard = Array(9).fill('');
    setCells(emptyBoard);
    
    // Use a single timeout to delay all the remaining state changes
    setTimeout(() => {
      // Apply all these changes together
      setCurrentPlayer('X');
      setTurnIndicator("It's Player 1's turn");
      setNextGameReady(false);
      setQuantumError(null);
      
      // Add one final delay before releasing game locks
      setTimeout(() => {
        // CRITICAL: Only release these at the very end, and with enough delay
        setProcessingMove(false);
        setGameOver(false);
        log(`> New game started\n\n`);
      }, 100);
    }, 150);
  };

  // Prepare for next game
  const prepareNextGame = () => {
    setNextGameReady(true);
    // Don't set gameOver to false yet - keep it true until user starts next game
    log("> Game complete. Ready for next round\n\n");
  };

  // Function to handle starting the game after setup
  const startGame = () => {
    // Clear any previous quantum errors
    setQuantumError(null);
    
    setGameSetup(true);
    setCells(Array(9).fill(''));
    setCurrentPlayer('X');
    setTurnIndicator("It's Player 1's turn");
    setGameOver(false);
    setNextGameReady(false);
    setProcessingMove(false);
    log(`> ${gameMode} Mode started\n\n`);
  };

  // Function to handle mode selection
  const handleModeSelection = (mode) => {
    setGameMode(mode);
    setModeSelection(false); // Move to setup screen
    log(`> ${mode} Mode selected\n\n`);
  };

  // Reset to setup screen
  const resetToSetup = () => {
    setCells(Array(9).fill(''));
    setCurrentPlayer('X');
    setGameSetup(false);
    setTurnIndicator('');
    setGameOver(false);
    setNextGameReady(false);
    setPlayerWins({ X: 0, O: 0 });
    setProcessingMove(false);
    setQuantumError(null);
    log('> Reset to setup\n\n');
  };

  // Save game state
  const saveGame = (state) => {
    try {
      localStorage.setItem('ticTacToeGameState', JSON.stringify(state));
      log('> Game state saved\n\n');
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  // Load game state
  const loadGame = () => {
    try {
      const savedState = localStorage.getItem('ticTacToeGameState');
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error('Error loading game state:', error);
      return null;
    }
  };

  // Function to load a saved game
  const handleLoadGame = () => {
    const savedState = loadGame();
    if (savedState) {
      setCells(savedState.cells);
      setCurrentPlayer(savedState.currentPlayer);
      setGameSetup(true);
      setProcessingMove(false);
      log('> Game loaded from saved state\n\n');
    } else {
      alert('No saved game found.');
      log('> No saved game found\n\n');
    }
  };

  // Clear saved game
  const clearSavedGame = () => {
    try {
      localStorage.removeItem('ticTacToeGameState');
      alert('Saved game cleared.');
      log('> Saved game cleared\n\n');
    } catch (error) {
      console.error('Error clearing saved game:', error);
    }
  };

  // Handle player type change
  const handlePlayerTypeChange = (player, newType) => {
    if (player === 'player1') {
      setPlayer1Type(newType);
    } else {
      setPlayer2Type(newType);
    }
    setPlayerWins({ X: 0, O: 0 });
  };

  // Reset to mode selection
  const resetToModeSelection = () => {
    setGameSetup(false);
    setModeSelection(true); // Return to mode selection
    setCells(Array(9).fill('')); // Clear the board
    setCurrentPlayer('X'); // Reset the current player
    setTurnIndicator('');
    setGameOver(false); // Reset game over state
    setNextGameReady(false); // Reset next game state
    setPlayer1Type('Human'); // Reset player types
    setPlayer2Type('CPU');
    setPlayer1Difficulty('Easy');
    setPlayer2Difficulty('Easy');
    setUnlockedDifficulties(['Easy']); // Reset unlocked difficulties
    setPlayerWins({ X: 0, O: 0 }); // Reset the scoreboard
    setProcessingMove(false); // Reset the processing flag
    setQuantumError(null); // Clear quantum errors
    log('> Reset to mode selection\n\n');
  };

  // Render the scoreboard
  const renderScoreboard = (wins, player) => {
    const scoreBoxes = Array(MAX_WINS_DISPLAY)
      .fill(null)
      .map((_, index) => (index < wins ? `[${player}]` : `[]`));
    return <div className="scoreboard-row">{scoreBoxes.join(' ')}</div>;
  };

  // Render difficulty options
  const renderDifficultyOptions = (player) => {
    const playerDifficulty = player === 'player1' ? player1Difficulty : player2Difficulty;
    const handleChange = (e) =>
      player === 'player1'
        ? setPlayer1Difficulty(e.target.value)
        : setPlayer2Difficulty(e.target.value);

    const allowedDifficulties =
      gameMode === 'Game'
        ? unlockedDifficulties // Restrict difficulties based on unlocks
        : ['Easy', 'Medium', 'Hard'];

    return (
      <select value={playerDifficulty} onChange={handleChange}>
        {allowedDifficulties.map((difficulty) => (
          <option key={difficulty} value={difficulty}>
            {difficulty}
          </option>
        ))}
      </select>
    );
  };
  
  // JSX for mode selection
  if (modeSelection) {
    return (
      <div className="container">
        <h1>Tic Tac Toe</h1>
        <div className="mode-selection">
          <h2>Select Game Mode</h2>
          <button onClick={() => handleModeSelection('Classic')}>Classic Mode</button>
          <button onClick={() => handleModeSelection('Game')}>Game Mode</button>
        </div>
      </div>
    );
  }
  
  // Main rendering logic
  return (
    <div className="container">
      <h1>Tic Tac Toe</h1>
  
      {/* Reset to Mode Selection Button */}
      <button
        onClick={resetToModeSelection}
        className="reset-mode-selection-button"
      >
        Return to Mode Selection
      </button>
  
      {gameSetup ? (
        <>
          <div className="scoreboard">
            <div>Player 1 (X): {renderScoreboard(playerWins.X, 'X')}</div>
            <div>Player 2 (O): {renderScoreboard(playerWins.O, 'O')}</div>
          </div>
  
          {/* Display quantum error if one occurred */}
          {quantumError && (
            <div className="error-indicator">
              <span style={{ fontWeight: 'bold' }}>⚠️ Quantum Algorithm Error</span>
              <p>Your quantum algorithm encountered an error: {quantumError}</p>
              <p>Please check your code and fix the issue before trying again.</p>
            </div>
          )}
  
          {/* Ensure we're using the ticboard class here, not board */}
          <div className="ticboard">
            {cells.map((cell, index) => (
              <div
                key={index}
                className="cell"
                onClick={() => handleCellClick(index)}
              >
                {cell}
              </div>
            ))}
          </div>
  
          <p className="turn-indicator">{turnIndicator}</p>
  
          {nextGameReady && (
            <button onClick={startNextGame} className="next-game-button">
              Start Next Game
            </button>
          )}
  
          <div className="controls">
            <button onClick={resetToSetup}>Reset to Setup</button>
            <button onClick={() => saveGame({ cells, currentPlayer })}>Save</button>
            <button onClick={handleLoadGame}>Load</button>
            <button onClick={clearSavedGame}>Clear Save</button>
          </div>
        </>
      ) : (
        <div className="setup">
          <h2>{gameMode} Setup</h2>
          <label>
            Player 1 (X):
            <select value={player1Type} onChange={(e) => handlePlayerTypeChange('player1', e.target.value)}>
              <option value="Human">Human</option>
              <option value="CPU">CPU</option>
              <option value="Quantum CPU">Quantum CPU</option>
            </select>
          </label>
          {player1Type === 'CPU' && (
            <label>
              Player 1 CPU Difficulty:
              {renderDifficultyOptions('player1')}
            </label>
          )}
          <label>
            Player 2 (O):
            <select value={player2Type} onChange={(e) => handlePlayerTypeChange('player2', e.target.value)}>
              <option value="Human">Human</option>
              <option value="CPU">CPU</option>
              <option value="Quantum CPU">Quantum CPU</option>
            </select>
          </label>
          {player2Type === 'CPU' && (
            <label>
              Player 2 CPU Difficulty:
              {renderDifficultyOptions('player2')}
            </label>
          )}
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;