// ===================================
// Main JavaScript - General Functions
// ===================================

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Dark Mode Toggle
    initializeDarkMode();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all course cards and feature cards
    document.querySelectorAll('.course-card, .feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Dark Mode Functions
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Load saved preference
    if (typeof StorageManager !== 'undefined') {
        const settings = StorageManager.getSettings();
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
            updateDarkModeIcon(true);
        }
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    if (typeof StorageManager !== 'undefined') {
        StorageManager.setSetting('darkMode', isDark);
    }
    updateDarkModeIcon(isDark);
}

function updateDarkModeIcon(isDark) {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;
    
    const icon = toggle.querySelector('i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

