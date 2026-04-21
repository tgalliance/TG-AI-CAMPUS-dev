// ===================================
// Enhanced Courses Page - Additional Features
// ===================================

// Global variables
let currentVideoData = null;
let watchTimeInterval = null;
let lastWatchTimeUpdate = 0;
let selectedRating = 0;

// Expose to window for external access
window.currentVideoData = currentVideoData;
window.openNoteModal = openNoteModal;
window.closeNoteModal = closeNoteModal;
window.saveNote = saveNote;
window.loadNotes = loadNotes;
window.deleteNote = deleteNote;
window.seekToTime = seekToTime;
window.closeQuizModal = closeQuizModal;
window.loadReviews = loadReviews;

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedFeatures();
});

function initializeEnhancedFeatures() {
    setupBookmarkButton();
    setupPlaybackSpeed();
    setupNoteButton();
    setupQuizButton();
    setupVideoTabs();
    setupReviewSystem();
    setupProgressTracking();
    setupDarkMode();
    
    // Load saved settings
    loadSettings();
}

// ===================================
// Bookmark Feature
// ===================================
function setupBookmarkButton() {
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (!bookmarkBtn) return;
    
    bookmarkBtn.addEventListener('click', function() {
        if (!currentVideoData) return;
        
        const isBookmarked = StorageManager.toggleBookmark(currentVideoData.id);
        updateBookmarkButton(isBookmarked);
        
        showToast(isBookmarked ? '북마크에 추가되었습니다' : '북마크에서 제거되었습니다');
    });
}

function updateBookmarkButton(isBookmarked) {
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (!bookmarkBtn) return;
    
    const icon = bookmarkBtn.querySelector('i');
    if (isBookmarked) {
        icon.className = 'fas fa-bookmark';
        bookmarkBtn.classList.add('active');
    } else {
        icon.className = 'far fa-bookmark';
        bookmarkBtn.classList.remove('active');
    }
}

// ===================================
// Playback Speed Control
// ===================================
function setupPlaybackSpeed() {
    const speedBtn = document.getElementById('playbackSpeedBtn');
    const speedMenu = document.getElementById('speedMenu');
    
    if (!speedBtn || !speedMenu) return;
    
    speedBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        speedMenu.classList.toggle('hidden');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function() {
        speedMenu.classList.add('hidden');
    });
    
    // Speed button handlers
    speedMenu.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const speed = parseFloat(this.dataset.speed);
            setPlaybackSpeed(speed);
            
            // Update active state
            speedMenu.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            speedMenu.classList.add('hidden');
        });
    });
}

function setPlaybackSpeed(speed) {
    const videoPlayer = document.getElementById('mainVideoPlayer');
    if (!videoPlayer) return;
    
    videoPlayer.playbackRate = speed;
    document.getElementById('speedDisplay').textContent = speed + 'x';
    StorageManager.setSetting('playbackSpeed', speed);
    
    showToast(`재생 속도: ${speed}x`);
}

// ===================================
// Notes Feature
// ===================================
function setupNoteButton() {
    const noteBtn = document.getElementById('takeNoteBtn');
    if (!noteBtn) return;
    
    noteBtn.addEventListener('click', openNoteModal);
}

function openNoteModal() {
    if (!currentVideoData) return;
    
    const modal = document.getElementById('noteModal');
    const videoPlayer = document.getElementById('mainVideoPlayer');
    
    if (!modal || !videoPlayer) return;
    
    // Set current timestamp
    const currentTime = videoPlayer.currentTime;
    document.getElementById('noteTimestamp').textContent = formatTime(currentTime);
    document.getElementById('noteTimestamp').dataset.time = currentTime;
    
    modal.style.display = 'flex';
    document.getElementById('noteTextarea').focus();
}

function closeNoteModal() {
    const modal = document.getElementById('noteModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('noteTextarea').value = '';
    }
}

