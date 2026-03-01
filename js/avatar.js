// ================================
// avatar.js — Logique de l'avatar Navi
// ================================

// ---- Données ----

const MESSAGES = {
  waving: ["Coucou ! Je suis Navi~ 👋", "Salut ! Comment ça va ? ✨"],
  talking: ["Je traite ta demande... 💬", "Voilà ce que je pense ! 🗣️"],
  happy: ["Super ! Tout se passe bien ! 🎉", "Yaaay ! Je suis contente ! ✨"],
  thinking: ["Hmm... laisse-moi réfléchir 🤔", "Je calcule... ⚙️"],
  idle: ["Je suis là si tu as besoin~ 💤", "*regarde autour* 👀"],
};

const CLICK_REACTIONS = [
  { state: "happy", msg: "Tu m'as cliqué ! Hehe~ 😄" },
  { state: "waving", msg: "Je t'écoute ! 👂" },
  { state: "happy", msg: "Concentrons-nous ! 💪" },
  { state: "talking", msg: "Qu'est-ce que je peux faire pour toi ? 💬" },
];

// ---- Références DOM ----

const avatar = document.getElementById("avatar");
const bubble = document.getElementById("bubble");
const bubbleText = document.getElementById("bubble-text");
const mouth = document.getElementById("mouth");
const particles = document.getElementById("particles");

// ---- État interne ----

let resetTimer = null;

// ---- Fonctions ----

/**
 * Change l'état de l'avatar et affiche un message dans la bulle.
 * @param {string} state  - 'idle' | 'talking' | 'happy' | 'waving' | 'thinking'
 * @param {string} [msg]  - Message personnalisé (optionnel)
 */
function setState(state, msg) {
  // Choisit un message aléatoire si aucun n'est fourni
  const text = msg || pickRandom(MESSAGES[state] || MESSAGES.idle);

  // Met à jour la classe de l'avatar
  avatar.className = `avatar ${state}`;

  // Met à jour la bulle avec animation
  bubbleText.textContent = text;
  restartAnimation(bubble);

  // Gère les particules
  updateParticles(state);

  // Gère le style de la bouche
  updateMouth(state);

  // Retour à l'état idle après 5 secondes
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    avatar.className = "avatar idle";
    mouth.className = "mouth";
    mouth.style.cssText = "";
  }, 5000);
}

/**
 * Réaction au clic direct sur l'avatar.
 */
function handleClick() {
  const reaction = pickRandom(CLICK_REACTIONS);
  setState(reaction.state, reaction.msg);
}

// ---- Helpers ----

/** Retourne un élément aléatoire d'un tableau. */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Relance l'animation CSS d'un élément. */
function restartAnimation(el) {
  el.style.animation = "none";
  requestAnimationFrame(() => {
    el.style.animation = "";
  });
}

/** Affiche ou vide les particules selon l'état. */
function updateParticles(state) {
  particles.innerHTML = "";

  if (state === "happy") {
    ["✨", "⭐", "💫"].forEach((emoji) => {
      const p = document.createElement("span");
      p.className = "particle";
      p.textContent = emoji;
      particles.appendChild(p);
    });
  }
}

/** Modifie le style de la bouche selon l'état. */
function updateMouth(state) {
  // Réinitialise
  mouth.style.cssText = "";
  mouth.className = "mouth";

  if (state === "talking") {
    mouth.className = "mouth talking";
  } else if (state === "happy" || state === "waving") {
    mouth.style.width = "18px";
    mouth.style.height = "9px";
  } else if (state === "thinking") {
    mouth.style.width = "10px";
    mouth.style.transform = "translateX(calc(-50% + 2px)) rotate(5deg)";
  }
}

// ---- Messages idle automatiques ----

(function scheduleIdleMessages() {
  function showNextIdle() {
    const delay = 15000 + Math.random() * 20000; // 15-35 secondes
    setTimeout(() => {
      setState("idle");
      showNextIdle();
    }, delay);
  }
  showNextIdle();
})();

// ---- Message de bienvenue au démarrage ----

setTimeout(() => {
  setState("waving", "Salut ! Je suis Navi, ton assistante ! ✨");
}, 500);
