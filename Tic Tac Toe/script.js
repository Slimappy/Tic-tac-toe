document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const vsComputerBtn = document.getElementById('vs-computer-btn');
    const twoPlayersBtn = document.getElementById('two-players-btn');
    const playerNamesDiv = document.getElementById('player-names');
    const player1NameInput = document.getElementById('player1-name');
    const player2NameInput = document.getElementById('player2-name');
    const startGameBtn = document.getElementById('start-game-btn');
    const statusText = document.getElementById('status-text');
    const gameBoard = document.getElementById('game-board');
    const cells = document.querySelectorAll('.cell');
    const restartBtn = document.getElementById('restart-btn');
    // ADDED: New elements
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const winSound = document.getElementById('win-sound');
    const winSoundFallback = document.getElementById('win-sound-fallback');


    // --- Game State ---
    let gameActive = false;
    let currentPlayer = 'X';
    let gameMode = ''; // 'vs-computer' or '2-players'
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let playerNames = { X: 'Player 1', O: 'Player 2' };

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // --- Functions ---
    const playWinSound = () => {
        // A common issue is that browsers might block autoplay.
        // We try to play the first sound, and if it fails, play the second.
        winSound.play().catch(() => {
            winSoundFallback.play().catch(e => console.error("Could not play sound:", e));
        });
    }

    const handleResultValidation = () => {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const a = gameState[winCondition[0]];
            const b = gameState[winCondition[1]];
            const c = gameState[winCondition[2]];
            if (a === '' || b === '' || c === '') continue;
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusText.textContent = `${playerNames[currentPlayer]} has won! 🎉`;
            gameActive = false;
            playWinSound(); // UPDATED: Play sound on win
            return;
        }

        if (!gameState.includes("")) {
            statusText.textContent = `Game ended in a draw! 🤝`;
            gameActive = false;
            return;
        }

        handlePlayerChange();
    };

    const handlePlayerChange = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusText.textContent = `It's ${playerNames[currentPlayer]}'s turn`;

        if (gameMode === 'vs-computer' && currentPlayer === 'O' && gameActive) {
            statusText.textContent = `Computer is thinking...`;
            setTimeout(computerMove, 700);
        }
    };

    const handleCellClick = (clickedCellEvent) => {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        if (gameState[clickedCellIndex] !== "" || !gameActive) return;
        
        if (gameMode === 'vs-computer' && currentPlayer === 'O') return;

        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());

        handleResultValidation();
    };

    const restartGame = () => {
        gameActive = true;
        currentPlayer = 'X';
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusText.textContent = `It's ${playerNames[currentPlayer]}'s turn`;
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
        if (gameMode === 'vs-computer' && currentPlayer === 'O') {
             setTimeout(computerMove, 500);
        }
    };
    
    const computerMove = () => {
        if (!gameActive) return;

        let availableCells = [];
        gameState.forEach((cell, index) => {
            if (cell === "") availableCells.push(index);
        });
        
        // --- Smarter AI Logic ---
        // 1. Check if computer can win
        for (const move of availableCells) {
            gameState[move] = 'O';
            if (checkWin('O')) {
                updateCellAndCheckResult(move, 'O');
                return;
            }
            gameState[move] = ''; // undo
        }

        // 2. Check if player is about to win and block them
        for (const move of availableCells) {
            gameState[move] = 'X';
            if (checkWin('X')) {
                gameState[move] = ''; // undo check
                updateCellAndCheckResult(move, 'O'); // make blocking move
                return;
            }
            gameState[move] = ''; // undo
        }
        
        // 3. If no strategic move, pick a random one
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const computerCellIndex = availableCells[randomIndex];
        updateCellAndCheckResult(computerCellIndex, 'O');
    };

    const checkWin = (player) => {
        return winningConditions.some(condition => {
            return condition.every(index => gameState[index] === player);
        });
    };

    const updateCellAndCheckResult = (index, player) => {
        gameState[index] = player;
        const cellToUpdate = document.querySelector(`.cell[data-cell-index='${index}']`);
        cellToUpdate.textContent = player;
        cellToUpdate.classList.add(player.toLowerCase());
        handleResultValidation();
    };


    const selectMode = (mode) => {
        gameMode = mode;
        vsComputerBtn.classList.toggle('selected', mode === 'vs-computer');
        twoPlayersBtn.classList.toggle('selected', mode === '2-players');
        
        playerNamesDiv.classList.remove('hidden');
        player2NameInput.style.display = (mode === '2-players') ? 'block' : 'none';
        if (mode === 'vs-computer') {
            player1NameInput.placeholder = "Your Name (X)";
            player2NameInput.value = "Computer";
        } else {
            player1NameInput.placeholder = "Player 1 Name (X)";
            player2NameInput.value = "";
            player2NameInput.placeholder = "Player 2 Name (O)";
        }
    };
    
    // ADDED: Function to go back to the menu
    const handleBackToMenu = () => {
        gameScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        
        // Reset game state completely
        gameActive = false;
        gameMode = '';
        player1NameInput.value = '';
        player2NameInput.value = '';
        playerNamesDiv.classList.add('hidden');
        vsComputerBtn.classList.remove('selected');
        twoPlayersBtn.classList.remove('selected');
    };

    // --- Event Listeners ---
    vsComputerBtn.addEventListener('click', () => selectMode('vs-computer'));
    twoPlayersBtn.addEventListener('click', () => selectMode('2-players'));

    startGameBtn.addEventListener('click', () => {
        const p1Name = player1NameInput.value.trim();
        const p2Name = player2NameInput.value.trim();

        if (!gameMode) {
            alert("Please select a game mode!");
            return;
        }
        if (p1Name === "") {
            alert("Please enter a name for Player 1.");
            return;
        }
        if (gameMode === '2-players' && p2Name === "") {
             alert("Please enter a name for Player 2.");
            return;
        }

        playerNames.X = p1Name;
        playerNames.O = (gameMode === 'vs-computer') ? 'Computer' : p2Name;
        
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        restartGame();
    });

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartBtn.addEventListener('click', restartGame);
    backToMenuBtn.addEventListener('click', handleBackToMenu); // ADDED
});