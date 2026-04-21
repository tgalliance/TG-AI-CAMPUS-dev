// ===================================
// LocalStorage Data Management
// ===================================

const StorageManager = {
    // Keys
    KEYS: {
        PROGRESS: 'ai_learning_progress',
        BOOKMARKS: 'ai_learning_bookmarks',
        NOTES: 'ai_learning_notes',
        REVIEWS: 'ai_learning_reviews',
        QUIZ_RESULTS: 'ai_learning_quiz_results',
        WATCH_TIME: 'ai_learning_watch_time',
        SETTINGS: 'ai_learning_settings'
    },

    // Get data from localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error getting data:', e);
            return null;
        }
    },

    // Set data to localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error setting data:', e);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing data:', e);
            return false;
        }
    },

    // Clear all data
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (e) {
            console.error('Error clearing data:', e);
            return false;
        }
    },

    // ===================================
    // Progress Management
    // ===================================
    getProgress(videoId) {
        const progress = this.get(this.KEYS.PROGRESS) || {};
        return progress[videoId] || { watched: 0, duration: 0, completed: false, lastWatched: null };
    },

    setProgress(videoId, watched, duration, completed = false) {
        const progress = this.get(this.KEYS.PROGRESS) || {};
        progress[videoId] = {
            watched: watched,
            duration: duration,
            completed: completed,
            lastWatched: new Date().toISOString()
        };
        this.set(this.KEYS.PROGRESS, progress);
    },

    getAllProgress() {
        return this.get(this.KEYS.PROGRESS) || {};
    },

    // ===================================
    // Bookmarks Management
    // ===================================
    isBookmarked(videoId) {
        const bookmarks = this.get(this.KEYS.BOOKMARKS) || [];
        return bookmarks.includes(videoId);
    },

    toggleBookmark(videoId) {
        let bookmarks = this.get(this.KEYS.BOOKMARKS) || [];
        const index = bookmarks.indexOf(videoId);
        
        if (index > -1) {
            bookmarks.splice(index, 1);
        } else {
            bookmarks.push(videoId);
        }
        
        this.set(this.KEYS.BOOKMARKS, bookmarks);
        return bookmarks.includes(videoId);
    },

    getBookmarks() {
        return this.get(this.KEYS.BOOKMARKS) || [];
    },

    // ===================================
    // Notes Management
    // ===================================
    addNote(videoId, timestamp, text) {
        const notes = this.get(this.KEYS.NOTES) || {};
        if (!notes[videoId]) {
            notes[videoId] = [];
        }
        
        notes[videoId].push({
            id: Date.now(),
            timestamp: timestamp,
            text: text,
            createdAt: new Date().toISOString()
        });
        
        this.set(this.KEYS.NOTES, notes);
        return notes[videoId];
    },

    getNotes(videoId) {
        const notes = this.get(this.KEYS.NOTES) || {};
        return notes[videoId] || [];
    },

    getAllNotes() {
        return this.get(this.KEYS.NOTES) || {};
    },

    deleteNote(videoId, noteId) {
        const notes = this.get(this.KEYS.NOTES) || {};
        if (notes[videoId]) {
            notes[videoId] = notes[videoId].filter(note => note.id !== noteId);
            this.set(this.KEYS.NOTES, notes);
        }
        return notes[videoId] || [];
    },

    // ===================================
    // Reviews Management
    // ===================================
    addReview(videoId, rating, text) {
        const reviews = this.get(this.KEYS.REVIEWS) || {};
        if (!reviews[videoId]) {
            reviews[videoId] = [];
        }
        
        reviews[videoId].push({
            id: Date.now(),
            rating: rating,
            text: text,
            createdAt: new Date().toISOString()
        });
        
        this.set(this.KEYS.REVIEWS, reviews);
        return reviews[videoId];
    },

    getReviews(videoId) {
        const reviews = this.get(this.KEYS.REVIEWS) || {};
        return reviews[videoId] || [];
    },

    getAverageRating(videoId) {
        const reviews = this.getReviews(videoId);
        if (reviews.length === 0) return 0;
        
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    },

    // ===================================
    // Quiz Results Management
    // ===================================
    saveQuizResult(videoId, score, totalQuestions, answers) {
        const results = this.get(this.KEYS.QUIZ_RESULTS) || {};
        if (!results[videoId]) {
            results[videoId] = [];
        }
        
        results[videoId].push({
            id: Date.now(),
            score: score,
            totalQuestions: totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100),
            answers: answers,
            completedAt: new Date().toISOString()
        });
        
        this.set(this.KEYS.QUIZ_RESULTS, results);
        return results[videoId];
    },

    getQuizResults(videoId) {
        const results = this.get(this.KEYS.QUIZ_RESULTS) || {};
        return results[videoId] || [];
    },

    getAllQuizResults() {
        return this.get(this.KEYS.QUIZ_RESULTS) || {};
    },

    getBestQuizScore(videoId) {
        const results = this.getQuizResults(videoId);
        if (results.length === 0) return null;
        
        return Math.max(...results.map(r => r.percentage));
    },

    // ===================================
    // Watch Time Tracking
    // ===================================
    addWatchTime(videoId, seconds) {
        const watchTime = this.get(this.KEYS.WATCH_TIME) || {};
        if (!watchTime[videoId]) {
            watchTime[videoId] = 0;
        }
        watchTime[videoId] += seconds;
        this.set(this.KEYS.WATCH_TIME, watchTime);
    },

    getWatchTime(videoId) {
        const watchTime = this.get(this.KEYS.WATCH_TIME) || {};
        return watchTime[videoId] || 0;
    },

    getTotalWatchTime() {
        const watchTime = this.get(this.KEYS.WATCH_TIME) || {};
        return Object.values(watchTime).reduce((sum, time) => sum + time, 0);
    },

    // ===================================
    // Settings Management
    // ===================================
    getSettings() {
        return this.get(this.KEYS.SETTINGS) || {
            darkMode: false,
            playbackSpeed: 1.0,
            autoplay: true
        };
    },

    setSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.set(this.KEYS.SETTINGS, settings);
    },

    // ===================================
    // Statistics
    // ===================================
    getStatistics() {
        const progress = this.getAllProgress();
        const bookmarks = this.getBookmarks();
        const totalWatchTime = this.getTotalWatchTime();
        
        const coursesWatched = Object.keys(progress).length;
        const completedCourses = Object.values(progress).filter(p => p.completed).length;
        
        return {
            coursesWatched,
            completedCourses,
            bookmarkedCourses: bookmarks.length,
            totalWatchTimeMinutes: Math.round(totalWatchTime / 60),
            totalWatchTimeHours: (totalWatchTime / 3600).toFixed(1)
        };
    },

    // Category statistics
    getCategoryStats(videoData) {
        const progress = this.getAllProgress();
        const stats = { basic: 0, intermediate: 0, advanced: 0 };
        
        Object.keys(progress).forEach(videoId => {
            const video = videoData.find(v => v.id === parseInt(videoId));
            if (video && progress[videoId].watched > 0) {
                stats[video.category] = (stats[video.category] || 0) + 1;
            }
        });
        
        return stats;
    },

    // Weekly learning data (mock data for demo)
    getWeeklyStats() {
        const days = ['월', '화', '수', '목', '금', '토', '일'];
        const totalMinutes = this.getTotalWatchTime() / 60;
        const avgPerDay = totalMinutes / 7;
        
        // Generate realistic-looking data
        return days.map(() => Math.round(avgPerDay * (0.5 + Math.random())));
    }
};

// Make it globally available
window.StorageManager = StorageManager;
