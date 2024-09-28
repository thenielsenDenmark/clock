let isGlobalTimerRunning = false;
let totalGameSeconds = 0;
let globalInterval;
let playersOnPitch = {};  // Active players on the pitch
let allPlayers = {};      // Cumulative time for all players
const MAX_PLAYERS_ON_PITCH = 5;
const pitchSlots = ['slot2', 'slot3', 'slot4', 'slot5'];  // Only other slots for players
let editingPlayerId = '';
let homeScore = 0;
let awayScore = 0;

const players = [
    { id: 'player1', name: 'Player 1', time: 0, onPitch: false },
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
    const availableSlot = pitchSlots.find(slot => document.getElementById(slot).textContent === 'Empty');
    const player = players.find(p => p.id === playerId);

    if (playerId === 'player1') {  // Handle the goalkeeper (first slot) separately
        const goalkeeperSlot = document.getElementById('slot1');
        goalkeeperSlot.innerHTML = `
            <img src="/pic/gloves.png" alt="Goalkeeper Gloves" class="goalkeeper-gloves">
            <div class="playerDetails">
                <div class="playerName">${player.name}</div>
                <div class="playerTime" id="time-${player.id}">${formatTime(player.time)}</div>
            </div>
            <button onclick="removePlayerFromPitch('${player.id}')">-</button>`;
        player.onPitch = true;
        startPlayerTimer(playerId);
        renderOffPitchPlayers();  // Re-render the off-pitch players
        return;
    }

    if (availableSlot) {
        if (!player.onPitch) {
            const playerSlot = document.getElementById(availableSlot);
            playerSlot.innerHTML = `
                <div class="player">
                    <div class="playerDetails">
                        <div class="playerName">${player.name}</div>
                        <div class="playerTime" id="time-${player.id}">${formatTime(player.time)}</div>
                    </div>
                    <button onclick="removePlayerFromPitch('${player.id}')">-</button>
                </div>`;
            player.onPitch = true;
            startPlayerTimer(playerId);
            renderOffPitchPlayers();  // Re-render the off-pitch players after adding to the pitch
        }
    } else {
        alert("No available space on the pitch. Maximum 5 players allowed.");
    }
}

// Removes a player from the pitch and moves them back to the off-pitch list
function removePlayerFromPitch(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player.onPitch) {
        stopPlayerTimer(playerId);  // Stop the timer but keep the time
        player.onPitch = false;

        if (playerId === 'player1') {  // Clear the goalkeeper slot when removed
            const goalkeeperSlot = document.getElementById('slot1');
            goalkeeperSlot.innerHTML = `
                <img src="/pic/gloves.png" alt="Goalkeeper Gloves" class="goalkeeper-gloves">
                <div class="playerName">Goalkeeper</div>
                <div class="playerTime" id="time-slot1">00:00:00</div>`;
        }

        // Clear the player slot
        pitchSlots.forEach(slot => {
            const slotDiv = document.getElementById(slot);
            if (slotDiv.querySelector(`#time-${player.id}`)) {
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
    if (!allPlayers[playerId]) {
        allPlayers[playerId] = { time: 0 };
    }
    playersOnPitch[playerId] = allPlayers[playerId];
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

// Change the score for home or away teams
function changeScore(team, increment) {
    if (team === 'home') {
        homeScore = Math.max(0, homeScore + increment);  // Prevent negative scores
        document.getElementById('homeScore').textContent = homeScore;
    } else if (team === 'away') {
        awayScore = Math.max(0, awayScore + increment);  // Prevent negative scores
        document.getElementById('awayScore').textContent = awayScore;
    }
}

// Reset all timers
function resetTimer() {
    clearInterval(globalInterval);
    totalGameSeconds = 0;
    document.getElementById("totalTime").textContent = "00:00:00";
    Object.keys(allPlayers).forEach(playerId => {
        allPlayers[playerId].time = 0;
        document.getElementById(`time-${playerId}`).textContent = "00:00:00";
    });
    playersOnPitch = {};  // Clear all active players
}
