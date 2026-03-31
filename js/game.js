// SYNTAX SURGE v2.0 - Core Game Engine with Upgraded UI Integration

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

function updateUI() {
    elements.waveNumber.textContent = gameState.wave;
    elements.scoreValue.textContent = gameState.score;
    elements.comboValue.textContent = gameState.combo;
    
    const playerPercent = (gameState.playerHealth / 100) * 100;
    elements.playerHealth.style.width = `${playerPercent}%`;
    elements.playerHealthText.textContent = gameState.playerHealth;
    
    if (gameState.currentBug) {
        const bugPercent = (gameState.currentBugHealth / gameState.currentBug.damage) * 100;
        elements.bugHealth.style.width = `${Math.max(0, bugPercent)}%`;
        elements.bugHealthText.textContent = gameState.currentBugHealth;
    }
    
    const waveProgress = (gameState.waveBugsDefeated / gameState.bugsPerWave) * 100;
    elements.waveFill.style.width = `${waveProgress}%`;
    elements.waveProgressText.textContent = `${gameState.waveBugsDefeated}/${gameState.bugsPerWave}`;
}

function updatePowerupUI() {
    const powerupNames = ['autoComplete', 'damageBoost', 'timeFreeze', 'syntaxShield'];
    powerupNames.forEach((name, index) => {
        const statusEl = document.getElementById(`pu${index + 1}Status`);
        const card = document.getElementById(`powerup${index + 1}`);
        const powerup = gameState.powerups[name];
        
        if (powerup.unlocked) {
            if (powerup.active) {
                statusEl.textContent = `ACTIVE (${Math.ceil(powerup.remaining)}s)`;
                statusEl.style.color = '#00ff66';
                card.classList.add('active');
            } else {
                statusEl.textContent = 'READY';
                statusEl.style.color = '#ffaa33';
                card.classList.remove('active');
            }
        } else {
            statusEl.textContent = `LOCKED (Wave ${(index + 1) * 3})`;
            statusEl.style.color = '#666';
            card.classList.remove('active');
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
    powerup.remaining = 10;
    
    if (particleSystem) {
        particleSystem.explosion(null, null, '#00ffff');
    }
    
    showFeedback(`✨ ${powerupName.toUpperCase()} ACTIVATED! ✨`, 'correct');
    updatePowerupUI();
    
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
    const terminalLine = document.createElement('div');
    terminalLine.className = `terminal-line ${type === 'correct' ? 'correct' : type === 'incorrect' ? 'incorrect' : ''}`;
    terminalLine.innerHTML = `> ${message}`;
    elements.feedback.innerHTML = '';
    elements.feedback.appendChild(terminalLine);
    
    setTimeout(() => {
        if (elements.feedback.firstChild === terminalLine) {
            elements.feedback.innerHTML = '<div class="terminal-line">> System ready</div>';
        }
    }, 3000);
}

function takeDamage(amount) {
    if (gameState.powerups.syntaxShield.active) {
        showFeedback('🛡️ SYNTAX SHIELD ABSORBED DAMAGE!', 'correct');
        return;
    }
    
    gameState.playerHealth = Math.max(0, gameState.playerHealth - amount);
    updateUI();
    
    if (particleSystem) {
        particleSystem.damageFlash();
        particleSystem.screenShake(8, 200);
    }
    
    document.querySelector('.bug-arena').classList.add('damage-flash');
    setTimeout(() => document.querySelector('.bug-arena').classList.remove('damage-flash'), 200);
    
    if (gameState.playerHealth <= 0) endGame();
}

function dealDamageToBug(damage) {
    gameState.currentBugHealth -= damage;
    updateUI();
    
    if (gameState.currentBugHealth <= 0) {
        gameState.waveBugsDefeated++;
        gameState.stats.totalBugsSquashed++;
        
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
        
        if (particleSystem) {
            particleSystem.explosion();
            particleSystem.correctFlash();
        }
        
        showFeedback(`✅ BUG SQUASHED! +${pointsEarned} XP (${gameState.combo}x COMBO!)`, 'correct');
        
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
    gameState.playerHealth = Math.min(100, gameState.playerHealth + 10);
    
    if (gameState.wave < 5) elements.currentLanguage.textContent = 'JavaScript';
    else if (gameState.wave < 10) elements.currentLanguage.textContent = 'Python';
    else if (gameState.wave < 15) elements.currentLanguage.textContent = 'Java';
    else if (gameState.wave < 20) elements.currentLanguage.textContent = 'C++';
    else elements.currentLanguage.textContent = 'Rust';
    
    unlockPowerups();
    updateUI();
    showFeedback(`🎉 WAVE ${gameState.wave} COMPLETE! +10 HP 🎉`, 'correct');
    spawnNextBug();
}

function spawnNextBug() {
    if (gameState.castInterval) clearInterval(gameState.castInterval);
    
    let language = 'javascript';
    if (gameState.wave >= 20) language = 'rust';
    else if (gameState.wave >= 15) language = 'cpp';
    else if (gameState.wave >= 10) language = 'java';
    else if (gameState.wave >= 5) language = 'python';
    
    const bug = getBugForWave(language, gameState.wave);
    if (!bug) return;
    
    gameState.currentBug = bug;
    gameState.currentBugHealth = bug.damage;
    
    elements.bugName.textContent = bug.name;
    elements.bugLanguage.innerHTML = `<span class="lang-badge">${bug.languageName.toUpperCase()}</span>`;
    elements.codeSnippet.textContent = bug.syntax;
    
    gameState.castTimeRemaining = bug.castTime;
    updateCastBar();
    
    gameState.castInterval = setInterval(() => {
        if (!gameState.isActive) return;
        if (gameState.powerups.timeFreeze.active) return;
        
        gameState.castTimeRemaining -= 0.1;
        updateCastBar();
        
        if (gameState.castTimeRemaining <= 0) {
            clearInterval(gameState.castInterval);
            takeDamage(bug.damage);
            showFeedback(`💥 ${bug.name} attacks for ${bug.damage} damage!`, 'incorrect');
            if (gameState.playerHealth > 0) spawnNextBug();
        }
    }, 100);
    
    elements.userInput.value = '';
    elements.userInput.focus();
    
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
        let damage = gameState.currentBug.damage;
        if (gameState.powerups.damageBoost.active) {
            damage *= 2;
            showFeedback('⚔️ DAMAGE BOOST ACTIVE! 2x DAMAGE!', 'correct');
        }
        dealDamageToBug(damage);
        
        if (particleSystem) particleSystem.correctFlash();
        
        if (gameState.castInterval) {
            clearInterval(gameState.castInterval);
            gameState.castInterval = null;
        }
        elements.userInput.value = '';
    } else {
        gameState.combo = 0;
        updateUI();
        takeDamage(5);
        showFeedback(`❌ INCORRECT SYNTAX! -5 HP`, 'incorrect');
        elements.userInput.classList.add('damage-flash');
        setTimeout(() => elements.userInput.classList.remove('damage-flash'), 200);
    }
}

function startGame() {
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
    
    elements.userInput.disabled = false;
    elements.submitBtn.disabled = false;
    elements.startBtn.disabled = true;
    elements.startBtn.querySelector('.btn-content').textContent = '⚔️ IN COMBAT ⚔️';
    
    updateUI();
    updatePowerupUI();
    spawnNextBug();
    showFeedback('⚔️ COMBAT INITIALIZED! TYPE THE EXACT SYNTAX TO ATTACK! ⚔️', 'correct');
}

function endGame() {
    gameState.isActive = false;
    if (gameState.castInterval) clearInterval(gameState.castInterval);
    
    elements.userInput.disabled = true;
    elements.submitBtn.disabled = true;
    elements.startBtn.disabled = false;
    elements.startBtn.querySelector('.btn-content').textContent = '▶ INITIATE COMBAT';
    
    const accuracy = gameState.stats.totalAttempts > 0 
        ? (gameState.stats.totalCorrect / gameState.stats.totalAttempts) * 100 : 0;
    
    elements.finalWave.textContent = gameState.wave;
    elements.finalScore.textContent = gameState.score;
    elements.finalBugs.textContent = gameState.stats.totalBugsSquashed;
    elements.finalAccuracy.textContent = Math.round(accuracy);
    
    const rank = leaderboard.getRank(gameState.score);
    let feedbackText = '';
    
    if (rank === 'new_record') {
        feedbackText = '🏆 NEW RECORD! 🏆';
        promptForHighScore(gameState.score, gameState.wave, gameState.stats.totalBugsSquashed, accuracy);
    } else if (rank === 'top_five') {
        feedbackText = '✨ TOP 5 SCORE! ✨';
        promptForHighScore(gameState.score, gameState.wave, gameState.stats.totalBugsSquashed, accuracy);
    } else {
        feedbackText = `Wave ${gameState.wave} | Score ${gameState.score} | Accuracy ${Math.round(accuracy)}%`;
    }
    
    elements.modalFeedback.textContent = feedbackText;
    leaderboard.displayLeaderboard('leaderboardList');
    elements.gameOverModal.classList.add('active');
}

function rematch() {
    elements.gameOverModal.classList.remove('active');
    startGame();
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (!gameState.isActive) return;
    if (e.key === '1') activatePowerup('autoComplete');
    if (e.key === '2') activatePowerup('damageBoost');
    if (e.key === '3') activatePowerup('timeFreeze');
    if (e.key === '4') activatePowerup('syntaxShield');
    if (e.key === 'Enter' && document.activeElement === elements.userInput) {
        e.preventDefault();
        executeSyntax();
    }
});

elements.startBtn.addEventListener('click', startGame);
elements.submitBtn.addEventListener('click', executeSyntax);
elements.rematchBtn.addEventListener('click', rematch);
elements.closeModalBtn.addEventListener('click', () => elements.gameOverModal.classList.remove('active'));

elements.toggleLeaderboard.addEventListener('click', () => {
    elements.leaderboardContent.classList.toggle('collapsed');
    elements.toggleLeaderboard.querySelector('.toggle-icon').textContent = 
        elements.leaderboardContent.classList.contains('collapsed') ? '▶' : '▼';
});

leaderboard.displayLeaderboard('leaderboardList');

console.log('🔥 SYNTAX SURGE v2.0 — Developer Combat Arena loaded! 🔥');
