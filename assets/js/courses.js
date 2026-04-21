// ===================================
// Courses Page JavaScript - DB 연동 버전
// ===================================

// 전역 변수
let allCourses = [];
let allVideos = [];
let videoData = []; // 하위 호환성을 위해 유지

// 페이지 로드 시 DB에서 데이터 가져오기
async function loadCoursesFromDB() {
    try {
        // 강의 데이터 가져오기
        const coursesResponse = await fetch('tables/courses?limit=100');
        const coursesData = await coursesResponse.json();
        allCourses = coursesData.data || [];

        // 영상 데이터 가져오기
        const videosResponse = await fetch('tables/videos?limit=100');
        const videosData = await videosResponse.json();
        allVideos = videosData.data || [];

        // videoData 형식으로 변환 (기존 코드와의 호환성)
        videoData = allVideos.map((video, index) => {
            const course = allCourses.find(c => c.id === video.course_id);
            
            // 카테고리 매핑 (level 기준)
            let category = 'basic';
            if (course && course.level) {
                const level = course.level.toLowerCase();
                if (level.includes('입문') || level.includes('초급')) category = 'basic';
                else if (level.includes('중급')) category = 'intermediate';
                else if (level.includes('고급') || level.includes('실무')) category = 'advanced';
            }
            
            return {
                id: video.id || (index + 1),
                category: category,
                title: video.title,
                description: video.description || '강의 설명이 없습니다.',
                instructor: course ? course.instructor : '강사 미지정',
                duration: video.duration || '00:00',
                views: Math.floor(Math.random() * 3000) + 100,
                thumbnail: getThumbnailFromUrl(video.video_url),
                videoUrl: video.video_url,
                courseId: course ? course.id : null,
                courseName: course ? course.title : '강의 정보 없음',
                level: course ? course.level : '입문'
            };
        });

        console.log(`✅ DB 연동 완료: 강의 ${allCourses.length}개, 영상 ${allVideos.length}개 로드됨`);
        return videoData;

    } catch (error) {
        console.error('❌ DB 데이터 로드 실패:', error);
        console.log('샘플 데이터로 대체합니다.');
        // 실패 시 샘플 데이터 사용
        return getSampleVideoData();
    }
}

