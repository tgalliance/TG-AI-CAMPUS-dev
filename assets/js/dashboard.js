// ===================================
// Dashboard JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    loadStatistics();
    loadCharts();
    loadInProgressCourses();
    loadBookmarkedCourses();
    loadRecentNotes();
    loadQuizResults();
}

// Load Statistics
function loadStatistics() {
    const stats = StorageManager.getStatistics();
    
    document.getElementById('totalCoursesWatched').textContent = stats.coursesWatched;
    document.getElementById('totalTimeSpent').textContent = stats.totalWatchTimeMinutes + '분';
    document.getElementById('completedCourses').textContent = stats.completedCourses;
    document.getElementById('bookmarkedCourses').textContent = stats.bookmarkedCourses;
}

// Load Charts
function loadCharts() {
    loadCategoryChart();
    loadWeeklyChart();
}

// Category Chart
function loadCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Import video data from courses.js (we'll use sample data here)
    const categoryStats = {
        basic: Math.floor(Math.random() * 5),
        intermediate: Math.floor(Math.random() * 5),
        advanced: Math.floor(Math.random() * 5)
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['기초', '중급', '고급'],
            datasets: [{
                data: [categoryStats.basic, categoryStats.intermediate, categoryStats.advanced],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(79, 172, 254, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Weekly Chart
function loadWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    
    const weeklyData = StorageManager.getWeeklyStats();
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['월', '화', '수', '목', '금', '토', '일'],
            datasets: [{
                label: '학습 시간 (분)',
                data: weeklyData,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 10
                    }
                }
            }
        }
    });
}

// Load In-Progress Courses
function loadInProgressCourses() {
    const container = document.getElementById('inProgressCourses');
    if (!container) return;
    
    const progress = StorageManager.getAllProgress();
    const inProgress = Object.entries(progress).filter(([id, data]) => !data.completed && data.watched > 0);
    
    if (inProgress.length === 0) {
        container.innerHTML = '<p class="empty-state">진행 중인 강의가 없습니다. <a href="courses.html">강의 보러 가기</a></p>';
        return;
    }
    
    container.innerHTML = inProgress.map(([videoId, data]) => {
        const percentage = Math.round((data.watched / data.duration) * 100);
        return `
            <div class="progress-course-card">
                <div class="course-progress-info">
                    <h4>강의 ${videoId}</h4>
                    <p>마지막 시청: ${formatDate(data.lastWatched)}</p>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentage}%"></div>
                    <span class="progress-text">${percentage}%</span>
                </div>
                <a href="courses.html?video=${videoId}" class="btn btn-sm btn-primary">이어보기</a>
            </div>
        `;
    }).join('');
}

// Load Bookmarked Courses
function loadBookmarkedCourses() {
    const container = document.getElementById('bookmarkedCoursesList');
    if (!container) return;
    
    const bookmarks = StorageManager.getBookmarks();
    
    if (bookmarks.length === 0) {
        container.innerHTML = '<p class="empty-state">북마크한 강의가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = bookmarks.map(videoId => `
        <div class="bookmarked-course-card">
            <div class="bookmark-icon">
                <i class="fas fa-bookmark"></i>
            </div>
            <div class="bookmark-info">
                <h4>강의 ${videoId}</h4>
                <a href="courses.html?video=${videoId}" class="btn btn-sm btn-outline">강의 보기</a>
            </div>
            <button onclick="removeBookmark(${videoId})" class="btn-icon" title="북마크 제거">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Load Recent Notes
function loadRecentNotes() {
    const container = document.getElementById('recentNotes');
    if (!container) return;
    
    const allNotes = StorageManager.getAllNotes();
    const recentNotes = [];
    
    // Flatten all notes and sort by date
    Object.entries(allNotes).forEach(([videoId, notes]) => {
        notes.forEach(note => {
            recentNotes.push({ ...note, videoId });
        });
    });
    
    recentNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const topNotes = recentNotes.slice(0, 5);
    
    if (topNotes.length === 0) {
        container.innerHTML = '<p class="empty-state">작성한 노트가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = topNotes.map(note => `
        <div class="note-card">
            <div class="note-header">
                <span class="note-video">강의 ${note.videoId}</span>
                <span class="note-timestamp">${formatTimestamp(note.timestamp)}</span>
            </div>
            <p class="note-text">${note.text}</p>
            <span class="note-date">${formatDate(note.createdAt)}</span>
        </div>
    `).join('');
}

// Load Quiz Results
function loadQuizResults() {
    const container = document.getElementById('quizResults');
    if (!container) return;
    
    const allResults = StorageManager.getAllQuizResults();
    const results = [];
    
    Object.entries(allResults).forEach(([videoId, quizzes]) => {
        quizzes.forEach(quiz => {
            results.push({ ...quiz, videoId });
        });
    });
    
    results.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    const recentResults = results.slice(0, 5);
    
    if (recentResults.length === 0) {
        container.innerHTML = '<p class="empty-state">완료한 퀴즈가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = recentResults.map(result => `
        <div class="quiz-result-card">
            <div class="quiz-result-header">
                <h4>강의 ${result.videoId} - 퀴즈</h4>
                <span class="quiz-date">${formatDate(result.completedAt)}</span>
            </div>
            <div class="quiz-score">
                <div class="score-circle ${result.percentage >= 70 ? 'pass' : 'fail'}">
                    ${result.percentage}%
                </div>
                <div class="score-details">
                    <p>${result.score} / ${result.totalQuestions} 정답</p>
                    <p class="score-status">${result.percentage >= 70 ? '합격' : '불합격'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper Functions
function formatDate(dateString) {
    if (!dateString) return '-';
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

function formatTimestamp(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function removeBookmark(videoId) {
    StorageManager.toggleBookmark(videoId);
    loadBookmarkedCourses();
    loadStatistics();
}
