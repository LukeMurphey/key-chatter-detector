class KeypressDuplicateTracker {
    constructor() {
        this.keypressHistory = [];
        this.duplicateCounts = {};
        this.totalKeypresses = 0;
        this.timeWindow = 500; // Default time window in milliseconds
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timeWindowInput = document.getElementById('timeWindow');
        this.textInput = document.getElementById('textInput');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.totalKeypressesEl = document.getElementById('totalKeypresses');
        this.uniqueCharsEl = document.getElementById('uniqueChars');
    }
    
    bindEvents() {
        // Fix time window input handling
        this.timeWindowInput.addEventListener('change', (e) => {
            const newValue = parseInt(e.target.value);
            if (!isNaN(newValue) && newValue >= 50 && newValue <= 5000) {
                console.log(`Time window changed to: ${newValue}ms`);
                this.timeWindow = newValue;
                this.recalculateDuplicates();
                this.updateDisplay();
            } else {
                // Reset to current value if invalid
                e.target.value = this.timeWindow;
            }
        });
        
        // Handle keypress events - use input event to capture all changes
        this.textInput.addEventListener('input', (e) => {
            this.handleTextInput(e);
        });
        
        // Also monitor keydown for immediate response
        this.textInput.addEventListener('keydown', (e) => {
            // Use setTimeout to ensure the character is added to the text area first
            setTimeout(() => {
                this.processCurrentText();
            }, 1);
        });
        
        // Clean up old keypresses periodically
        this.cleanupInterval = setInterval(() => {
            this.cleanupOldKeypresses();
        }, 500);
    }
    
    handleTextInput(event) {
        const currentText = event.target.value;
        
        if (currentText.trim() === '') {
            this.clearHistory();
            this.updateDisplay();
            return;
        }
        
        this.processCurrentText();
    }
    
    processCurrentText() {
        const currentText = this.textInput.value;
        const currentTime = Date.now();
        
        // If text is empty, clear history
        if (currentText.length === 0) {
            this.clearHistory();
            this.updateDisplay();
            return;
        }
        
        // If we have fewer keypresses recorded than characters in text, 
        // we need to catch up (this handles paste, rapid typing, etc.)
        const textLength = currentText.length;
        
        if (this.keypressHistory.length < textLength) {
            // Add the missing keypresses
            for (let i = this.keypressHistory.length; i < textLength; i++) {
                const char = currentText[i];
                const timestamp = currentTime - (textLength - i - 1) * 10; // Stagger timestamps slightly
                
                this.keypressHistory.push({ key: char, timestamp });
                this.totalKeypresses++;
                
                console.log(`Adding keypress: "${char}" at ${timestamp}`);
            }
            
            // Recalculate duplicates after adding new keypresses
            this.recalculateDuplicates();
            this.updateDisplay();
        }
        
        // If we have more keypresses than text length, user deleted text
        if (this.keypressHistory.length > textLength) {
            // Trim excess keypresses
            this.keypressHistory = this.keypressHistory.slice(0, textLength);
            this.totalKeypresses = this.keypressHistory.length;
            
            // Recalculate duplicates after removal
            this.recalculateDuplicates();
            this.updateDisplay();
        }
    }
    
    recalculateDuplicates() {
        // Clear existing duplicates
        this.duplicateCounts = {};
        
        if (this.keypressHistory.length === 0) {
            return;
        }
        
        console.log(`Recalculating duplicates for ${this.keypressHistory.length} keypresses with ${this.timeWindow}ms window`);
        
        // For each keypress, check if there are duplicates within the time window
        this.keypressHistory.forEach((currentPress, index) => {
            const { key, timestamp } = currentPress;
            const timeWindowStart = timestamp - this.timeWindow;
            
            // Find all presses of the same key within the time window before this press
            const duplicatesInWindow = this.keypressHistory.filter((press, pressIndex) => 
                pressIndex < index && // Only look at previous presses
                press.key === key && 
                press.timestamp >= timeWindowStart && 
                press.timestamp <= timestamp
            );
            
            // If we found duplicates, count this as a duplicate occurrence
            if (duplicatesInWindow.length > 0) {
                if (!this.duplicateCounts[key]) {
                    this.duplicateCounts[key] = 0;
                }
                this.duplicateCounts[key]++;
            }
        });
        
        console.log('Calculated duplicates:', this.duplicateCounts);
    }
    
    cleanupOldKeypresses() {
        // Only clean up if we have a reasonable number of keypresses
        if (this.keypressHistory.length < 1000) {
            return;
        }
        
        const currentTime = Date.now();
        const cutoffTime = currentTime - (this.timeWindow * 5); // Keep longer history
        
        const originalLength = this.keypressHistory.length;
        this.keypressHistory = this.keypressHistory.filter(press => 
            press.timestamp >= cutoffTime
        );
        
        if (this.keypressHistory.length !== originalLength) {
            console.log(`Cleaned up ${originalLength - this.keypressHistory.length} old keypresses`);
            this.totalKeypresses = this.keypressHistory.length;
            this.recalculateDuplicates();
            this.updateDisplay();
        }
    }
    
    clearHistory() {
        console.log('Clearing history...');
        this.keypressHistory = [];
        this.duplicateCounts = {};
        this.totalKeypresses = 0;
    }
    
    getCharacterDisplayName(char) {
        const specialChars = {
            ' ': 'Space',
            '\n': 'Enter',
            '\t': 'Tab'
        };
        
        return specialChars[char] || char;
    }
    
    updateDisplay() {
        this.updateStats();
        this.updateDuplicatesList();
    }
    
    updateStats() {
        this.totalKeypressesEl.textContent = this.totalKeypresses;
        
        const uniqueChars = new Set(this.keypressHistory.map(press => press.key)).size;
        this.uniqueCharsEl.textContent = uniqueChars;
    }
    
    updateDuplicatesList() {
        const duplicateEntries = Object.entries(this.duplicateCounts);
        
        console.log('Updating display with duplicates:', this.duplicateCounts);
        
        if (duplicateEntries.length === 0) {
            this.resultsContainer.innerHTML = '<p class="no-results">No duplicate keypresses detected</p>';
            return;
        }
        
        // Sort by duplicate count (highest first)
        duplicateEntries.sort((a, b) => b[1] - a[1]);
        
        const duplicatesHTML = duplicateEntries.map(([char, count]) => {
            const displayName = this.getCharacterDisplayName(char);
            const isSpecialChar = displayName !== char;
            
            return `
                <div class="duplicate-item">
                    <div class="duplicate-char ${isSpecialChar ? 'special-char' : ''}">${displayName}</div>
                    <div class="duplicate-info">
                        <div class="duplicate-label">Character: "${char}"</div>
                        <div class="duplicate-count">${count} duplicate${count > 1 ? 's' : ''} detected</div>
                    </div>
                    <div class="duplicate-badge">${count}</div>
                </div>
            `;
        }).join('');
        
        this.resultsContainer.innerHTML = duplicatesHTML;
    }
    
    // Method to simulate typing for testing
    simulateTyping(text, delayMs = 100) {
        this.textInput.value = '';
        this.clearHistory();
        
        let index = 0;
        const typeChar = () => {
            if (index < text.length) {
                this.textInput.value += text[index];
                const event = new Event('input', { bubbles: true });
                this.textInput.dispatchEvent(event);
                index++;
                setTimeout(typeChar, delayMs);
            }
        };
        
        typeChar();
    }
    
    // Method to get current statistics (useful for debugging)
    getStats() {
        return {
            totalKeypresses: this.totalKeypresses,
            uniqueCharacters: new Set(this.keypressHistory.map(press => press.key)).size,
            duplicateCounts: { ...this.duplicateCounts },
            recentKeypresses: this.keypressHistory.slice(-10),
            timeWindow: this.timeWindow,
            historyLength: this.keypressHistory.length,
            currentText: this.textInput.value
        };
    }
    
    // Clean up on destroy
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const tracker = new KeypressDuplicateTracker();
    
    // Make tracker available globally for debugging
    window.keypressTracker = tracker;
    
    // Add some helpful console messages
    console.log('Keypress Duplicate Tracker initialized');
    console.log('Access tracker instance via window.keypressTracker');
    console.log('Use tracker.getStats() to view current statistics');
    console.log('Use tracker.simulateTyping("hello", 200) to test with simulated typing');
    console.log(`Default time window: ${tracker.timeWindow}ms`);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        tracker.destroy();
    });
});