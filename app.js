class DuplicateKeypressDetector {
    constructor() {
        this.timeWindow = 100;
        this.lastKey = null;
        this.lastKeyTime = 0;
        this.duplicateCounts = new Map();
        this.lastDetectedTimes = new Map();
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateStats();
    }

    initializeElements() {
        this.timeWindowInput = document.getElementById('timeWindow');
        this.textInput = document.getElementById('textInput');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultsTable = document.getElementById('resultsTable');
        this.resultsTableBody = document.getElementById('resultsTableBody');
        this.clearButton = document.getElementById('clearResults');
        this.totalDuplicatesElement = document.getElementById('totalDuplicates');
        this.uniqueCharactersElement = document.getElementById('uniqueCharacters');
        this.currentTimeWindowElement = document.getElementById('currentTimeWindow');
        
        this.updateTimeWindowDisplay();
    }

    attachEventListeners() {
        // Use input event to track actual character input
        this.textInput.addEventListener('input', (event) => {
            // Get the last character that was input
            const inputValue = event.target.value;
            const inputType = event.inputType;
            
            // Only process insertText and insertCompositionText events
            if (inputType === 'insertText' || inputType === 'insertCompositionText') {
                const data = event.data;
                if (data && data.length === 1) {
                    this.handleCharacterInput(data);
                }
            }
        });

        // Also listen to keydown for special keys like Backspace, Enter, etc.
        this.textInput.addEventListener('keydown', (event) => {
            const specialChars = {
                'Backspace': 'Backspace',
                'Enter': 'Enter',
                ' ': 'Space'
            };
            
            if (specialChars[event.key]) {
                this.handleCharacterInput(specialChars[event.key]);
            }
        });

        this.timeWindowInput.addEventListener('input', () => {
            this.handleTimeWindowChange();
        });

        this.clearButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.clearResults();
        });
    }

    handleCharacterInput(char) {
        const currentTime = Date.now();
        
        // Check for duplicate
        const timeDiff = currentTime - this.lastKeyTime;
        const isSameChar = this.lastKey === char;
        const withinWindow = timeDiff <= this.timeWindow;
        const hasLastTime = this.lastKeyTime > 0;
        
        if (isSameChar && withinWindow && hasLastTime) {
            this.recordDuplicate(char);
        }
        
        // Update for next comparison
        this.lastKey = char;
        this.lastKeyTime = currentTime;
    }

    recordDuplicate(char) {
        const currentCount = this.duplicateCounts.get(char) || 0;
        this.duplicateCounts.set(char, currentCount + 1);
        this.lastDetectedTimes.set(char, Date.now());
        
        this.updateResultsDisplay();
        this.updateStats();
    }

    updateResultsDisplay() {
        // Show results table
        const noResults = this.resultsContainer.querySelector('.no-results');
        if (noResults) {
            noResults.style.display = 'none';
        }
        this.resultsTable.classList.remove('hidden');

        // Clear and rebuild table
        this.resultsTableBody.innerHTML = '';

        const sortedEntries = Array.from(this.duplicateCounts.entries())
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

        sortedEntries.forEach(([char, count]) => {
            const row = this.createTableRow(char, count);
            this.resultsTableBody.appendChild(row);
        });
    }

    createTableRow(char, count) {
        const row = document.createElement('tr');
        const lastDetected = this.lastDetectedTimes.get(char);
        const isRecent = Date.now() - lastDetected < 2000;
        
        if (isRecent) {
            row.classList.add('recent-duplicate');
            setTimeout(() => row.classList.remove('recent-duplicate'), 2000);
        }

        const displayChar = this.displayCharacter(char);
        const timestamp = this.formatTimestamp(lastDetected);

        row.innerHTML = `
            <td><span class="char-display">${displayChar}</span></td>
            <td><span class="count-badge">${count}</span></td>
            <td><span class="timestamp">${timestamp}</span></td>
        `;

        return row;
    }

    displayCharacter(char) {
        const specialChars = {
            ' ': 'Space',
            'Space': 'Space',
            'Enter': 'Enter',
            'Backspace': 'Backspace',
            '\t': 'Tab'
        };
        return specialChars[char] || char;
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit'
        });
    }

    handleTimeWindowChange() {
        const newValue = parseInt(this.timeWindowInput.value);
        if (isNaN(newValue) || newValue < 1) {
            this.timeWindowInput.value = this.timeWindow;
            return;
        }
        
        this.timeWindow = newValue;
        this.updateTimeWindowDisplay();
        this.resetTracking();
    }

    updateTimeWindowDisplay() {
        this.currentTimeWindowElement.textContent = `${this.timeWindow}ms`;
    }

    resetTracking() {
        this.lastKey = null;
        this.lastKeyTime = 0;
    }

    updateStats() {
        const totalDuplicates = Array.from(this.duplicateCounts.values())
            .reduce((sum, count) => sum + count, 0);
        const uniqueCharacters = this.duplicateCounts.size;
        
        this.totalDuplicatesElement.textContent = totalDuplicates;
        this.uniqueCharactersElement.textContent = uniqueCharacters;
    }

    clearResults() {
        this.duplicateCounts.clear();
        this.lastDetectedTimes.clear();
        this.resetTracking();
        
        this.resultsTableBody.innerHTML = '';
        this.resultsTable.classList.add('hidden');
        
        const noResults = this.resultsContainer.querySelector('.no-results');
        if (noResults) {
            noResults.style.display = 'block';
        }
        
        this.updateStats();
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    const detector = new DuplicateKeypressDetector();
    window.detector = detector; // For debugging
    
    // Focus text input
    const textInput = document.getElementById('textInput');
    if (textInput) {
        setTimeout(() => textInput.focus(), 100);
    }
    
    // Keyboard shortcut
    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            detector.clearResults();
        }
    });
});
