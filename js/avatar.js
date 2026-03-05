// ================================
// avatar.js — Logique de l'avatar Navi
// ================================

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

// ---- Fonctions principales ----

/**
 * Change l'état de l'avatar, affiche un message, et parle si TTS dispo.
 */
function setState(state, msg) {
  const text = msg || pickRandom(MESSAGES[state] || MESSAGES.idle);

  // Met à jour visuel
  avatar.className = `avatar ${state}`;
  bubbleText.textContent = text;
  restartAnimation(bubble);
  updateParticles(state);
  updateMouth(state);

  clearTimeout(resetTimer);

  // 🆕 Essaie de parler via ElevenLabs
  if (VoiceService.config.enabled && !VoiceService.isSpeaking) {
    VoiceService.speak(
      text,
      // onStart : avatar en mode talking + halo
      () => {
        avatar.className = `avatar talking speaking`;
        updateMouth("talking");
        showSoundIndicator(true);
      },
      // onEnd : retour idle
      () => {
        avatar.className = "avatar idle";
        updateMouth("idle");
        showSoundIndicator(false);
        setMessage(null);
      }
    );
  } else {
    // Fallback sans voix : durée estimée
    const duration = VoiceService.estimateDuration(text);
    resetTimer = setTimeout(() => {
      avatar.className = "avatar idle";
      updateMouth("idle");
    }, duration);
  }
}

function handleClick() {
  if (VoiceService.isSpeaking) return;
  const reaction = pickRandom(CLICK_REACTIONS);
  setState(reaction.state, reaction.msg);
}

// ---- Helpers visuels ----

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

function updateMouth(state) {
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

function setMessage(text) {
  bubbleText.textContent = text || "";
}

function showSoundIndicator(visible) {
  let indicator = document.getElementById("sound-indicator");
  if (visible && !indicator) {
    indicator = document.createElement("div");
    indicator.id = "sound-indicator";
    indicator.className = "sound-indicator";
    indicator.textContent = "🔊";
    document.querySelector(".preview-card").appendChild(indicator);
  } else if (!visible && indicator) {
    indicator.remove();
  }
}

function restartAnimation(el) {
  el.style.animation = "none";
  requestAnimationFrame(() => {
    el.style.animation = "";
  });
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- Messages idle automatiques ----
(function scheduleIdleMessages() {
  function next() {
    const delay = 15000 + Math.random() * 20000;
    setTimeout(() => {
      if (!VoiceService.isSpeaking) setState("idle");
      next();
    }, delay);
  }
  next();
})();

// ---- Bienvenue ----
setTimeout(
  () => setState("waving", "Salut ! Je suis Navi, ton assistante ! ✨"),
  500
);
