// Search Functionality for TG에듀테크

class SearchManager {
    constructor() {
        this.searchForm = document.querySelector('.search-form');
        this.searchInput = document.querySelector('.search-input');
        this.searchBtn = document.querySelector('.search-btn');
        
        // 검색 가능한 콘텐츠 데이터
        this.searchData = [
            // 강의 과정
            { type: '강의', title: 'AI 기초 과정', url: 'courses.html?course=ai-basic', keywords: '인공지능 기초 AI 입문' },
            { type: '강의', title: '머신러닝 입문', url: 'courses.html?course=ml-intro', keywords: '머신러닝 ML 기초' },
            { type: '강의', title: '딥러닝 실전', url: 'courses.html?course=dl-advanced', keywords: '딥러닝 DL 고급 실전' },
            { type: '강의', title: '생성형 AI 활용', url: 'courses.html?course=genai', keywords: 'ChatGPT DALL-E 생성형AI GPT' },
            { type: '강의', title: 'AI 데이터 분석', url: 'courses.html?course=data-analysis', keywords: '데이터분석 Python 시각화' },
            { type: '강의', title: 'AI 윤리와 거버넌스', url: 'courses.html?course=ai-ethics', keywords: 'AI윤리 거버넌스 책임' },
            
            // 페이지
            { type: '페이지', title: '교육과정', url: 'courses.html', keywords: '강의 수업 학습 교육' },
            { type: '페이지', title: '학습현황', url: 'dashboard.html', keywords: '대시보드 진도 통계' },
            { type: '페이지', title: '마이페이지', url: 'mypage.html', keywords: '내정보 프로필 설정' },
            { type: '페이지', title: '로그인', url: 'login.html', keywords: '로그인 회원가입 인증' },
            
            // 섹션
            { type: '정보', title: '솔루션', url: 'index.html#solutions', keywords: '서비스 기능 특징' },
            { type: '정보', title: '도입사례', url: 'index.html#cases', keywords: '성공사례 고객 레퍼런스' },
            { type: '정보', title: '회사소개', url: 'index.html#about', keywords: '회사 소개 정보' },
        ];
        
        this.init();
    }
    
    init() {
        if (!this.searchForm) return;
        
        // 폼 제출 이벤트
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });
        
        // 검색 버튼 클릭
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }
        
        // 엔터키 입력
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch();
                }
            });
            
            // 실시간 검색 제안 (옵션)
            this.searchInput.addEventListener('input', () => {
                this.showSuggestions();
            });
        }
    }
    
    performSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        
        if (!query) {
            alert('검색어를 입력해주세요.');
            return;
        }
        
        // 검색 수행
        const results = this.search(query);
        
        if (results.length === 0) {
            alert(`"${query}"에 대한 검색 결과가 없습니다.`);
            return;
        }
        
        // 결과가 1개면 바로 이동
        if (results.length === 1) {
            window.location.href = results[0].url;
            return;
        }
        
        // 여러 결과가 있으면 선택 모달 표시
        this.showSearchResults(query, results);
    }
    
    search(query) {
        return this.searchData.filter(item => {
            const searchText = (item.title + ' ' + item.keywords).toLowerCase();
            return searchText.includes(query);
        });
    }
    
    showSearchResults(query, results) {
        // 검색 결과 모달 생성
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        let html = `
            <div style="padding: 2rem; border-bottom: 1px solid #e5e5e5;">
                <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: #000;">
                    검색 결과
                </h2>
                <p style="margin: 0; color: #666; font-size: 0.875rem;">
                    "${query}"에 대한 ${results.length}개의 결과
                </p>
            </div>
            <div style="padding: 1rem;">
        `;
        
        results.forEach(result => {
            html += `
                <a href="${result.url}" style="
                    display: block;
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                    border-radius: 8px;
                    text-decoration: none;
                    transition: background 0.2s ease;
                    border: 1px solid #e5e5e5;
                " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="
                            padding: 0.25rem 0.5rem;
                            background: var(--primary-color);
                            color: white;
                            border-radius: 4px;
                            font-size: 0.75rem;
                            font-weight: 600;
                        ">${result.type}</span>
                        <span style="color: #000; font-weight: 600; font-size: 1rem;">
                            ${result.title}
                        </span>
                    </div>
                </a>
            `;
        });
        
        html += `
            </div>
            <div style="padding: 1rem 2rem; border-top: 1px solid #e5e5e5; text-align: right;">
                <button onclick="this.closest('.search-modal').remove()" style="
                    padding: 0.625rem 1.5rem;
                    background: #f8f9fa;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: background 0.2s ease;
                " onmouseover="this.style.background='#e5e5e5'" onmouseout="this.style.background='#f8f9fa'">
                    닫기
                </button>
            </div>
        `;
        
        modalContent.innerHTML = html;
        modal.appendChild(modalContent);
        modal.className = 'search-modal';
        
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // ESC 키로 닫기
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        document.body.appendChild(modal);
    }
    
    showSuggestions() {
        const query = this.searchInput.value.trim().toLowerCase();
        
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        const results = this.search(query).slice(0, 5); // 최대 5개만
        
        if (results.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        // 기존 제안 제거
        this.hideSuggestions();
        
        // 제안 목록 생성
        const suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions';
        suggestions.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e5e5e5;
            border-top: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            margin-top: 0;
        `;
        
        results.forEach(result => {
            const item = document.createElement('a');
            item.href = result.url;
            item.style.cssText = `
                display: block;
                padding: 0.75rem 1rem;
                color: #000;
                text-decoration: none;
                border-bottom: 1px solid #f0f0f0;
                transition: background 0.2s ease;
            `;
            item.innerHTML = `
                <span style="
                    display: inline-block;
                    padding: 0.125rem 0.375rem;
                    background: #f0f0f0;
                    color: #666;
                    border-radius: 3px;
                    font-size: 0.75rem;
                    margin-right: 0.5rem;
                ">${result.type}</span>
                ${result.title}
            `;
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f8f9fa';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'white';
            });
            suggestions.appendChild(item);
        });
        
        this.searchForm.parentElement.style.position = 'relative';
        this.searchForm.parentElement.appendChild(suggestions);
    }
    
    hideSuggestions() {
        const existing = document.querySelector('.search-suggestions');
        if (existing) {
            existing.remove();
        }
    }
}

// 페이지 로드 시 검색 기능 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SearchManager();
});
