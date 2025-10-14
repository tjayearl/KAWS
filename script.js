document.addEventListener('DOMContentLoaded', () => {
  fetch("db.json")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("chapters-container");

      data.chapters.forEach(chapter => {
        const section = document.createElement("section");
        section.classList.add("chapter");
        section.setAttribute("data-bg", chapter.bg);

        section.innerHTML = `
          <img src="${chapter.image}" alt="${chapter.title}">
          <div class="content">
            <h2>${chapter.title}</h2>
            <p>${chapter.description}</p>
            ${chapter.quote ? `<blockquote>“${chapter.quote}”</blockquote>` : ""}
          </div>
        `;
        container.appendChild(section);
      });

      initScrollEffects();
    })
    .catch(err => console.error("Error loading db.json:", err));

  function initScrollEffects() {
    const chapters = document.querySelectorAll(".chapter");

    window.addEventListener("scroll", () => {
      // The timeline nav and progress bar are no longer driven by this script.
      // This logic now only handles the active state and background color.
      let scrollPos = window.scrollY + window.innerHeight / 1.5;

      chapters.forEach((chapter, index) => {
        const img = chapter.querySelector("img");
        const rect = chapter.getBoundingClientRect();

        // Subtle parallax motion
        if (img) {
          const offset = rect.top * 0.1;
          img.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
        }

        // Active section animation
        if (scrollPos > chapter.offsetTop && (!chapters[index + 1] || scrollPos < chapters[index + 1].offsetTop)) {
          if (!chapter.classList.contains('active')) {
            chapters.forEach(c => c.classList.remove('active'));
          chapter.classList.add("active"); // Activate only the current one
            document.body.style.backgroundColor = chapter.getAttribute("data-bg");
          }
        }
      });
    });
  }
});