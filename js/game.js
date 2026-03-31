// SYNTAX SURGE - Core Game Engine

// Game State
let gameState = {
    isActive: false,
    wave: 0,
    waveBugsDefeated: 0,
    bugsPerWave: 3,
    score: 0,
    combo: 0,
    playerHealth: 100,
    currentBug: null,
    currentBugHealth: 0,
    castTimeRemaining: 0,
    castInterval: null,
    powerups: {
        autoComplete: { active: false, remaining: 0, unlocked: false },
        damageBoost: { active: false, remaining: 0, unlocked: false },
        timeFreeze: { active: false, remaining: 0, unlocked: false },
        syntaxShield: { active: false, remaining: 0, unlocked: false }
    },
    stats: {
        totalBugsSquashed: 0,
        totalCorrect: 0,
        totalAttempts: 0,
        highestCombo: 0
    }
};

// DOM Elements
const elements = {
    waveNumber: document.getElementById('waveNumber'),
    scoreValue: document.getElementById('scoreValue'),
    comboValue: document.getElementById('comboValue'),
    playerHealth: document.getElementById('playerHealth'),
    playerHealthText: document.getElementById('playerHealthText'),
    bugHealth: document.getElementById('bugHealth'),
    bugHealthText: document.getElementById('bugHealthText'),
    bugName: document.getElementById('bugName'),
    bugLanguage: document.getElementById('bugLanguage'),
    bugIcon: document.getElementById('bugIcon'),
    codeSnippet: document.getElementById('codeSnippet'),
    castBar: document.getElementById('castBar'),
    castTimer: document.getElementById('castTimer'),
    userInput: document.getElementById('userInput'),
    submitBtn: document.getElementById('submitBtn'),
    startBtn: document.getElementById('startBtn'),
    feedback: document.getElementById('feedback'),
    waveFill: document.getElementById('waveFill'),
    waveProgressText: document.getElementById('waveProgressText'),
    currentLanguage: document.getElementById('currentLanguage'),
    gameOverModal: document.getElementById('gameOverModal'),
    finalWave: document.getElementById('finalWave'),
    finalScore: document.getElementById('finalScore'),
    finalBugs: document.getElementById('finalBugs'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    modalFeedback: document.getElementById('modalFeedback'),
    rematchBtn: document.getElementById('rematchBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    toggleLeaderboard: document.getElementById('toggleLeaderboard'),
    leaderboardContent: document.getElementById('leaderboardContent')
};

// Helper Functions
function updateUI() {
    elements.waveNumber.textContent = gameState.wave;
    elements.scoreValue.textContent = gameState.score;
    elements.comboValue.textContent = gameState.combo;
    
    const playerHealthPercent = (gameState.playerHealth / 100) * 100;
    elements.playerHealth.style.width = `${playerHealthPercent}%`;
    elements.playerHealthText.textContent = gameState.playerHealth;
    
    if (gameState.currentBug) {
        const bugHealthPercent = (gameState.currentBugHealth / gameState.currentBug.damage) * 100;
        elements.bugHealth.style.width = `${Math.max(0, bugHealthPercent)}%`;
        elements.bugHealthText.textContent = gameState.currentBugHealth;
    }
    
    // Update wave progress
    const waveProgress = (gameState.waveBugsDefeated / gameState.bugsPerWave) * 100;
    elements.waveFill.style.width = `${waveProgress}%`;
    elements.waveProgressText.textContent = `${gameState.waveBugsDefeated}/${gameState.bugsPerWave}`;
}

function updatePowerupUI() {
    const slots = ['powerup1', 'powerup2', 'powerup3', 'powerup4'];
    const powerupNames = ['autoComplete', 'damageBoost', 'timeFreeze', 'syntaxShield'];
    
    powerupNames.forEach((name, index) => {
        const slot = document.getElementById(slots[index]);
        const statusEl = document.getElementById(`pu${index + 1}Status`);
        const powerup = gameState.powerups[name];
        
        if (powerup.unlocked) {
            if (powerup.active) {
                statusEl.textContent = `ACTIVE (${Math.ceil(powerup.remaining)}s)`;
                statusEl.style.color = '#00ff66';
                slot.classList.add('active');
            } else {
                statusEl.textContent = 'Ready';
                statusEl.style.color = '#ffaa33';
                slot.classList.remove('active');
            }
        } else {
            statusEl.textContent = `Locked (Wave ${(index + 1) * 3})`;
            statusEl.style.color = '#666';
            slot.classList.remove('active');
        }
    });
}

function unlockPowerups() {
    if (gameState.wave >= 3 && !gameState.powerups.autoComplete.unlocked) {
        gameState.powerups.autoComplete.unlocked = true;
        showFeedback('🔮 POWER-UP UNLOCKED: Auto-Complete!', 'correct');
    }
    if (gameState.wave >= 6 && !gameState.powerups.damageBoost.unlocked) {
        gameState.powerups.damageBoost.unlocked = true;
        showFeedback('⚔️ POWER-UP UNLOCKED: Damage Boost!', 'correct');
    }
    if (gameState.wave >= 9 && !gameState.powerups.timeFreeze.unlocked) {
        gameState.powerups.timeFreeze.unlocked = true;
        showFeedback('⏰ POWER-UP UNLOCKED: Time Freeze!', 'correct');
    }
    if (gameState.wave >= 12 && !gameState.powerups.syntaxShield.unlocked) {
        gameState.powerups.syntaxShield.unlocked = true;
        showFeedback('🛡️ POWER-UP UNLOCKED: Syntax Shield!', 'correct');
    }
    updatePowerupUI();
}

function activatePowerup(powerupName) {
    const powerup = gameState.powerups[powerupName];
    if (!powerup.unlocked || powerup.active) return false;
    
    powerup.active = true;
    powerup.remaining = 10; // 10 seconds duration
    
    if (effectSystem) {
        effectSystem.powerUpEffect('rgba(0, 255, 204, 0.3)');
    }
    
    showFeedback(`✨ ${powerupName.toUpperCase()} ACTIVATED! ✨`, 'correct');
    updatePowerupUI();
    
    // Auto-deactivate after duration
    setTimeout(() => {
        if (powerup.active) {
            powerup.active = false;
            updatePowerupUI();
            showFeedback(`${powerupName.toUpperCase()} expired`, 'feedback');
        }
    }, 10000);
    
    return true;
}

function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = type;
    setTimeout(() => {
        if (elements.feedback.textContent === message) {
            elements.feedback.textContent = '';
            elements.feedback.className = '';
        }
    }, 2000);
}

function takeDamage(amount) {
    if (gameState.powerups.syntaxShield.active) {
        showFeedback('🛡️ SYNTAX SHIELD ABSORBED DAMAGE!', 'correct');
        return;
    }
    
    gameState.playerHealth = Math.max(0, gameState.playerHealth - amount);
    updateUI();
    
    if (effectSystem) {
        effectSystem.damageEffect();
    }
    
    // Visual feedback
    document.querySelector('.bug-arena').classList.add('damage-flash');
    setTimeout(() => document.querySelector('.bug-arena').classList.remove('damage-flash'), 200);
    
    if (gameState.playerHealth <= 0) {
        endGame();
    }
}

function dealDamageToBug(damage) {
    gameState.currentBugHealth -= damage;
    updateUI();
    
    if (gameState.currentBugHealth <= 0) {
        // Bug defeated!
        gameState.waveBugsDefeated++;
        gameState.stats.totalBugsSquashed++;
        
        // Calculate score
        const baseScore = gameState.currentBug.damage * 10;
        const comboBonus = gameState.combo * 5;
        const waveBonus = gameState.wave * 10;
        const pointsEarned = baseScore + comboBonus + waveBonus;
        
        gameState.score += pointsEarned;
        gameState.combo++;
        
        if (gameState.combo > gameState.stats.highestCombo) {
            gameState.stats.highestCombo = gameState.combo;
        }
        
        updateUI();
        
        if (effectSystem) {
            effectSystem.bugDefeatEffect();
            effectSystem.comboBurst(gameState.combo);
        }
        
        showFeedback(`✅ BUG SQUASHED! +${pointsEarned} XP (${gameState.combo}x COMBO!)`, 'correct');
        
        // Check if wave is complete
        if (gameState.waveBugsDefeated >= gameState.bugsPerWave) {
            completeWave();
        } else {
            spawnNextBug();
        }
    }
}

function completeWave() {
    gameState.wave++;
    gameState.waveBugsDefeated = 0;
    gameState.bugsPerWave = Math.min(3 + Math.floor(gameState.wave / 5), 8);
    
    // Heal player slightly on wave completion
    gameState.playerHealth = Math.min(100, gameState.playerHealth + 10);
    
    // Update language based on wave
    if (gameState.wave < 5) {
        elements.currentLanguage.textContent = 'JavaScript';
    } else if (gameState.wave < 10) {
        elements.currentLanguage.textContent = 'Python';
    } else if (gameState.wave < 15) {
        elements.currentLanguage.textContent = 'Java';
    } else if (gameState.wave < 20) {
        elements.currentLanguage.textContent = 'C++';
    } else {
        elements.currentLanguage.textContent = 'Rust';
    }
    
    unlockPowerups();
    updateUI();
    showFeedback(`🎉 WAVE ${gameState.wave} COMPLETE! +10 HP 🎉`, 'correct');
    
    spawnNextBug();
}

function spawnNextBug() {
    // Clear any existing cast interval
    if (gameState.castInterval) {
        clearInterval(gameState.castInterval);
    }
    
    // Determine current language based on wave
    let language = 'javascript';
    if (gameState.wave >= 20) language = 'rust';
    else if (gameState.wave >= 15) language = 'cpp';
    else if (gameState.wave >= 10) language = 'java';
    else if (gameState.wave >= 5) language = 'python';
    else language = 'javascript';
    
    const bug = getBugForWave(language, gameState.wave);
    if (!bug) return;
    
    gameState.currentBug = bug;
    gameState.currentBugHealth = bug.damage;
    
    // Update UI
    elements.bugName.textContent = bug.name;
    elements.bugLanguage.textContent = bug.languageName.toUpperCase();
    elements.codeSnippet.textContent = bug.syntax;
    
    // Set cast timer
    gameState.castTimeRemaining = bug.castTime;
    updateCastBar();
    
    // Start cast timer countdown
    gameState.castInterval = setInterval(() => {
        if (!gameState.isActive) return;
        
        if (gameState.powerups.timeFreeze.active) {
            // Time freeze pauses cast timer
            return;
        }
        
        gameState.castTimeRemaining -= 0.1;
        updateCastBar();
        
        if (gameState.castTimeRemaining <= 0) {
            // Bug attacks!
            clearInterval(gameState.castInterval);
            const damage = bug.damage;
            takeDamage(damage);
            showFeedback(`💥 ${bug.name} attacks for ${damage} damage!`, 'incorrect');
            
            if (gameState.playerHealth > 0) {
                spawnNextBug();
            }
        }
    }, 100);
    
    // Clear input
    elements.userInput.value = '';
    elements.userInput.focus();
    
    // Auto-complete power-up
    if (gameState.powerups.autoComplete.active) {
        elements.userInput.value = bug.syntax;
        showFeedback('🔮 AUTO-COMPLETE ACTIVE!', 'correct');
    }
}

function updateCastBar() {
    if (!gameState.currentBug) return;
    const percent = (gameState.castTimeRemaining / gameState.currentBug.castTime) * 100;
    elements.castBar.style.width = `${Math.max(0, percent)}%`;
    elements.castTimer.textContent = `${gameState.castTimeRemaining.toFixed(1)}s`;
}

function executeSyntax() {
    if (!gameState.isActive || !gameState.currentBug) return;
    
    const userInput = elements.userInput.value;
    gameState.stats.totalAttempts++;
    
    const isValid = validateSyntax(userInput, gameState.currentBug.syntax);
    
    if (isValid) {
        gameState.stats.totalCorrect++;
        
        // Calculate damage
        let damage = gameState.currentBug.damage;
        if (gameState.powerups.damageBoost.active) {
            damage *= 2;
            showFeedback('⚔️ DAMAGE BOOST ACTIVE! 2x DAMAGE!', 'correct');
        }
        
        dealDamageToBug(damage);
        
        if (effectSystem) {
            effectSystem.correctEffect();
        }
        
        // Clear cast interval for current bug
        if (gameState.castInterval) {
            clearInterval(gameState.castInterval);
            gameState.castInterval = null;
        }
        
        elements.userInput.value = '';
    } else {
        // Incorrect syntax - penalty
        gameState.combo = 0;
        updateUI();
        takeDamage(5);
        showFeedback(`❌ INCORRECT SYNTAX! -5 HP`, 'incorrect');
        elements.userInput.classList.add('damage-flash');
        setTimeout(() => elements.userInput.classList.remove('damage-flash'), 200);
    }
}

function startGame() {
    // Reset game state
    gameState = {
        isActive: true,
        wave: 1,
        waveBugsDefeated: 0,
        bugsPerWave: 3,
        score: 0,
        combo: 0,
        playerHealth: 100,
        currentBug: null,
        currentBugHealth: 0,
        castTimeRemaining: 0,
        castInterval: null,
        powerups: {
            autoComplete: { active: false, remaining: 0, unlocked: false },
            damageBoost: { active: false, remaining: 0, unlocked: false },
            timeFreeze: { active: false, remaining: 0, unlocked: false },
            syntaxShield: { active: false, remaining: 0, unlocked: false }
        },
        stats: {
            totalBugsSquashed: 0,
            totalCorrect: 0,
            totalAttempts: 0,
            highestCombo: 0
        }
    };
    
    // Enable UI
    elements.userInput.disabled = false;
    elements.submitBtn.disabled = false;
    elements.startBtn.disabled = true;
    elements.startBtn.textContent = '⚔️ IN COMBAT ⚔️';
    
    updateUI();
    updatePowerupUI();
    
    // Spawn first bug
    spawnNextBug();
    
    showFeedback('⚔️ COMBAT INITIALIZED! TYPE THE EXACT SYNTAX TO ATTACK! ⚔️', 'correct');
}

function endGame() {
    gameState.isActive = false;
    
    if (gameState.castInterval) {
        clearInterval(gameState.castInterval);
    }
    
    elements.userInput.disabled = true;
    elements.submitBtn.disabled = true;
    elements.startBtn.disabled = false;
    elements.startBtn.textContent = '▶ INITIALIZE COMBAT';
    
    const accuracy = gameState.stats.totalAttempts > 0 
        ? (gameState.stats.totalCorrect / gameState.stats.totalAttempts) * 100 
        : 0;
    
    elements.finalWave.textContent = gameState.wave;
    elements.finalScore.textContent = gameState.score;
    elements.finalBugs.textContent = gameState.stats.totalBugsSquashed;
    elements.finalAccuracy.textContent = Math.round(accuracy);
    
    // Check high score
    const rank = leaderboard.getRank(gameState.score);
    let feedbackText = '';
    
    if (rank === 'new_record') {
        feedbackText = '🏆 NEW RECORD! 🏆';
        promptForHighScore(gameState.score, gameState.wave, gameState.stats.totalBugsSquashed, accuracy);
    } else if (rank === 'top_five') {
        feedbackText = '✨ TOP 5 SCORE! ✨';
        promptForHighScore(gameState.score, gameState.wave, gameState.stats.totalBugsSquashed, accuracy);
    } else {
        const topScores = leaderboard.getTopScores();
        const lowestTopScore = topScores[topScores.length - 1]?.score || 0;
        if (gameState.score > lowestTopScore) {
            feedbackText = `🎯 You reached Wave ${gameState.wave} with ${gameState.score} points!`;
        } else {
            feedbackText = `Wave ${gameState.wave} | Score ${gameState.score} | Accuracy ${Math.round(accuracy)}%`;
        }
    }
    
    elements.modalFeedback.textContent = feedbackText;
    leaderboard.displayLeaderboard('leaderboardList');
    elements.gameOverModal.classList.add('active');
}

function rematch() {
    elements.gameOverModal.classList.remove('active');
    startGame();
}

// Power-up hotkeys
document.addEventListener('keydown', (e) => {
    if (!gameState.isActive) return;
    
    switch(e.key) {
        case '1':
            activatePowerup('autoComplete');
            break;
        case '2':
            activatePowerup('damageBoost');
            break;
        case '3':
            activatePowerup('timeFreeze');
            break;
        case '4':
            activatePowerup('syntaxShield');
            break;
        case 'Enter':
            if (document.activeElement === elements.userInput) {
                e.preventDefault();
                executeSyntax();
            }
            break;
    }
});

// Event Listeners
elements.startBtn.addEventListener('click', startGame);
elements.submitBtn.addEventListener('click', executeSyntax);
elements.rematchBtn.addEventListener('click', rematch);
elements.closeModalBtn.addEventListener('click', () => {
    elements.gameOverModal.classList.remove('active');
});
elements.toggleLeaderboard.addEventListener('click', () => {
    elements.leaderboardContent.classList.toggle('collapsed');
    elements.toggleLeaderboard.textContent = elements.leaderboardContent.classList.contains('collapsed') ? '▶' : '▼';
});

// Initialize leaderboard display
leaderboard.displayLeaderboard('leaderboardList');

console.log('🔥 SYNTAX SURGE — Developer Combat Arena loaded! 🔥');
