document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const chaptersContainer = document.getElementById('chapters-container');

  async function loadChapters() {
    try {
      const response = await fetch('db.json');
      if (!response.ok) throw new Error('Failed to load chapters data.');
      const data = await response.json();

      data.chapters.forEach(chapter => {
        const chapterEl = document.createElement('section');
        chapterEl.className = 'chapter';
        chapterEl.id = `chapter${chapter.id}`;
        chapterEl.setAttribute('data-bg', chapter.bg);

        chapterEl.innerHTML = `
          <div class="content">
            <div class="text-content">
              <h2>${chapter.title}</h2>
              <p>${chapter.description}</p>
              ${chapter.quote ? `<blockquote>${chapter.quote}</blockquote>` : ''}
            </div>
            <div class="image-content">
              <img src="${chapter.image}" alt="${chapter.title}">
            </div>
          </div>
        `;
        chaptersContainer.appendChild(chapterEl);
      });

      // Now that chapters are loaded, set up the observer
      setupObserver();

    } catch (error) {
      console.error(error);
      chaptersContainer.innerHTML = `<p style="text-align: center; padding: 50px;">Error loading exhibition. Please try again later.</p>`;
    }
  }

  function setupObserver() {
    const chapters = document.querySelectorAll('.chapter');
    const isLight = (hex) => parseInt(hex.slice(1), 16) > 0xffffff / 2;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const bgColor = entry.target.getAttribute('data-bg');
          body.style.backgroundColor = bgColor;
          body.classList.toggle('light-text', isLight(bgColor));
        }
      });
    }, { threshold: 0.55 });

    chapters.forEach(chapter => observer.observe(chapter));
  }

  loadChapters();
});