/**
 * TEXTY v2 - Text Processing Functions
 * Core text manipulation and analysis utilities
 */

// === TEXT STATISTICS ===
class TextAnalyzer {
    static analyze(text) {
        if (!text || !text.trim()) {
            return this.getEmptyStats();
        }

        const words = this.getWords(text);
        const sentences = this.getSentences(text);
        const paragraphs = this.getParagraphs(text);
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const readingTime = Math.ceil(words.length / 200);
        const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
        const avgSyllablesPerWord = this.calculateAvgSyllables(words);
        const fleschScore = this.calculateFleschScore(avgWordsPerSentence, avgSyllablesPerWord);
        const gradeLevel = this.getGradeLevel(fleschScore);
        const detectedLanguage = this.detectLanguage(text);
        const keywords = this.extractKeywords(words);

        return {
            words: words.length,
            characters,
            charactersNoSpaces,
            sentences: sentences.length,
            paragraphs: paragraphs.length,
            readingTime,
            avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
            fleschScore: Math.round(fleschScore),
            gradeLevel,
            detectedLanguage,
            keywords
        };
    }

    static getEmptyStats() {
        return {
            words: 0,
            characters: 0,
            charactersNoSpaces: 0,
            sentences: 0,
            paragraphs: 0,
            readingTime: 0,
            avgWordsPerSentence: 0,
            fleschScore: 0,
            gradeLevel: '—',
            detectedLanguage: 'EN',
            keywords: []
        };
    }

    static getWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0);
    }

    static getSentences(text) {
        return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    }

    static getParagraphs(text) {
        return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    }

    static calculateAvgSyllables(words) {
        if (words.length === 0) return 0;
        return words.reduce((total, word) => total + this.countSyllables(word), 0) / words.length;
    }

    static countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }

    static calculateFleschScore(avgWordsPerSentence, avgSyllablesPerWord) {
        return 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    }

    static getGradeLevel(score) {
        if (score >= 90) return 'G5';
        if (score >= 80) return 'G6';
        if (score >= 70) return 'G7';
        if (score >= 60) return 'G8-9';
        if (score >= 50) return 'G10-12';
        if (score >= 30) return 'College';
        return 'Grad';
    }

    static detectLanguage(text) {
        const commonEnglish = ['the', 'and', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'that'];
        const commonSpanish = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se'];
        const commonFrench = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'en', 'avoir', 'que'];
        const commonGerman = ['der', 'die', 'und', 'zu', 'den', 'das', 'nicht', 'von', 'sie', 'ist'];
        
        const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        let englishCount = 0, spanishCount = 0, frenchCount = 0, germanCount = 0;
        
        words.forEach(word => {
            if (commonEnglish.includes(word)) englishCount++;
            if (commonSpanish.includes(word)) spanishCount++;
            if (commonFrench.includes(word)) frenchCount++;
            if (commonGerman.includes(word)) germanCount++;
        });
        
        const max = Math.max(englishCount, spanishCount, frenchCount, germanCount);
        if (max === 0) return 'EN';
        if (max === spanishCount) return 'ES';
        if (max === frenchCount) return 'FR';
        if (max === germanCount) return 'DE';
        return 'EN';
    }

    static extractKeywords(words) {
        const stopWords = new Set([
            'the', 'and', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 
            'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'any', 
            'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 
            'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 
            'let', 'put', 'say', 'she', 'too', 'use'
        ]);
        
        const wordCount = {};
        
        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
            if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
                wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
            }
        });
        
        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([word, count]) => ({ word, count }));
    }
}

// === TEXT FORMATTING ===
class TextFormatter {
    static stripFormatting(text) {
        if (!text) return '';
        
        // Remove HTML tags
        text = text.replace(/<[^>]*>/g, '');
        
        // Decode HTML entities
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        text = textarea.value;
        
        // Normalize whitespace but preserve paragraph structure
        text = text.replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
        text = text.replace(/\n\s*\n\s*/g, '\n\n'); // Normalize paragraph breaks
        text = text.replace(/^\s+|\s+$/g, ''); // Trim start and end
        
        return text;
    }