function saveNote() {
    if (!currentVideoData) return;
    
    const textarea = document.getElementById('noteTextarea');
    const text = textarea.value.trim();
    
    if (!text) {
        showToast('노트 내용을 입력하세요', 'error');
        return;
    }
    
    const timestamp = parseFloat(document.getElementById('noteTimestamp').dataset.time);
    StorageManager.addNote(currentVideoData.id, timestamp, text);
    
    closeNoteModal();
    loadNotes();
    showToast('노트가 저장되었습니다');
}

function loadNotes() {
    if (!currentVideoData) return;
    
    const notes = StorageManager.getNotes(currentVideoData.id);
    const container = document.getElementById('notesContainer');
    
    if (!container) return;
    
    if (notes.length === 0) {
        container.innerHTML = '<p class="empty-state">아직 작성된 노트가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = notes.map(note => `
        <div class="note-item">
            <div class="note-header">
                <button class="note-timestamp" onclick="seekToTime(${note.timestamp})">
                    <i class="fas fa-play-circle"></i> ${formatTime(note.timestamp)}
                </button>
                <button class="note-delete" onclick="deleteNote(${note.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p class="note-text">${note.text}</p>
            <span class="note-date">${formatDate(note.createdAt)}</span>
        </div>
    `).join('');
}

function deleteNote(noteId) {
    if (!currentVideoData) return;
    if (!confirm('이 노트를 삭제하시겠습니까?')) return;
    
    StorageManager.deleteNote(currentVideoData.id, noteId);
    loadNotes();
    showToast('노트가 삭제되었습니다');
}

function seekToTime(seconds) {
    const videoPlayer = document.getElementById('mainVideoPlayer');
    if (videoPlayer) {
        videoPlayer.currentTime = seconds;
        videoPlayer.play();
    }
}

// ===================================
// Quiz Feature
// ===================================
function setupQuizButton() {
    const quizBtn = document.getElementById('takeQuizBtn');
    if (!quizBtn) return;
    
    quizBtn.addEventListener('click', openQuizModal);
}

function openQuizModal() {
    if (!currentVideoData) return;
    
    const modal = document.getElementById('quizModal');
    if (!modal) return;
    
    loadQuiz();
    modal.style.display = 'flex';
}

function closeQuizModal() {
    const modal = document.getElementById('quizModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function loadQuiz() {
    const quizContent = document.getElementById('quizContent');
    if (!quizContent || !currentVideoData) return;
    
    // Generate quiz questions based on video category
    const questions = generateQuizQuestions(currentVideoData.category);
    
    quizContent.innerHTML = `
        <div class="quiz-container">
            <h4>총 ${questions.length}문제</h4>
            <form id="quizForm">
                ${questions.map((q, index) => `
                    <div class="quiz-question">
                        <h5>Q${index + 1}. ${q.question}</h5>
                        <div class="quiz-options">
                            ${q.options.map((opt, i) => `
                                <label class="quiz-option">
                                    <input type="radio" name="q${index}" value="${i}" required>
                                    <span>${opt}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <button type="submit" class="btn btn-primary btn-large">제출하기</button>
            </form>
        </div>
    `;
    
    document.getElementById('quizForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitQuiz(questions);
    });
}

function generateQuizQuestions(category) {
    const quizBank = {
        basic: [
            {
                question: '인공지능(AI)의 정의로 가장 적절한 것은?',
                options: ['인간의 학습능력을 모방한 컴퓨터 시스템', '로봇 기술', '인터넷 기술', '데이터베이스 시스템'],
                answer: 0
            },
            {
                question: '머신러닝은 AI의 어떤 분야에 속하는가?',
                options: ['하위 분야', '상위 분야', '무관한 분야', '동일한 개념'],
                answer: 0
            },
            {
                question: '지도학습(Supervised Learning)의 특징은?',
                options: ['레이블이 있는 데이터로 학습', '레이블 없이 패턴 발견', '보상 기반 학습', '규칙 기반 학습'],
                answer: 0
            }
        ],
        intermediate: [
            {
                question: 'Python에서 머신러닝 라이브러리로 가장 많이 사용되는 것은?',
                options: ['scikit-learn', 'jQuery', 'React', 'Angular'],
                answer: 0
            },
            {
                question: '선형회귀에서 사용하는 손실 함수는?',
                options: ['평균 제곱 오차(MSE)', '교차 엔트로피', '힌지 손실', '로그 손실'],
                answer: 0
            },
            {
                question: '랜덤 포레스트는 어떤 알고리즘의 앙상블인가?',
                options: ['의사결정나무', 'SVM', 'KNN', '선형회귀'],
                answer: 0
            }
        ],
        advanced: [
            {
                question: 'CNN의 핵심 레이어가 아닌 것은?',
                options: ['LSTM 레이어', 'Convolution 레이어', 'Pooling 레이어', 'Fully Connected 레이어'],
                answer: 0
            },
            {
                question: 'RNN에서 기울기 소실 문제를 해결하기 위한 구조는?',
                options: ['LSTM', 'CNN', 'ANN', 'SVM'],
                answer: 0
            },
            {
                question: 'GAN의 두 가지 주요 구성 요소는?',
                options: ['생성자와 판별자', '인코더와 디코더', '입력층과 출력층', '컨볼루션과 풀링'],
                answer: 0
            }
        ]
    };
    
    return quizBank[category] || quizBank.basic;
}

function submitQuiz(questions) {
    const form = document.getElementById('quizForm');
    const formData = new FormData(form);
    
    let score = 0;
    const answers = [];
    
    questions.forEach((q, index) => {
        const userAnswer = parseInt(formData.get(`q${index}`));
        const isCorrect = userAnswer === q.answer;
        if (isCorrect) score++;
        answers.push({ question: q.question, userAnswer, correctAnswer: q.answer, isCorrect });
    });
    
    StorageManager.saveQuizResult(currentVideoData.id, score, questions.length, answers);
    showQuizResult(score, questions.length);
}

function showQuizResult(score, total) {
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 70;
    
    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = `
        <div class="quiz-result">
            <div class="result-icon ${passed ? 'pass' : 'fail'}">
                <i class="fas ${passed ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            </div>
            <h3>${passed ? '합격!' : '불합격'}</h3>
            <div class="result-score">
                <span class="score-big">${percentage}%</span>
                <p>${score} / ${total} 정답</p>
            </div>
            <p>${passed ? '축하합니다! 퀴즈를 통과하셨습니다.' : '조금 더 학습 후 다시 도전해보세요.'}</p>
            <div class="result-actions">
                <button class="btn btn-secondary" onclick="closeQuizModal()">닫기</button>
                <button class="btn btn-primary" onclick="loadQuiz()">다시 풀기</button>
            </div>
        </div>
    `;
}

// ===================================
// Video Tabs (Notes / Reviews)
// ===================================
function setupVideoTabs() {
    const tabButtons = document.querySelectorAll('.video-tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(tabName + 'Section');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ===================================
// Review System
// ===================================
function setupReviewSystem() {
    const stars = document.querySelectorAll('.rating-input .star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            updateStarDisplay(selectedRating);
        });
        
        star.addEventListener('mouseenter', function() {
            updateStarDisplay(parseInt(this.dataset.rating));
        });
    });
    
    document.querySelector('.rating-input').addEventListener('mouseleave', function() {
        updateStarDisplay(selectedRating);
    });
    
    const submitBtn = document.getElementById('submitReview');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitReview);
    }
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.rating-input .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitReview() {
    if (!currentVideoData) return;
    
    if (selectedRating === 0) {
        showToast('별점을 선택해주세요', 'error');
        return;
    }
    
    const reviewText = document.getElementById('reviewText').value.trim();
    if (!reviewText) {
        showToast('후기 내용을 입력해주세요', 'error');
        return;
    }
    
    StorageManager.addReview(currentVideoData.id, selectedRating, reviewText);
    loadReviews();
    
    // Reset form
    selectedRating = 0;
    updateStarDisplay(0);
    document.getElementById('reviewText').value = '';
    
    showToast('후기가 등록되었습니다');
}

function loadReviews() {
    if (!currentVideoData) return;
    
    const reviews = StorageManager.getReviews(currentVideoData.id);
    const avgRating = StorageManager.getAverageRating(currentVideoData.id);
    const reviewsList = document.getElementById('reviewsList');
    
    // Update video rating display
    const ratingScore = document.getElementById('ratingScore');
    if (ratingScore) {
        ratingScore.textContent = avgRating;
    }
    
    if (!reviewsList) return;
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="empty-state">아직 작성된 후기가 없습니다.</p>';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-rating">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </div>
                <span class="review-date">${formatDate(review.createdAt)}</span>
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `).join('');
}

// ===================================
// Progress Tracking
// ===================================
function setupProgressTracking() {
    const videoPlayer = document.getElementById('mainVideoPlayer');
    if (!videoPlayer) return;
    
    // Track watch time
    videoPlayer.addEventListener('timeupdate', function() {
        if (!currentVideoData) return;
        
        const currentTime = Math.floor(videoPlayer.currentTime);
        const duration = Math.floor(videoPlayer.duration);
        
        // Update progress every 5 seconds
        if (currentTime - lastWatchTimeUpdate >= 5) {
            StorageManager.addWatchTime(currentVideoData.id, 5);
            lastWatchTimeUpdate = currentTime;
            
            // Save progress
            const completed = (currentTime / duration) > 0.9;
            StorageManager.setProgress(currentVideoData.id, currentTime, duration, completed);
            
            // Update progress indicator
            updateProgressIndicator();
        }
    });
    
    // Resume from last position
    videoPlayer.addEventListener('loadedmetadata', function() {
        if (!currentVideoData) return;
        
        const progress = StorageManager.getProgress(currentVideoData.id);
        if (progress.watched > 10 && !progress.completed) {
            if (confirm('이전에 시청하던 위치에서 계속하시겠습니까?')) {
                videoPlayer.currentTime = progress.watched;
            }
        }
    });
}

function updateProgressIndicator() {
    if (!currentVideoData) return;
    
    const allProgress = StorageManager.getAllProgress();
    const completedCount = Object.values(allProgress).filter(p => p.completed).length;
    const totalVideos = 10; // Update with actual video count
    const percentage = Math.round((completedCount / totalVideos) * 100);
    
    const progressElement = document.getElementById('courseProgress');
    if (progressElement) {
        progressElement.textContent = `${percentage}%`;
    }
}

// ===================================
// Dark Mode
// ===================================
function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Load saved preference
    const settings = StorageManager.getSettings();
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    StorageManager.setSetting('darkMode', isDark);
    updateDarkModeIcon(isDark);
}

function updateDarkModeIcon(isDark) {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;
    
    const icon = toggle.querySelector('i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

// ===================================
// Settings & Utils
// ===================================
function loadSettings() {
    const settings = StorageManager.getSettings();
    
    // Apply playback speed
    const videoPlayer = document.getElementById('mainVideoPlayer');
    if (videoPlayer && settings.playbackSpeed) {
        videoPlayer.playbackRate = settings.playbackSpeed;
        document.getElementById('speedDisplay').textContent = settings.playbackSpeed + 'x';
    }
}

function updateCurrentVideo(videoData) {
    currentVideoData = videoData;
    
    // Update bookmark button
    const isBookmarked = StorageManager.isBookmarked(videoData.id);
    updateBookmarkButton(isBookmarked);
    
    // Load notes and reviews
    loadNotes();
    loadReviews();
    
    // Update progress
    updateProgressIndicator();
    
    // Reset watch time tracking
    lastWatchTimeUpdate = 0;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
}

function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make functions globally available
window.closeNoteModal = closeNoteModal;
window.saveNote = saveNote;
window.deleteNote = deleteNote;
window.seekToTime = seekToTime;
window.closeQuizModal = closeQuizModal;
window.updateCurrentVideo = updateCurrentVideo;
