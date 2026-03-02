// ================================
// stars.js — Génération des étoiles de fond
// ================================

(function generateStars() {
  const container = document.getElementById("stars");
  const STAR_COUNT = 80;

  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("div");
    star.className = "star";

    const size = Math.random() * 2.5 + 0.5;

    star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        --d: ${Math.random() * 3 + 2}s;
        animation-delay: ${Math.random() * 4}s;
      `;

    container.appendChild(star);
  }
})();
