// SYNTAX SURGE - Leaderboard and Persistence System

class LeaderboardSystem {
    constructor() {
        this.storageKey = 'syntaxSurgeScores';
        this.load();
    }
    
    load() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.scores = JSON.parse(saved);
        } else {
            this.scores = [];
        }
    }
    
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
    }
    
    addScore(name, wave, score, bugsSquashed, accuracy) {
        this.scores.push({
            name: name.substring(0, 15),
            wave: wave,
            score: score,
            bugsSquashed: bugsSquashed,
            accuracy: Math.round(accuracy),
            date: new Date().toLocaleDateString(),
            language: this.getCurrentLanguageFromWave(wave)
        });
        
        // Sort by score descending
        this.scores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        if (this.scores.length > 10) {
            this.scores = this.scores.slice(0, 10);
        }
        
        this.save();
        return this.getRank(score);
    }
    
    getRank(score) {
        const rank = this.scores.findIndex(s => s.score === score) + 1;
        if (rank === 0) return null;
        if (rank === 1) return 'new_record';
        if (rank <= 5) return 'top_five';
        return 'top_ten';
    }
    
    getTopScores() {
        return this.scores.slice(0, 10);
    }
    
    getHighestWave() {
        if (this.scores.length === 0) return 0;
        return Math.max(...this.scores.map(s => s.wave));
    }
    
    getCurrentLanguageFromWave(wave) {
        if (wave < 5) return 'JavaScript';
        if (wave < 10) return 'Python';
        if (wave < 15) return 'Java';
        if (wave < 20) return 'C++';
        return 'Rust';
    }
    
    reset() {
        if (confirm('⚠️ WARNING: This will permanently delete all leaderboard scores and progression data. Continue?')) {
            this.scores = [];
            this.save();
            return true;
        }
        return false;
    }
    
    displayLeaderboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const scores = this.getTopScores();
        
        if (scores.length === 0) {
            container.innerHTML = '<div class="leaderboard-empty">No challengers yet. Be the first!</div>';
            return;
        }
        
        container.innerHTML = scores.map((entry, index) => `
            <div class="leaderboard-entry">
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-name">${this.escapeHtml(entry.name)}</span>
                <span class="leaderboard-score">${entry.score}</span>
                <span class="leaderboard-wave">Wave ${entry.wave}</span>
            </div>
        `).join('');
    }
    
    escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
}

// Initialize leaderboard
const leaderboard = new LeaderboardSystem();

// Helper function to prompt for name on high score
function promptForHighScore(score, wave, bugsSquashed, accuracy) {
    const name = prompt('🏆 HIGH SCORE ACHIEVED! 🏆\nEnter your developer alias:', 'CodeMaster');
    if (name) {
        leaderboard.addScore(name, wave, score, bugsSquashed, accuracy);
        leaderboard.displayLeaderboard('leaderboardList');
        return true;
    }
    return false;
}

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LeaderboardSystem, leaderboard, promptForHighScore };
}
