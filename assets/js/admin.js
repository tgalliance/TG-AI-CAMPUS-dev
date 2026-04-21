// 인증 체크
function checkAuth() {
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// 로그아웃
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminId');
        window.location.href = 'admin-login.html';
    }
}

// 페이지 로드 시 인증 체크
if (!checkAuth()) {
    // 인증 실패 시 리다이렉트
} else {
    // 관리자 이름 표시
    document.getElementById('adminUserName').textContent = sessionStorage.getItem('adminId') || '관리자';
    
    // 데이터 로드
    loadDashboardStats();
    loadCourses();
    loadVideos();
}

// 탭 전환
function switchTab(tab) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 선택된 탭 활성화
    if (tab === 'courses') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('coursesTab').classList.add('active');
    } else if (tab === 'videos') {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('videosTab').classList.add('active');
    }
}

// 대시보드 통계 로드
async function loadDashboardStats() {
    try {
        const coursesResponse = await fetch('tables/courses?limit=1000');
        const coursesData = await coursesResponse.json();
        
        const videosResponse = await fetch('tables/videos?limit=1000');
        const videosData = await videosResponse.json();
        
        const courses = coursesData.data || [];
        const videos = videosData.data || [];
        
        document.getElementById('totalCourses').textContent = courses.length;
        document.getElementById('totalVideos').textContent = videos.length;
        document.getElementById('publicCourses').textContent = courses.filter(c => c.status === '공개').length;
        
        // 총 강의 시간 계산 (예시)
        let totalMinutes = videos.length * 15; // 평균 15분으로 가정
        let hours = Math.floor(totalMinutes / 60);
        document.getElementById('totalDuration').textContent = hours + '시간';
    } catch (error) {
        console.error('통계 로드 실패:', error);
    }
}

// ==================== 강의 관리 ====================

let courses = [];
let editingCourseId = null;

