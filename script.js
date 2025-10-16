document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  let allQuotes = []; // Store all quotes for the modal

  // --- Storyline Page Logic ---
  if (path.includes("storyline.html")) {
    const chaptersContainer = document.getElementById('story-container');
    if (chaptersContainer) {
      loadStoryline();
    }

    async function loadStoryline() {
      try {
        const response = await fetch('db.json');
        if (!response.ok) throw new Error('Failed to load storyline data.');
        const data = await response.json();

        allQuotes = data.chapters.map(c => c.quote).filter(Boolean);

        data.chapters.forEach(chapter => {
          const section = document.createElement("section");
          section.className = "chapter";
          section.setAttribute("data-bg", chapter.bg);
          section.setAttribute("data-year", chapter.year);
          const mainImage = (chapter.images && chapter.images.length > 0) ? chapter.images[0] : '';
          section.innerHTML = `
            <img src="${mainImage}" alt="${chapter.title}">
            <div class="content">
              <h2>${chapter.title}</h2>
              <p>${chapter.description}</p>
              ${chapter.quote ? `<blockquote>“${chapter.quote}”</blockquote>` : ""}
            </div>
          `;
          chaptersContainer.appendChild(section);
        });

        // Only initialize scroll effects AFTER chapters are loaded
        if (data.chapters.length > 0) {
          initStorylineScrollEffects();
        }
      } catch (error) {
        console.error(error);
        chaptersContainer.innerHTML = `<p style="text-align: center; padding: 50px; color: white;">Error loading storyline. Please try again later.</p>`;
      }
    }

    function initStorylineScrollEffects() {
      const chapters = document.querySelectorAll(".chapter");
      const transitionOverlay = document.getElementById('transition-overlay');
      
      if (chapters.length === 0) return; // Don't run if no chapters are present

      let isTransitioning = false;

      window.addEventListener("scroll", () => {
        if (isTransitioning) return;

        let scrollPos = window.scrollY + window.innerHeight / 1.5;
        chapters.forEach((chapter, index) => {
          const img = chapter.querySelector("img");
          const rect = chapter.getBoundingClientRect();

          if (img) {
            const offset = rect.top * 0.1;
            img.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
          }

          if (scrollPos > chapter.offsetTop && (!chapters[index + 1] || scrollPos < chapters[index + 1].offsetTop)) {
            if (!chapter.classList.contains('active')) {
              isTransitioning = true;
              transitionOverlay.classList.add('visible');
              setTimeout(() => {
                chapters.forEach(c => c.classList.remove('active'));
                chapter.classList.add("active");
                document.body.style.backgroundColor = chapter.getAttribute("data-bg") || '#111';
                document.documentElement.style.setProperty('--glow-color', chapter.getAttribute('data-bg') || '#ff4d4d');
                transitionOverlay.classList.remove('visible');
                isTransitioning = false;
              }, 600);
            }
          }
        });
      });

      // --- Easter Egg Initializations ---
      initFunFactPopup();
      initQuoteModal();
    }

    function initFunFactPopup() {
      const popup = document.getElementById('fun-fact-popup');
      const chapterContents = document.querySelectorAll('.chapter .content');

      document.body.addEventListener('mousemove', (e) => {
        popup.style.left = `${e.clientX}px`;
        popup.style.top = `${e.clientY}px`;
      });

      chapterContents.forEach(content => {
        content.addEventListener('mouseenter', (e) => {
          const year = e.currentTarget.closest('.chapter').dataset.year;
          if (year) {
            popup.textContent = year;
            popup.classList.add('visible');
          }
        });
        content.addEventListener('mouseleave', () => {
          popup.classList.remove('visible');
        });
      });
    }

    function initQuoteModal() {
      const backgroundXX = document.querySelector('.background-xx');
      const modal = document.getElementById('quote-modal');
      const modalText = document.getElementById('quote-modal-text');
      const closeModal = () => modal.classList.remove('visible');

      backgroundXX.addEventListener('click', () => {
        const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
        modalText.textContent = `“${randomQuote}”`;
        modal.classList.add('visible');
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'quote-modal-close') {
          closeModal();
        }
      });
    }
  }

  // --- Gallery Page Logic ---
  else if (path.includes("gallery.html")) {
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
      // Register the GSAP ScrollTrigger plugin
      gsap.registerPlugin(ScrollTrigger);
      loadGallery();
    }

    async function loadGallery() {
      try {
        const response = await fetch('db.json');
        if (!response.ok) throw new Error('Failed to load gallery data.');
        const data = await response.json();

        data.artworks.forEach(artwork => {
          const item = document.createElement('div');
          item.className = 'gallery-item';
          const img = document.createElement('img');
          img.src = artwork.imageUrl;
          img.alt = artwork.title;
          img.dataset.title = artwork.title;
          img.dataset.year = artwork.year;
          img.dataset.medium = artwork.medium;
          img.dataset.desc = artwork.description;
          item.dataset.category = artwork.category;
          item.appendChild(img);
          galleryContainer.appendChild(item);
        });

        setupLightbox();
        setupFilters(data.artworks);
        setupGalleryScrollAnimations();
      } catch (error) {
        console.error(error);
        galleryContainer.innerHTML = `<p style="text-align: center; padding: 50px; color: white;">Error loading gallery. Please try again later.</p>`;
      }
    }

    function setupLightbox() {
      const lightbox = document.getElementById('lightbox');
      if (!lightbox) return;
      const lightboxImg = document.getElementById('lightbox-img');
      const lightboxTitle = document.getElementById('lightbox-title');
      const lightboxDetails = document.getElementById('lightbox-details');
      const lightboxDesc = document.getElementById('lightbox-desc');
      const closeBtn = document.querySelector('.lightbox-close');

      document.querySelectorAll('.gallery-item img').forEach(image => {
        image.addEventListener('click', () => {
          lightbox.style.display = 'block';
          lightboxImg.src = image.src;
          lightboxTitle.textContent = image.dataset.title;
          lightboxDetails.textContent = `${image.dataset.year} | ${image.dataset.medium}`;
          lightboxDesc.textContent = `"${image.dataset.desc}"`;
        });
      });

      const closeLightbox = () => { lightbox.style.display = 'none'; };
      closeBtn.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    }

    function setupFilters(artworks) {
      const filterContainer = document.getElementById('filter-container');
      if (!filterContainer) return;
      const categories = ['All', ...new Set(artworks.map(art => art.category).filter(Boolean))];
      categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = category;
        if (category === 'All') button.classList.add('active');
        button.addEventListener('click', () => {
          document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          document.querySelectorAll('.gallery-item').forEach(item => {
            item.style.display = (category === 'All' || item.dataset.category === category) ? 'block' : 'none';
          });
        });
        filterContainer.appendChild(button);
      });
    }

    function setupGalleryScrollAnimations() {
      gsap.to(".gallery-item", {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1,
        scrollTrigger: { trigger: ".gallery-grid", start: "top 80%", toggleActions: "play none none reverse" }
      });
    }
  }
});