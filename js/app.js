/**
 * TEXTY v2 - Main Application
 * DOM manipulation, event handling, and app initialization
 */

class TextyApp {
    constructor() {
        this.elements = {};
        this.state = {
            theme: 'light',
            lastAnalysis: null,
            isProcessing: false
        };
        
        this.init();
    }

    // === INITIALIZATION ===
    init() {
        this.cacheElements();
        this.bindEvents();
        this.initializeTheme();
        this.setCurrentYear();
        
        // Add entrance animation
        document.body.style.opacity = '0';
        requestAnimationFrame(() => {
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '1';
        });
    }

    cacheElements() {
        // Text processing elements
        this.elements.textInput = document.getElementById('textInput');
        this.elements.stripFormatBtn = document.getElementById('stripFormatBtn');
        this.elements.autoFormatBtn = document.getElementById('autoFormatBtn');
        this.elements.copyBtn = document.getElementById('copyBtn');
        this.elements.clearBtn = document.getElementById('clearBtn');

        // Case converter buttons
        this.elements.caseButtons = document.querySelectorAll('[data-case]');

        // Lorem generator elements
        this.elements.loremType = document.getElementById('loremType');
        this.elements.loremCount = document.getElementById('loremCount');
        this.elements.loremStyle = document.getElementById('loremStyle');
        this.elements.loremOutput = document.getElementById('loremOutput');
        this.elements.generateBtn = document.getElementById('generateBtn');
        this.elements.copyLoremBtn = document.getElementById('copyLoremBtn');
        this.elements.clearLoremBtn = document.getElementById('clearLoremBtn');

        // Statistics elements
        this.elements.wordCount = document.getElementById('wordCount');
        this.elements.charCount = document.getElementById('charCount');
        this.elements.charCountNoSpaces = document.getElementById('charCountNoSpaces');
        this.elements.sentenceCount = document.getElementById('sentenceCount');
        this.elements.paragraphCount = document.getElementById('paragraphCount');
        this.elements.readingTime = document.getElementById('readingTime');
        this.elements.readabilityScore = document.getElementById('readabilityScore');
        this.elements.gradeLevel = document.getElementById('gradeLevel');
        this.elements.avgWordsPerSentence = document.getElementById('avgWordsPerSentence');
        this.elements.detectedLanguage = document.getElementById('detectedLanguage');

        // Social media elements
        this.elements.twitterCount = document.getElementById('twitterCount');
        this.elements.twitterBar = document.getElementById('twitterBar');
        this.elements.linkedinCount = document.getElementById('linkedinCount');
        this.elements.linkedinBar = document.getElementById('linkedinBar');
        this.elements.instagramCount = document.getElementById('instagramCount');
        this.elements.instagramBar = document.getElementById('instagramBar');

        // Keywords
        this.elements.keywordsList = document.getElementById('keywordsList');

        // Theme toggle
        this.elements.themeToggle = document.getElementById('themeToggle');

        // Toast notification
        this.elements.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Text input events
        if (this.elements.textInput) {
            this.elements.textInput.addEventListener('input', 
                TextUtils.debounce(() => this.updateAnalysis(), 300)
            );
            this.elements.textInput.addEventListener('paste', () => {
                setTimeout(() => {
                    this.autoStripAndFormat();
                }, 50);
            });
        }

        // Text processing buttons
        this.bindButtonEvent('stripFormatBtn', () => this.stripFormatting());
        this.bindButtonEvent('autoFormatBtn', () => this.autoFormat());
        this.bindButtonEvent('copyBtn', () => this.copyText('textInput'));
        this.bindButtonEvent('clearBtn', () => this.clearText('textInput'));

        // Case converter buttons
        this.elements.caseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const caseType = btn.getAttribute('data-case');
                this.convertCase(caseType);
            });
        });

        // Lorem generator events
        this.bindButtonEvent('generateBtn', () => this.generateLorem());
        this.bindButtonEvent('copyLoremBtn', () => this.copyText('loremOutput'));
        this.bindButtonEvent('clearLoremBtn', () => this.clearText('loremOutput'));

        // Lorem settings change
        ['loremType', 'loremCount', 'loremStyle'].forEach(id => {
            const element = this.elements[id];
            if (element) {
                element.addEventListener('change', () => this.generateLorem());
            }
        });

        // Theme toggle
        this.bindButtonEvent('themeToggle', () => this.toggleTheme());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window events
        window.addEventListener('beforeunload', () => this.saveState());
        window.addEventListener('load', () => this.restoreState());
    }

    bindButtonEvent(elementKey, handler) {
        const element = this.elements[elementKey];
        if (element) {
            element.addEventListener('click', handler);
        }
    }

    // === TEXT PROCESSING ===
    updateAnalysis() {
        const text = this.elements.textInput?.value || '';
        const analysis = TextAnalyzer.analyze(text);
        this.state.lastAnalysis = analysis;
        
        this.updateStatistics(analysis);
        this.updateSocialLimits(text);
        this.updateKeywords(analysis.keywords);
    }

    updateStatistics(analysis) {
        // Update basic stats
        this.updateElement('wordCount', analysis.words);
        this.updateElement('charCount', analysis.characters);
        this.updateElement('charCountNoSpaces', analysis.charactersNoSpaces);
        this.updateElement('sentenceCount', analysis.sentences);
        this.updateElement('paragraphCount', analysis.paragraphs);
        this.updateElement('readingTime', `${analysis.readingTime}m`);
        this.updateElement('readabilityScore', analysis.fleschScore);
        this.updateElement('gradeLevel', analysis.gradeLevel);
        this.updateElement('avgWordsPerSentence', analysis.avgWordsPerSentence);
        this.updateElement('detectedLanguage', analysis.detectedLanguage);
    }

    updateSocialLimits(text) {
        const limits = SocialLimits.check(text);
        
        this.updateSocialLimit('twitter', limits.twitter);
        this.updateSocialLimit('linkedin', limits.linkedin);
        this.updateSocialLimit('instagram', limits.instagram);
    }

    updateSocialLimit(platform, data) {
        const countElement = this.elements[`${platform}Count`];
        const barElement = this.elements[`${platform}Bar`];
        
        if (countElement) {
            countElement.textContent = `${data.count}/${data.limit}`;
        }
        
        if (barElement) {
            barElement.style.width = `${data.percentage}%`;
            barElement.className = data.isOverLimit ? 
                'progress-fill over-limit' : 'progress-fill';
        }
    }

    updateKeywords(keywords) {
        if (!this.elements.keywordsList) return;
        
        if (keywords.length === 0) {
            this.elements.keywordsList.innerHTML = '<span class="keyword-tag">None yet</span>';
        } else {
            this.elements.keywordsList.innerHTML = keywords
                .map(({ word, count }) => 
                    `<span class="keyword-tag">${word.toUpperCase()} (${count})</span>`
                )
                .join('');
        }
    }

    updateElement(id, value) {
        const element = this.elements[id];
        if (element) {
            if (element.textContent !== value.toString()) {
                element.style.transform = 'scale(1.1)';
                element.textContent = value;
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 150);
            }
        }
    }

    stripFormatting() {
        if (!this.elements.textInput) return;
        
        this.setButtonLoading('stripFormatBtn', true);
        
        setTimeout(() => {
            const formatted = TextFormatter.stripFormatting(this.elements.textInput.value);
            this.elements.textInput.value = formatted;
            this.updateAnalysis();
            this.setButtonLoading('stripFormatBtn', false);
            this.showToast('Formatting stripped successfully');
        }, 100);
    }

    autoFormat() {
        if (!this.elements.textInput) return;
        
        this.setButtonLoading('autoFormatBtn', true);
        
        setTimeout(() => {
            const formatted = TextFormatter.autoFormat(this.elements.textInput.value);
            this.elements.textInput.value = formatted;
            this.updateAnalysis();
            this.setButtonLoading('autoFormatBtn', false);
            this.showToast('Text formatted successfully');
        }, 100);
    }

    autoStripAndFormat() {
        if (!this.elements.textInput) return;
        
        let text = this.elements.textInput.value;
        text = TextFormatter.stripFormatting(text);
        text = TextFormatter.autoFormat(text);
        this.elements.textInput.value = text;
        this.updateAnalysis();
    }

    convertCase(caseType) {
        if (!this.elements.textInput) return;
        
        const converted = CaseConverter.convert(this.elements.textInput.value, caseType);
        this.elements.textInput.value = converted;
        this.updateAnalysis();
        this.showToast(`Converted to ${caseType} case`);
    }

    // === LOREM GENERATOR ===
    generateLorem() {
        if (!this.elements.loremOutput) return;
        
        this.setButtonLoading('generateBtn', true);
        
        setTimeout(() => {
            const type = this.elements.loremType?.value || 'paragraphs';
            const count = parseInt(this.elements.loremCount?.value) || 3;
            const style = this.elements.loremStyle?.value || 'english';
            
            const lorem = LoremGenerator.generate(type, count, style);
            this.elements.loremOutput.value = lorem;
            
            this.setButtonLoading('generateBtn', false);
            this.showToast('Lorem text generated');
        }, 200);
    }

    // === UTILITY FUNCTIONS ===
    async copyText(elementId) {
        const element = this.elements[elementId];
        if (!element || !element.value) {
            this.showToast('Nothing to copy', 'error');
            return;
        }
        
        try {
            await TextUtils.copyToClipboard(element.value);
            this.showToast('Text copied to clipboard');
        } catch (err) {
            this.showToast('Failed to copy text', 'error');
        }
    }

    clearText(elementId) {
        const element = this.elements[elementId];
        if (element) {
            element.value = '';
            if (elementId === 'textInput') {
                this.updateAnalysis();
            }
            this.showToast('Text cleared');
        }
    }

    setButtonLoading(buttonId, loading) {
        const button = this.elements[buttonId];
        if (button) {
            if (loading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
    }

    showToast(message, type = 'success') {
        if (!this.elements.toast) return;
        
        const toast = this.elements.toast;
        const messageElement = toast.querySelector('.toast-message');
        
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // === THEME MANAGEMENT ===
    initializeTheme() {
        const savedTheme = localStorage.getItem('texty-theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }


    setTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('texty-theme', theme);
        
        if (this.elements.themeToggle) {
            const icon = this.elements.themeToggle.querySelector('.theme-icon');
            const text = this.elements.themeToggle.querySelector('span:last-child');
            if (icon && text) {
                if (theme === 'dark') {
                    icon.textContent = '☀️';
                    text.textContent = 'Light';
                } else {
                    icon.textContent = '🌙';
                    text.textContent = 'Dark';
                }
            }
        }
    }

    // === UTILITY METHODS ===
    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // === KEYBOARD SHORTCUTS ===
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'k':
                    e.preventDefault();
                    this.clearText('textInput');
                    break;
                case 'f':
                    e.preventDefault();
                    this.autoFormat();
                    break;
                case 's':
                    e.preventDefault();
                    this.stripFormatting();
                    break;
                case 'g':
                    e.preventDefault();
                    this.generateLorem();
                    break;
                case 'd':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            if (this.elements.toast?.classList.contains('show')) {
                this.elements.toast.classList.remove('show');
            }
        }
    }

    // === STATE MANAGEMENT ===
    saveState() {
        const state = {
            textInput: this.elements.textInput?.value || '',
            loremType: this.elements.loremType?.value || 'paragraphs',
            loremCount: this.elements.loremCount?.value || 3,
            loremStyle: this.elements.loremStyle?.value || 'english',
            theme: this.state.theme
        };
        
        try {
            localStorage.setItem('texty-state', JSON.stringify(state));
        } catch (err) {
            console.warn('Failed to save state:', err);
        }
    }

    restoreState() {
        try {
            const savedState = localStorage.getItem('texty-state');
            if (!savedState) return;
            
            const state = JSON.parse(savedState);
            
            if (this.elements.textInput && state.textInput) {
                this.elements.textInput.value = state.textInput;
                this.updateAnalysis();
            }
            
            if (this.elements.loremType && state.loremType) {
                this.elements.loremType.value = state.loremType;
            }
            
            if (this.elements.loremCount && state.loremCount) {
                this.elements.loremCount.value = state.loremCount;
            }
            
            if (this.elements.loremStyle && state.loremStyle) {
                this.elements.loremStyle.value = state.loremStyle;
            }
            
        } catch (err) {
            console.warn('Failed to restore state:', err);
        }
    }
}

// === APPLICATION STARTUP ===
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.textyApp = new TextyApp();
    } catch (error) {
        console.error('Failed to initialize TEXTY:', error);
    }
});