// YouTube URL에서 썸네일 추출
function getThumbnailFromUrl(videoUrl) {
    try {
        // YouTube embed URL에서 비디오 ID 추출
        const match = videoUrl.match(/embed\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
    } catch (e) {
        console.error('썸네일 추출 실패:', e);
    }
    // 기본 이미지
    return 'https://via.placeholder.com/400x225?text=Video';
}

// 샘플 데이터 (DB 연결 실패 시 사용)
function getSampleVideoData() {
    return [
        {
            id: 1,
            category: 'basic',
            title: 'AI 기초 - 인공지능이란 무엇인가?',
            description: '인공지능의 기본 개념과 역사를 배웁니다.',
            instructor: '김AI 교수',
            duration: '15:30',
            views: '1,234',
            thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop',
            videoUrl: 'https://www.youtube.com/embed/aircAruvnKk'
        },
        {
            id: 2,
            category: 'basic',
            title: 'AI 기초 - 머신러닝의 개념',
            description: '머신러닝의 기본 원리를 이해합니다.',
            instructor: '김AI 교수',
            duration: '18:45',
            views: '956',
            thumbnail: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=225&fit=crop',
            videoUrl: 'https://www.youtube.com/embed/aircAruvnKk'
        },
        {
            id: 3,
            category: 'intermediate',
            title: '중급 - Python으로 시작하는 머신러닝',
            description: 'Python과 scikit-learn을 활용한 첫 머신러닝 모델 구축하기',
            instructor: '이코드 개발자',
            duration: '25:15',
            views: '1,567',
            thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
            videoUrl: 'https://www.youtube.com/embed/aircAruvnKk'
        }
    ];
}

// URL 파라미터 가져오기
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 특정 영상 ID 가져오기
function getVideoById(videoId) {
    return videoData.find(v => v.id == videoId) || videoData[0];
}

// 카테고리별 영상 필터링
function getVideosByCategory(category) {
    if (category === 'all') return videoData;
    return videoData.filter(v => v.category === category);
}

// 페이지 초기화
async function initCoursesPage() {
    console.log('🚀 강의 페이지 초기화 중...');
    
    // 기본 동영상 즉시 재생
    const videoPlayer = document.getElementById('mainVideoPlayer');
    if (videoPlayer) {
        console.log('▶️ 기본 동영상 자동 재생');
        videoPlayer.src = 'images/course-video.mp4';
        videoPlayer.load();
        videoPlayer.play().catch(e => console.log('자동 재생 차단됨:', e));
    }
    
    // DB에서 데이터 로드
    await loadCoursesFromDB();
    
    console.log(`📚 총 ${videoData.length}개의 영상 로드 완료`);
    
    // 플레이리스트 렌더링
    renderPlaylist(videoData);
    
    // 탭 이벤트 설정
    setupCourseTabs();
    
    // URL 파라미터 확인
    const videoId = getUrlParameter('video');
    const courseId = getUrlParameter('course');
    
    if (videoId) {
        console.log(`▶️ 영상 ID ${videoId} 재생 요청`);
        const video = getVideoById(videoId);
        if (video && typeof playVideo === 'function') {
            playVideo(video);
        }
    } else if (courseId) {
        console.log(`📖 강의 ID ${courseId} 재생 요청`);
        // 첫 번째 영상 자동 재생
        if (videoData.length > 0 && typeof playVideo === 'function') {
            playVideo(videoData[0]);
        }
    }
    // else: 기본 동영상이 이미 재생 중이므로 아무것도 안 함
}

// 플레이리스트 렌더링
function renderPlaylist(videos) {
    const container = document.getElementById('playlistContainer');
    const countElement = document.getElementById('playlistCount');
    
    if (!container) return;
    
    countElement.textContent = `총 ${videos.length}개`;
    
    if (videos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">등록된 강의가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = videos.map((video, index) => `
        <div class="playlist-item" onclick="playVideoFromPlaylist(${index})">
            <div class="playlist-number">${index + 1}</div>
            <div class="playlist-info">
                <h4>${video.title}</h4>
                <p>${video.courseName || '강의 정보 없음'}</p>
                <span class="playlist-duration">
                    <i class="fas fa-clock"></i> ${video.duration}
                </span>
            </div>
        </div>
    `).join('');
}

// 플레이리스트에서 영상 재생
function playVideoFromPlaylist(index) {
    if (videoData[index] && typeof playVideo === 'function') {
        playVideo(videoData[index]);
    }
}

// 강의 탭 설정
function setupCourseTabs() {
    const tabs = document.querySelectorAll('.course-tabs .tab-btn');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 탭 활성화 상태 변경
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 카테고리 필터링
            const category = this.dataset.category;
            const filteredVideos = category === 'all' ? videoData : getVideosByCategory(category);
            renderPlaylist(filteredVideos);
        });
    });
}

// 전역으로 노출
window.playVideoFromPlaylist = playVideoFromPlaylist;

// 영상 재생 함수
function playVideo(video) {
    if (!video) return;
    
    console.log('▶️ 영상 재생:', video.title);
    
    // 영상 플레이어 업데이트
    const videoPlayer = document.getElementById('mainVideoPlayer');
    const videoTitle = document.getElementById('videoTitle');
    const videoInstructor = document.getElementById('videoInstructor');
    const videoDuration = document.getElementById('videoDuration');
    const videoDescription = document.getElementById('videoDescription');
    
    if (videoPlayer) {
        videoPlayer.src = video.videoUrl;
        videoPlayer.load();
        videoPlayer.play().catch(e => console.log('자동 재생 차단됨:', e));
    }
    
    if (videoTitle) videoTitle.textContent = video.title;
    if (videoInstructor) videoInstructor.innerHTML = `<i class="fas fa-user"></i> ${video.instructor}`;
    if (videoDuration) videoDuration.innerHTML = `<i class="fas fa-clock"></i> ${video.duration}`;
    if (videoDescription) {
        videoDescription.innerHTML = `
            <p><strong>${video.courseName}</strong></p>
            <p>${video.description}</p>
        `;
    }
    
    // currentVideoData 업데이트 (노트/후기 기능용)
    if (window.currentVideoData !== undefined) {
        window.currentVideoData = {
            id: video.id,
            title: video.title,
            instructor: video.instructor,
            duration: video.duration
        };
    }
    
    // 플레이리스트 활성 상태 업데이트
    updatePlaylistActiveState(video.id);
}

// 플레이리스트 활성 상태 업데이트
function updatePlaylistActiveState(videoId) {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (videoData[index] && videoData[index].id == videoId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 전역으로 노출
window.playVideo = playVideo;

// 페이지 로드 시 자동 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoursesPage);
} else {
    initCoursesPage();
}

// 외부에서 접근 가능하도록 전역으로 export
window.videoData = videoData;
window.loadCoursesFromDB = loadCoursesFromDB;
window.getVideoById = getVideoById;
window.getVideosByCategory = getVideosByCategory;
