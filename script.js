document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Smooth Scroll for "Enter Gallery" button ---
    const exploreBtn = document.getElementById('explore-btn');
    const gallerySection = document.getElementById('gallery');

    exploreBtn.addEventListener('click', () => {
        gallerySection.scrollIntoView({ behavior: 'smooth' });
    });

    // --- 2. Animated 'XX' Background ---
    const animatedBg = document.querySelector('.animated-bg');
    const xxCount = 5;
    for (let i = 0; i < xxCount; i++) {
        const shape = document.createElement('div');
        shape.classList.add('xx-shape');
        shape.textContent = 'XX';
        shape.style.top = `${Math.random() * 90}%`;
        shape.style.left = `${Math.random() * 90}%`;
        shape.style.animationDuration = `${Math.random() * 5 + 5}s`; // 5-10s duration
        shape.style.animationDelay = `${Math.random() * 5}s`;
        animatedBg.appendChild(shape);
    }

    // --- 3. Fetch and Display Gallery Artworks ---
    const galleryGrid = document.getElementById('gallery-grid');

    async function fetchArtworks() {
        try {
            const response = await fetch('db.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayArtworks(data.artworks);
        } catch (error) {
            console.error("Could not fetch artworks:", error);
            galleryGrid.innerHTML = '<p>Could not load gallery. Please try again later.</p>';
        }
    }

    function displayArtworks(artworks) {
        galleryGrid.innerHTML = ''; // Clear existing content
        artworks.forEach(artwork => {
            const card = document.createElement('div');
            card.className = 'artwork-card';
            card.innerHTML = `
                <img src="${artwork.imageUrl}" alt="${artwork.title}">
                <div class="info">
                    <h3>${artwork.title}</h3>
                    <p>${artwork.category} - ${artwork.year}</p>
                </div>
            `;
            galleryGrid.appendChild(card);
        });
    }

    // --- 4. Fan Corner with localStorage ---
    const fanForm = document.getElementById('fan-form');
    const fanMessageInput = document.getElementById('fan-message');
    const fanSubmissionsContainer = document.getElementById('fan-submissions');
    const storageKey = 'kawsFanSubmissions';

    function loadSubmissions() {
        const submissions = JSON.parse(localStorage.getItem(storageKey)) || [];
        fanSubmissionsContainer.innerHTML = '';
        submissions.forEach(msg => {
            const submissionDiv = document.createElement('div');
            submissionDiv.className = 'fan-submission';
            submissionDiv.textContent = msg;
            fanSubmissionsContainer.prepend(submissionDiv); // Show newest first
        });
    }

    fanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = fanMessageInput.value.trim();
        if (message) {
            const submissions = JSON.parse(localStorage.getItem(storageKey)) || [];
            submissions.push(message);
            localStorage.setItem(storageKey, JSON.stringify(submissions));
            fanMessageInput.value = '';
            loadSubmissions();
        }
    });

    // --- 5. Extra Polish: Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const themeKey = 'kaws-theme';

    function applyTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-mode');
            themeToggleBtn.textContent = '🌙';
        } else {
            body.classList.remove('light-mode');
            themeToggleBtn.textContent = '💡';
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const isLight = body.classList.contains('light-mode');
        const newTheme = isLight ? 'dark' : 'light';
        localStorage.setItem(themeKey, newTheme);
        applyTheme(newTheme);
    });

    // --- 6. Extra Polish: Scroll-to-Top Button ---
    const scrollTopBtn = document.getElementById('scroll-top-btn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Initial Load ---
    const savedTheme = localStorage.getItem(themeKey) || 'dark';
    applyTheme(savedTheme);
    fetchArtworks();
    loadSubmissions();
});