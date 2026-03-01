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
