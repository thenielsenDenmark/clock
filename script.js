let isGlobalTimerRunning = false;
let totalGameSeconds = 0; // This should be updated according to the game's time progression
let globalInterval;
let playersOnPitch = {};  // Active players on the pitch
const MAX_PLAYERS_ON_PITCH = 5;
const pitchSlots = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5'];
let homeScore = 0;
let awayScore = 0;


const players = [
    { id: 'player1', name: 'Goalkeeper', time: 0, onPitch: false },
    { id: 'player2', name: 'Player 2', time: 0, onPitch: false },
    { id: 'player3', name: 'Player 3', time: 0, onPitch: false },
    { id: 'player4', name: 'Player 4', time: 0, onPitch: false },
    { id: 'player5', name: 'Player 5', time: 0, onPitch: false },
    { id: 'player6', name: 'Player 6', time: 0, onPitch: false },
    { id: 'player7', name: 'Player 7', time: 0, onPitch: false },
    { id: 'player8', name: 'Player 8', time: 0, onPitch: false }
];

// Initialize the Off-Pitch Players on page load
window.onload = () => {
    renderOffPitchPlayers();
    addGoalButtonListeners();
};

// Renders the off-pitch players
function renderOffPitchPlayers() {
    const offPitchDiv = document.getElementById('offPitch');
    offPitchDiv.innerHTML = '';  // Clear the current list
    players.forEach(player => {
        if (!player.onPitch) {
            offPitchDiv.innerHTML += `
                <div class="player" id="off-${player.id}">
                    <div class="playerName">${player.name}</div>
                    <div class="playerTime" id="time-${player.id}">${formatTime(player.time)}</div>
                    <button onclick="addPlayerToPitch('${player.id}')">+</button>
                    <button class="editPlayerBtn" onclick="startEditing('${player.id}')">Edit Name</button>
                </div>`;
        }
    });
}

// Adds a player to the pitch (if space is available)
function addPlayerToPitch(playerId) {
    const emptySlot = pitchSlots.find(slot => document.getElementById(slot).innerText === 'Empty');
    
    if (emptySlot && players.some(p => p.id === playerId)) {
        const player = players.find(p => p.id === playerId);
        
        // Update the slot with player details
        document.getElementById(emptySlot).innerHTML = `
            <div class="playerDetails">
                <div class="playerName">${player.name}</div>
                <div class="playerTime" id="time-${playerId}">00:00:00</div>
            </div>
            <button onclick="removePlayerFromPitch('${playerId}')">-</button>
            <button class="goal-btn" onclick="logGoal('${playerId}', 'home')">⚽</button>
        `;
        
        player.onPitch = true;
        startPlayerTimer(playerId);  // Start the player's timer
        renderOffPitchPlayers();     // Re-render off-pitch players after adding to pitch
    } else {
        console.warn('No available slot or invalid player.');
    }
}

// Removes a player from the pitch and moves them back to the off-pitch list
function removePlayerFromPitch(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player.onPitch) {
        stopPlayerTimer(playerId);  // Stop the timer but keep the time
        player.onPitch = false;

        pitchSlots.forEach(slot => {
            const slotDiv = document.getElementById(slot);
            if (slotDiv.querySelector(`#time-${playerId}`)) {
                slotDiv.innerHTML = 'Empty';  // Clear the slot
            }
        });

        renderOffPitchPlayers();  // Re-render off-pitch players after removing from pitch
    }
}

// Start and stop the global game timer
function startStopTimer() {
    if (isGlobalTimerRunning) {
        clearInterval(globalInterval);
    } else {
        globalInterval = setInterval(() => {
            totalGameSeconds++;
            document.getElementById("totalTime").textContent = formatTime(totalGameSeconds);
            updatePlayerTimers();
        }, 1000);
    }
    isGlobalTimerRunning = !isGlobalTimerRunning;
}

// Start a player's individual timer
function startPlayerTimer(playerId) {
    if (!playersOnPitch[playerId]) {
        playersOnPitch[playerId] = { time: 0 };
    }
}

// Stop a player's individual timer but keep their time
function stopPlayerTimer(playerId) {
    if (playersOnPitch[playerId]) {
        const player = players.find(p => p.id === playerId);
        player.time = playersOnPitch[playerId].time;  // Transfer the current time to the player
        delete playersOnPitch[playerId];
    }
}