// 강의 목록 로드
async function loadCourses() {
    try {
        const response = await fetch('tables/courses?limit=1000&sort=-created_at');
        const data = await response.json();
        courses = data.data || [];
        renderCoursesTable();
    } catch (error) {
        console.error('강의 로드 실패:', error);
        document.getElementById('coursesTableContainer').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>강의 목록을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 강의 테이블 렌더링
function renderCoursesTable() {
    const container = document.getElementById('coursesTableContainer');
    
    if (courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>등록된 강의가 없습니다.</p>
                <button class="btn btn-primary" onclick="openCourseModal()">
                    <i class="fas fa-plus"></i> 첫 강의 추가하기
                </button>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>제목</th>
                    <th>카테고리</th>
                    <th>난이도</th>
                    <th>상태</th>
                    <th>강사</th>
                    <th>영상 수</th>
                    <th>작업</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    courses.forEach(course => {
        const videoCount = course.video_count || 0;
        const statusColor = course.status === '공개' ? '#48bb78' : (course.status === '비공개' ? '#f56565' : '#ed8936');
        
        html += `
            <tr>
                <td><strong>${course.title}</strong></td>
                <td>${course.category || '-'}</td>
                <td><span style="background: #e2e8f0; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">${course.level || '-'}</span></td>
                <td><span style="background: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">${course.status}</span></td>
                <td>${course.instructor || '-'}</td>
                <td>${videoCount}개</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm" onclick='editCourse("${course.id}")'>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick='deleteCourse("${course.id}", "${course.title}")'>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// 강의 모달 열기
function openCourseModal(courseId = null) {
    editingCourseId = courseId;
    const modal = document.getElementById('courseModal');
    const form = document.getElementById('courseForm');
    
    if (courseId) {
        // 수정 모드
        const course = courses.find(c => c.id === courseId);
        if (course) {
            document.getElementById('courseModalTitle').textContent = '강의 수정';
            document.getElementById('courseId').value = course.id;
            document.getElementById('courseTitle').value = course.title;
            document.getElementById('courseDescription').value = course.description || '';
            document.getElementById('courseCategory').value = course.category || '';
            document.getElementById('courseLevel').value = course.level || '입문';
            document.getElementById('courseThumbnail').value = course.thumbnail || '';
            document.getElementById('courseInstructor').value = course.instructor || '';
            document.getElementById('courseStatus').value = course.status || '공개';
        }
    } else {
        // 추가 모드
        document.getElementById('courseModalTitle').textContent = '강의 추가';
        form.reset();
        document.getElementById('courseId').value = '';
    }
    
    modal.classList.add('active');
}

// 강의 모달 닫기
function closeCourseModal() {
    document.getElementById('courseModal').classList.remove('active');
    document.getElementById('courseForm').reset();
    editingCourseId = null;
}

// 강의 저장
document.getElementById('courseForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const courseId = document.getElementById('courseId').value || 'course_' + Date.now();
    const courseData = {
        id: courseId,
        title: document.getElementById('courseTitle').value,
        description: document.getElementById('courseDescription').value,
        category: document.getElementById('courseCategory').value,
        level: document.getElementById('courseLevel').value,
        thumbnail: document.getElementById('courseThumbnail').value,
        instructor: document.getElementById('courseInstructor').value,
        status: document.getElementById('courseStatus').value,
        video_count: 0,
        duration: '0시간'
    };
    
    try {
        let response;
        if (editingCourseId) {
            // 수정
            response = await fetch(`tables/courses/${editingCourseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });
        } else {
            // 추가
            response = await fetch('tables/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });
        }
        
        if (response.ok) {
            alert(editingCourseId ? '강의가 수정되었습니다!' : '강의가 추가되었습니다!');
            closeCourseModal();
            loadCourses();
            loadDashboardStats();
        } else {
            throw new Error('저장 실패');
        }
    } catch (error) {
        console.error('강의 저장 실패:', error);
        alert('강의 저장에 실패했습니다.');
    }
});

// 강의 수정
function editCourse(courseId) {
    openCourseModal(courseId);
}

// 강의 삭제
async function deleteCourse(courseId, title) {
    if (!confirm(`"${title}" 강의를 삭제하시겠습니까?\n관련된 영상도 모두 삭제됩니다.`)) {
        return;
    }
    
    try {
        const response = await fetch(`tables/courses/${courseId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('강의가 삭제되었습니다!');
            loadCourses();
            loadDashboardStats();
            
            // 관련 영상도 삭제 (선택사항)
            // deleteVideosByCourse(courseId);
        } else {
            throw new Error('삭제 실패');
        }
    } catch (error) {
        console.error('강의 삭제 실패:', error);
        alert('강의 삭제에 실패했습니다.');
    }
}

// ==================== 영상 관리 ====================

let videos = [];
let editingVideoId = null;

// 영상 목록 로드
async function loadVideos() {
    try {
        const response = await fetch('tables/videos?limit=1000&sort=order');
        const data = await response.json();
        videos = data.data || [];
        renderVideosTable();
        updateVideoCoursesDropdown();
    } catch (error) {
        console.error('영상 로드 실패:', error);
        document.getElementById('videosTableContainer').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>영상 목록을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 영상 테이블 렌더링
function renderVideosTable() {
    const container = document.getElementById('videosTableContainer');
    
    if (videos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-video"></i>
                <p>등록된 영상이 없습니다.</p>
                <button class="btn btn-primary" onclick="openVideoModal()">
                    <i class="fas fa-plus"></i> 첫 영상 추가하기
                </button>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>제목</th>
                    <th>소속 강의</th>
                    <th>순서</th>
                    <th>시간</th>
                    <th>URL</th>
                    <th>작업</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    videos.forEach(video => {
        const course = courses.find(c => c.id === video.course_id);
        const courseName = course ? course.title : '(강의 없음)';
        
        html += `
            <tr>
                <td><strong>${video.title}</strong></td>
                <td>${courseName}</td>
                <td>${video.order || 1}</td>
                <td>${video.duration || '-'}</td>
                <td><a href="${video.video_url}" target="_blank" style="color: #667eea; font-size: 0.85rem;"><i class="fas fa-external-link-alt"></i> 보기</a></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm" onclick='editVideo("${video.id}")'>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick='deleteVideo("${video.id}", "${video.title}")'>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// 영상 강의 드롭다운 업데이트
function updateVideoCoursesDropdown() {
    const select = document.getElementById('videoCourseId');
    let options = '<option value="">강의를 선택하세요</option>';
    
    courses.forEach(course => {
        options += `<option value="${course.id}">${course.title}</option>`;
    });
    
    select.innerHTML = options;
}

// 영상 모달 열기
function openVideoModal(videoId = null) {
    editingVideoId = videoId;
    const modal = document.getElementById('videoModal');
    const form = document.getElementById('videoForm');
    
    updateVideoCoursesDropdown();
    
    if (videoId) {
        // 수정 모드
        const video = videos.find(v => v.id === videoId);
        if (video) {
            document.getElementById('videoModalTitle').textContent = '영상 수정';
            document.getElementById('videoId').value = video.id;
            document.getElementById('videoCourseId').value = video.course_id;
            document.getElementById('videoTitle').value = video.title;
            document.getElementById('videoUrl').value = video.video_url;
            document.getElementById('videoDuration').value = video.duration || '';
            document.getElementById('videoOrder').value = video.order || 1;
            document.getElementById('videoDescription').value = video.description || '';
        }
    } else {
        // 추가 모드
        document.getElementById('videoModalTitle').textContent = '영상 추가';
        form.reset();
        document.getElementById('videoId').value = '';
    }
    
    modal.classList.add('active');
}

// 영상 모달 닫기
function closeVideoModal() {
    document.getElementById('videoModal').classList.remove('active');
    document.getElementById('videoForm').reset();
    editingVideoId = null;
}

// 영상 저장
document.getElementById('videoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const videoId = document.getElementById('videoId').value || 'video_' + Date.now();
    const videoData = {
        id: videoId,
        course_id: document.getElementById('videoCourseId').value,
        title: document.getElementById('videoTitle').value,
        video_url: document.getElementById('videoUrl').value,
        duration: document.getElementById('videoDuration').value,
        order: parseInt(document.getElementById('videoOrder').value) || 1,
        description: document.getElementById('videoDescription').value
    };
    
    try {
        let response;
        if (editingVideoId) {
            // 수정
            response = await fetch(`tables/videos/${editingVideoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(videoData)
            });
        } else {
            // 추가
            response = await fetch('tables/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(videoData)
            });
        }
        
        if (response.ok) {
            alert(editingVideoId ? '영상이 수정되었습니다!' : '영상이 추가되었습니다!');
            closeVideoModal();
            loadVideos();
            loadDashboardStats();
            updateCourseVideoCount(videoData.course_id);
        } else {
            throw new Error('저장 실패');
        }
    } catch (error) {
        console.error('영상 저장 실패:', error);
        alert('영상 저장에 실패했습니다.');
    }
});

// 영상 수정
function editVideo(videoId) {
    openVideoModal(videoId);
}

// 영상 삭제
async function deleteVideo(videoId, title) {
    if (!confirm(`"${title}" 영상을 삭제하시겠습니까?`)) {
        return;
    }
    
    try {
        const video = videos.find(v => v.id === videoId);
        const courseId = video.course_id;
        
        const response = await fetch(`tables/videos/${videoId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('영상이 삭제되었습니다!');
            loadVideos();
            loadDashboardStats();
            updateCourseVideoCount(courseId);
        } else {
            throw new Error('삭제 실패');
        }
    } catch (error) {
        console.error('영상 삭제 실패:', error);
        alert('영상 삭제에 실패했습니다.');
    }
}

// 강의별 영상 수 업데이트
async function updateCourseVideoCount(courseId) {
    if (!courseId) return;
    
    try {
        const courseVideos = videos.filter(v => v.course_id === courseId);
        const count = courseVideos.length;
        
        await fetch(`tables/courses/${courseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_count: count })
        });
        
        loadCourses();
    } catch (error) {
        console.error('영상 수 업데이트 실패:', error);
    }
}

// 모달 외부 클릭 시 닫기
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