    static autoFormat(text) {
        if (!text || !text.trim()) return '';
        
        // Preserve intentional line breaks but normalize spacing
        const paragraphs = text.split(/\n\s*\n/);
        
        const formattedParagraphs = paragraphs.map(paragraph => {
            // Normalize whitespace within paragraphs but preserve single line breaks
            let lines = paragraph.split(/\n/);
            lines = lines.map(line => {
                line = line.replace(/\s+/g, ' ').trim(); // Normalize spaces within lines
                
                // Fix spacing around punctuation
                line = line.replace(/\s+([,.!?;:])/g, '$1'); // Remove space before punctuation
                line = line.replace(/([.!?])\s*([A-Z])/g, '$1 $2'); // Ensure space after sentence endings
                line = line.replace(/([,:;])\s*/g, '$1 '); // Ensure space after commas, colons, semicolons
                
                // Capitalize first letter of sentences
                line = line.replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => 
                    prefix + letter.toUpperCase()
                );
                
                // Fix common issues
                line = line.replace(/\bi\b/g, 'I'); // Capitalize standalone "i"
                line = line.replace(/\s+'/g, "'"); // Fix apostrophe spacing
                line = line.replace(/'\s+/g, "'"); // Fix apostrophe spacing
                line = line.replace(/\s+"/g, '"'); // Fix quote spacing
                line = line.replace(/"\s+/g, '"'); // Fix quote spacing
                
                // Fix multiple punctuation
                line = line.replace(/[.]{2,}/g, '...'); // Fix ellipsis
                line = line.replace(/[!]{2,}/g, '!'); // Fix multiple exclamation
                line = line.replace(/[?]{2,}/g, '?'); // Fix multiple question marks
                
                return line;
            }).filter(line => line.length > 0); // Remove empty lines within paragraphs
            
            return lines.join('\n');
        }).filter(p => p.length > 0); // Remove empty paragraphs
        
        return formattedParagraphs.join('\n\n');
    }
}

// === CASE CONVERSION ===
class CaseConverter {
    static convert(text, caseType) {
        if (!text) return '';
        
        switch(caseType) {
            case 'upper': 
                return text.toUpperCase();
            
            case 'lower': 
                return text.toLowerCase();
            
            case 'title': 
                return text.replace(/\w\S*/g, txt => 
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
            
            case 'sentence': 
                return text.toLowerCase().replace(/(^|\. *)([a-z])/g, (match, p1, p2) => 
                    p1 + p2.toUpperCase()
                );
            
            case 'camel': 
                return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                    index === 0 ? word.toLowerCase() : word.toUpperCase()
                ).replace(/\s+/g, '');
            
            case 'pascal': 
                return text.replace(/(?:^\w|[A-Z]|\b\w)/g, word => 
                    word.toUpperCase()
                ).replace(/\s+/g, '');
            
            case 'snake': 
                return text.toLowerCase().replace(/\s+/g, '_');
            
            case 'kebab': 
                return text.toLowerCase().replace(/\s+/g, '-');
            
            default: 
                return text;
        }
    }
}

// === LOREM IPSUM GENERATOR ===
class LoremGenerator {
    static libraries = {
        latin: [
            'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 
            'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 
            'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 
            'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 
            'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 
            'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 
            'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 
            'mollit', 'anim', 'id', 'est', 'laborum'
        ],
        english: [
            'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'beautiful', 
            'landscape', 'mountain', 'river', 'forest', 'sunshine', 'peaceful', 'journey', 
            'adventure', 'discover', 'explore', 'amazing', 'wonderful', 'incredible', 
            'fantastic', 'brilliant', 'excellent', 'outstanding', 'remarkable', 'stunning', 
            'breathtaking', 'magnificent', 'spectacular', 'extraordinary', 'impressive', 
            'delightful', 'charming', 'elegant', 'graceful', 'vibrant', 'dynamic', 'serene', 
            'tranquil', 'majestic', 'captivating', 'inspiring', 'refreshing', 'invigorating'
        ],
        tech: [
            'algorithm', 'database', 'framework', 'application', 'interface', 'protocol', 
            'architecture', 'deployment', 'optimization', 'authentication', 'encryption', 
            'scalability', 'performance', 'infrastructure', 'cloud', 'microservices', 
            'container', 'kubernetes', 'docker', 'api', 'endpoint', 'middleware', 'backend', 
            'frontend', 'fullstack', 'responsive', 'progressive', 'machine', 'learning', 
            'artificial', 'intelligence', 'neural', 'network', 'blockchain', 'cybersecurity', 
            'devops', 'continuous', 'integration', 'deployment', 'agile', 'scrum', 'sprint'
        ],
        business: [
            'strategy', 'growth', 'innovation', 'market', 'customer', 'revenue', 'profit', 
            'investment', 'portfolio', 'stakeholder', 'partnership', 'collaboration', 
            'synergy', 'efficiency', 'productivity', 'optimization', 'transformation', 
            'digital', 'disruption', 'competitive', 'advantage', 'value', 'proposition', 
            'brand', 'marketing', 'sales', 'analytics', 'metrics', 'performance', 'roi', 
            'kpi', 'milestone', 'deliverable', 'timeline', 'budget', 'resource', 'allocation', 
            'management', 'leadership', 'vision', 'mission', 'sustainable', 'scalable'
        ]
    };

    static generate(type, count, style) {
        const words = this.libraries[style] || this.libraries.english;
        
        switch(type) {
            case 'words': 
                return this.generateWords(count, words);
            case 'sentences': 
                return this.generateSentences(count, words);
            case 'paragraphs': 
            default: 
                return this.generateParagraphs(count, words);
        }
    }

    static generateWords(count, wordArray) {
        const words = [];
        for (let i = 0; i < count; i++) {
            words.push(wordArray[Math.floor(Math.random() * wordArray.length)]);
        }
        return words.join(' ') + '.';
    }

    static generateSentences(count, wordArray) {
        const sentences = [];
        for (let i = 0; i < count; i++) {
            const wordCount = Math.floor(Math.random() * 15) + 5;
            const words = [];
            for (let j = 0; j < wordCount; j++) {
                words.push(wordArray[Math.floor(Math.random() * wordArray.length)]);
            }
            words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
            sentences.push(words.join(' ') + '.');
        }
        return sentences.join(' ');
    }

    static generateParagraphs(count, wordArray) {
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
            const sentenceCount = Math.floor(Math.random() * 5) + 3;
            const sentences = this.generateSentences(sentenceCount, wordArray);
            paragraphs.push(sentences);
        }
        return paragraphs.join('\n\n');
    }
}

// === SOCIAL MEDIA LIMITS ===
class SocialLimits {
    static limits = {
        twitter: 280,
        linkedin: 3000,
        instagram: 2200,
        facebook: 63206,
        tiktok: 150,
        youtube: 5000
    };

    static check(text) {
        const charCount = text.length;
        const results = {};
        
        Object.keys(this.limits).forEach(platform => {
            const limit = this.limits[platform];
            const percentage = Math.min((charCount / limit) * 100, 100);
            const isOverLimit = charCount > limit;
            
            results[platform] = {
                count: charCount,
                limit,
                percentage,
                isOverLimit,
                remaining: Math.max(0, limit - charCount)
            };
        });
        
        return results;
    }
}

// === UTILITY FUNCTIONS ===
class TextUtils {
    static copyToClipboard(text) {
        return navigator.clipboard.writeText(text).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            } finally {
                document.body.removeChild(textArea);
            }
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static sanitizeInput(input) {
        // Remove potentially harmful characters/sequences
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TextAnalyzer,
        TextFormatter,
        CaseConverter,
        LoremGenerator,
        SocialLimits,
        TextUtils
    };
}