// Update the timers for all players currently on the pitch
function updatePlayerTimers() {
    Object.keys(playersOnPitch).forEach(playerId => {
        playersOnPitch[playerId].time++;
        document.getElementById(`time-${playerId}`).textContent = formatTime(playersOnPitch[playerId].time);
    });
}

// Helper function to format time as HH:MM:SS
function formatTime(seconds) {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
}

// Toggle visibility of "Edit Name" buttons
function toggleEditNames() {
    const editButtons = document.querySelectorAll('.editPlayerBtn');
    editButtons.forEach(btn => {
        btn.style.display = btn.style.display === 'none' ? 'inline-block' : 'none';
    });
    const toggleBtn = document.getElementById('toggleEditBtn');
    toggleBtn.textContent = toggleBtn.textContent === 'Show Edit Names' ? 'Hide Edit Names' : 'Show Edit Names';
}

// Start editing a player's name
function startEditing(playerId) {
    editingPlayerId = playerId;
    const player = players.find(p => p.id === playerId);
    document.getElementById('editNameInput').value = player.name;  // Load the current name into the input field
}

// Change the player's name based on input
function editPlayerName() {
    const newName = document.getElementById('editNameInput').value;
    if (editingPlayerId && newName) {
        const player = players.find(p => p.id === editingPlayerId);
        player.name = newName;  // Update the player's name in the data structure
        renderOffPitchPlayers();  // Re-render the off-pitch players with the updated name
        editingPlayerId = '';  // Reset after editing
    }
}

// Function to change the score and log goals
function changeScore(team, increment) {
    const goalLogDiv = document.getElementById('goalLog');
    
    // Calculate the current minute of the game
    const currentMinute = Math.floor(totalGameSeconds / 60);

    if (team === 'home') {
        homeScore += increment;
        document.getElementById('homeScore').textContent = homeScore;

        // Log the goal if the score was incremented
        if (increment > 0) {
            goalLogDiv.innerHTML += `<div>${homeScore}-${awayScore} Home Team scored (min ${currentMinute})</div>`;
        }
    } else if (team === 'away') {
        awayScore += increment;
        document.getElementById('awayScore').textContent = awayScore;

        // Log the goal if the score was incremented
        if (increment > 0) {
            goalLogDiv.innerHTML += `<div>${homeScore}-${awayScore} Away Team scored (min ${currentMinute})</div>`;
        }
    }
}
// Goal log
function logGoal(playerId, team) {
    const player = players.find(p => p.id === playerId);
    const goalLogDiv = document.getElementById('goalLog');
    
    // Calculate the current minute of the game
    const currentMinute = Math.floor(totalGameSeconds / 60);

    if (team === 'home' && player && player.onPitch) {
        homeScore++;
        document.getElementById('homeScore').textContent = homeScore; // Update home score display
        goalLogDiv.innerHTML += `<div>${homeScore}-${awayScore} ${player.name} scored for Home Team (min ${currentMinute})</div>`;
    } else if (team === 'away') {
        awayScore++;
        document.getElementById('awayScore').textContent = awayScore; // Update away score display
        goalLogDiv.innerHTML += `<div>${homeScore}-${awayScore} Away Team scored (min ${currentMinute})</div>`;
    } else {
        goalLogDiv.innerHTML += `<div>Unknown player scored a goal! (min ${currentMinute})</div>`;
    }
}

// Reset all timers
function resetTimer() {
    clearInterval(globalInterval);
    totalGameSeconds = 0;
    document.getElementById("totalTime").textContent = "00:00:00";
    players.forEach(player => {
        player.time = 0;
        const playerTimeElement = document.getElementById(`time-${player.id}`);
        if (playerTimeElement) {
            playerTimeElement.textContent = "00:00:00";
        }
    });
    playersOnPitch = {};  // Clear all active players
    document.getElementById('goalLog').innerHTML = '';  // Clear the goal log
}

// Add event listeners to goal buttons
function addGoalButtonListeners() {
    players.forEach(player => {
        const playerGoalButton = document.getElementById(`goal-${player.id}`);
        if (playerGoalButton) {
            playerGoalButton.addEventListener('click', () => logGoal(player.id, 'home'));
        }
    });

    const awayGoalButton = document.getElementById('awayGoalButton');
    if (awayGoalButton) {
        awayGoalButton.addEventListener('click', () => logGoal(null, 'away'));
    }
}
