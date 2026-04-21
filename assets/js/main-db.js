// TG에듀테크 - 메인 페이지 DB 연동

// 전역 변수
let allCourses = [];
let allVideos = [];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async function() {
    await loadCoursesFromDB();
    renderFeaturedCourses();
});

// DB에서 강의 데이터 로드
async function loadCoursesFromDB() {
    try {
        // 강의 데이터 로드
        const coursesResponse = await fetch('tables/courses?limit=100&sort=-created_at');
        const coursesData = await coursesResponse.json();
        
        // 공개 강의만 필터링
        allCourses = (coursesData.data || []).filter(course => course.status === '공개');
        
        // 영상 데이터 로드
        const videosResponse = await fetch('tables/videos?limit=1000&sort=order');
        const videosData = await videosResponse.json();
        allVideos = videosData.data || [];
        
        console.log('강의 로드 완료:', allCourses.length + '개');
        console.log('영상 로드 완료:', allVideos.length + '개');
        
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        // 에러 시 빈 배열 유지
        allCourses = [];
        allVideos = [];
    }
}

// 메인 페이지에 주요 강의 표시
function renderFeaturedCourses() {
    const coursesGrid = document.querySelector('.courses-grid');
    
    if (!coursesGrid) return;
    
    // 강의가 없으면 안내 메시지
    if (allCourses.length === 0) {
        coursesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #718096;">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p style="font-size: 1.1rem;">등록된 강의가 없습니다.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">관리자 페이지에서 강의를 추가해주세요.</p>
            </div>
        `;
        return;
    }
    
    // 최대 6개 강의 표시
    const featuredCourses = allCourses.slice(0, 6);
    
    let html = '';
    
    featuredCourses.forEach(course => {
        // 해당 강의의 영상 개수 계산
        const courseVideos = allVideos.filter(v => v.course_id === course.id);
        const videoCount = courseVideos.length;
        
        // 총 영상 시간 계산
        let totalMinutes = 0;
        courseVideos.forEach(video => {
            if (video.duration) {
                const parts = video.duration.split(':');
                if (parts.length === 2) {
                    totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]);
                }
            }
        });
        const totalHours = Math.floor(totalMinutes / 60);
        const remainMinutes = totalMinutes % 60;
        const durationText = totalHours > 0 ? `${totalHours}시간 ${remainMinutes}분` : `${remainMinutes}분`;
        
        // 난이도 배지 색상
        const levelColors = {
            '입문': '#48bb78',
            '초급': '#4299e1',
            '중급': '#ed8936',
            '고급': '#e53e3e',
            '실무': '#9f7aea'
        };
        const levelColor = levelColors[course.level] || '#718096';
        
        // 썸네일 이미지 (없으면 기본 이미지)
        const thumbnail = course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop';
        
        html += `
            <div class="course-card" onclick="goToCourse('${course.id}')">
                <div class="course-image">
                    <img src="${thumbnail}" alt="${course.title}" onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop'">
                    <div class="course-badge" style="background: ${levelColor};">${course.level || '입문'}</div>
                </div>
                <div class="course-content">
                    <div class="course-category">${course.category || 'AI 교육'}</div>
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description || '최신 AI 기술을 학습하세요'}</p>
                    <div class="course-meta">
                        <span><i class="fas fa-video"></i> ${videoCount}개 강의</span>
                        <span><i class="fas fa-clock"></i> ${durationText}</span>
                    </div>
                    ${course.instructor ? `<div class="course-instructor"><i class="fas fa-user"></i> ${course.instructor}</div>` : ''}
                </div>
            </div>
        `;
    });
    
    coursesGrid.innerHTML = html;
}

// 강의 페이지로 이동
function goToCourse(courseId) {
    window.location.href = `courses.html?course=${courseId}`;
}
