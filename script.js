// ==========================================
// CONFIGURATION - EDIT THIS!
// ==========================================
// Change this to your WhatsApp phone number (with country code, e.g. "628123456789" or "1234567890")
// If left empty, it will open WhatsApp for her to choose whom to send it to.
const YOUR_PHONE_NUMBER = ""; 

// ==========================================
// STATE MANAGEMENT
// ==========================================
let dodgeCount = 0;
let chaseStartTime = null;
let hasInteracted = false;
let isSadState = false;
let selectedFood = "";
let selectedActivity = "";
let selectedDate = "";

// Pleading text messages for the No button
const pleadingTexts = [
  "Are you sure? 🥺",
  "Think about it again! 😭",
  "I'll buy you sweet treats! 🍰",
  "But I planned everything... 🥺",
  "Pretty please? 💕",
  "No is not an option! 😤",
  "Look at my crying face... 🐱",
  "I'll do the dishes forever! 🧼",
  "Just click Yes already! 😂"
];

// ==========================================
// SOUND SYNTHESIZER (Web Audio API)
// ==========================================
// Synthesizes a cute, cartoonish "meow" or whimper sound entirely in-browser
function playMeowSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Create oscillator nodes
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'triangle';
    osc2.type = 'sawtooth';
    
    // Meow sound shape (sweeping pitch up, then down)
    const now = ctx.currentTime;
    
    // Pitch envelope for oscillator 1 ("me-ow")
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.exponentialRampToValueAtTime(700, now + 0.15); // "me" part
    osc1.frequency.exponentialRampToValueAtTime(450, now + 0.55); // "ow" part
    
    // Pitch envelope for oscillator 2 (harmonizer)
    osc2.frequency.setValueAtTime(160, now);
    osc2.frequency.exponentialRampToValueAtTime(350, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(225, now + 0.55);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.08); // fade in slightly
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6); // fade out slowly
    
    // Mix and connect
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.error("Web Audio Meow error:", e);
  }
}

// Synthesizes a happy celebration chime
function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Play a sequence of 3 quick notes rising in pitch
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gainNode.gain.setValueAtTime(0.001, now + idx * 0.08);
      gainNode.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  } catch (e) {
    console.error("Web Audio Chime error:", e);
  }
}

// ==========================================
// FLOATING HEARTS GENERATOR
// ==========================================
function initBackgroundHearts() {
  const container = document.getElementById("hearts-container");
  const heartEmojis = ["💖", "💗", "🌸", "💕", "🐾", "⭐"];
  
  setInterval(() => {
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    heart.innerText = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    
    // Random position and timing attributes
    const size = Math.random() * 1.5 + 0.8; // 0.8rem to 2.3rem
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = size + "rem";
    heart.style.animationDuration = Math.random() * 4 + 6 + "s"; // 6s to 10s
    heart.style.animationDelay = Math.random() * 2 + "s";
    
    container.appendChild(heart);
    
    // Cleanup after animation ends
    setTimeout(() => {
      heart.remove();
    }, 10000);
  }, 450);
}

// Custom Confetti Burst on Success
function triggerConfetti() {
  const colors = ["#FF4D6D", "#FF85A1", "#C084FC", "#9333EA", "#FFC6FF", "#CAFFBF"];
  const body = document.body;
  
  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 8 + 6 + "px";
    confetti.style.height = confetti.style.width;
    confetti.style.top = "-20px";
    confetti.style.animationDelay = Math.random() * 1.5 + "s";
    confetti.style.animationDuration = Math.random() * 2 + 1.5 + "s";
    
    body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 4000);
  }
}

// ==========================================
// BACKGROUND MUSIC ENGINE (Local BGM Audio)
// ==========================================
// Use a local or packaged BGM file in `assets/bgm.mp3` (replace if needed)
const BGM_SRC = "assets/bgm.mp3";
let bgmAudio = new Audio(BGM_SRC);
bgmAudio.loop = true;
bgmAudio.preload = 'auto';
bgmAudio.volume = 0.6;
let isMusicPlaying = false;
// Start muted autoplay attempt — many browsers allow muted autoplay
bgmAudio.muted = true;

document.addEventListener('DOMContentLoaded', () => {
  bgmAudio.play().then(() => {
    isMusicPlaying = true;
    const btn = document.getElementById('music-btn');
    if (btn) btn.classList.add('playing');
    console.log('bgm autoplay (muted) succeeded');
  }).catch(err => {
    console.log('bgm autoplay (muted) prevented or failed:', err);
  });
});

function startMusic() {
  const btn = document.getElementById("music-btn");
  if (!hasInteracted) return;
  try {
    // If audio was previously autoplayed muted, unmute here and keep playing
    if (bgmAudio.muted) {
      bgmAudio.muted = false;
      bgmAudio.volume = 0.6;
      // attempt to play after unmuting
      bgmAudio.play().then(() => {
        isMusicPlaying = true;
        if (btn) btn.classList.add('playing');
        console.log('bgm unmuted and played on user interaction');
      }).catch(err => {
        console.warn('bgm play after unmute prevented:', err);
      });
      return;
    }

    bgmAudio.play().then(() => {
      isMusicPlaying = true;
      if (btn) btn.classList.add('playing');
    }).catch(err => {
      console.warn('bgm play prevented:', err);
    });
  } catch (e) {
    console.warn('startMusic error', e);
  }
}

function toggleMusic() {
  const btn = document.getElementById("music-btn");
  if (isMusicPlaying) {
    bgmAudio.pause();
    isMusicPlaying = false;
    if (btn) btn.classList.remove('playing');
  } else {
    bgmAudio.play().then(() => {
      isMusicPlaying = true;
      if (btn) btn.classList.add('playing');
    }).catch(err => {
      console.warn('bgm play prevented:', err);
    });
  }
}

function handleFirstInteraction() {
  if (!hasInteracted) {
    hasInteracted = true;
    if (location && location.protocol === 'file:') {
      console.warn('Page is loaded via file:// — some browsers limit media playback; consider serving via localhost.');
    }
    // ensure audio is loaded and then start
    bgmAudio.load();
    // If the audio was autoplayed muted, unmute now so user hears it immediately
    if (bgmAudio.muted) {
      bgmAudio.muted = false;
      bgmAudio.volume = 0.6;
      // Try to play now that we have a user gesture
      bgmAudio.play().then(() => {
        isMusicPlaying = true;
        const btn = document.getElementById('music-btn');
        if (btn) btn.classList.add('playing');
        console.log('bgm unmuted and played via first interaction');
      }).catch(err => {
        console.warn('bgm play after unmute prevented:', err);
      });
    } else {
      startMusic();
    }
    document.removeEventListener("touchstart", handleFirstInteraction);
    document.removeEventListener("click", handleFirstInteraction);
  }
}

// ==========================================
// BUTTON INTERACTIONS (INVITATION SCREEN)
// ==========================================
function initButtonInteractions() {
  const btnNo = document.getElementById("btn-no");
  const btnYes = document.getElementById("btn-yes");
  
  // Start chase timer as soon as cursor moves inside page
  document.addEventListener("mousemove", () => {
    if (!chaseStartTime) chaseStartTime = Date.now();
  }, { once: true });
  
  // Dodge mechanics for Hover/Touch
  function dodgeButton() {
    dodgeCount++;
    // ensure cooldown timestamp updated when dodge happens
    lastDodgeTime = Date.now();
    
    // Play meow sound effect on dodge (playful)
    if (dodgeCount % 2 === 0) {
      playMeowSound();
    }
    
    // Put "No" button in fixed dodge mode if it isn't already
    if (!btnNo.classList.contains("dodging")) {
      btnNo.classList.add("dodging");
      document.body.appendChild(btnNo); // Append to body to avoid container containment/overflow clipping!
    }
    
    // Teleport button to random viewport coordinates
    // Keeping safe padding from edges
    const padding = 60;
    const maxX = Math.max(padding, window.innerWidth - btnNo.offsetWidth - padding);
    const maxY = Math.max(padding, window.innerHeight - btnNo.offsetHeight - padding);

    // Try multiple times to place the button away from the last pointer position
    let attempts = 0;
    let placed = false;
    while (!placed && attempts < 12) {
      attempts++;
      const candidateX = Math.max(padding, Math.floor(Math.random() * maxX));
      const candidateY = Math.max(padding, Math.floor(Math.random() * maxY));
      // If we have pointer coords, ensure candidate is sufficiently far
      if (lastPointerX !== null && lastPointerY !== null) {
        const centerX = candidateX + btnNo.offsetWidth / 2;
        const centerY = candidateY + btnNo.offsetHeight / 2;
        const dx = lastPointerX - centerX;
        const dy = lastPointerY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const safeDistance = Math.max(220, btnNo.offsetWidth * 1.5);
        if (dist > safeDistance) {
          btnNo.style.left = candidateX + "px";
          btnNo.style.top = candidateY + "px";
          placed = true;
        }
      } else {
        btnNo.style.left = candidateX + "px";
        btnNo.style.top = candidateY + "px";
        placed = true;
      }
    }
    // If still not placed far enough, leave it where it is but briefly disable pointer events
    btnNo.style.pointerEvents = 'none';
    setTimeout(() => { btnNo.style.pointerEvents = ''; }, 300);
    
    // Scale up the "Yes" button (getting bigger and bigger!)
    const currentScale = 1 + (dodgeCount * 0.75);
    btnYes.style.transform = `scale(${currentScale})`;
    
    // Shift pleading texts
    const textIndex = (dodgeCount - 1) % pleadingTexts.length;
    btnNo.innerHTML = pleadingTexts[textIndex];
    
    // Check if sad-mode is triggered (10 seconds chased or 5 dodges)
    checkSadStateTrigger();
  }
  
  // Proximity detection: if cursor gets near the No button, dodge
  let lastDodgeTime = 0;
  const DODGE_COOLDOWN = 400; // ms (ensure non-zero)
  let lastPointerX = null;
  let lastPointerY = null;
  let lastPointerDistance = null;
  function proximityCheck(e) {
    const now = Date.now();
    if (now - lastDodgeTime < DODGE_COOLDOWN) return;
    const rect = btnNo.getBoundingClientRect();
    const btnX = rect.left + rect.width / 2;
    const btnY = rect.top + rect.height / 2;
    let clientX, clientY;
    if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
      clientX = e.clientX; clientY = e.clientY;
    } else if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches[0]) {
      clientX = e.changedTouches[0].clientX; clientY = e.changedTouches[0].clientY;
    } else {
      return;
    }
    // store last known pointer
    lastPointerX = clientX; lastPointerY = clientY;
    const dx = clientX - btnX;
    const dy = clientY - btnY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const THRESHOLD = Math.max(220, rect.width * 1.2); // px — increased to make it harder to reach

    // Only dodge when pointer is moving toward the button (prevents premature first moves)
    let approaching = true;
    if (lastPointerDistance !== null) {
      approaching = dist < (lastPointerDistance - 6); // must be noticeably closer than before
    }
    lastPointerDistance = dist;

    if (dist <= THRESHOLD && approaching) {
      lastDodgeTime = now;
      lastPointerDistance = null; // reset so next approach must be deliberate
      dodgeButton();
    }
  }

  document.addEventListener('mousemove', proximityCheck);
  document.addEventListener('touchmove', proximityCheck, { passive: true });

  // Also keep direct hover/click/touchstart handlers as fallback
  btnNo.addEventListener("mouseover", () => {
    if (Date.now() - lastDodgeTime >= DODGE_COOLDOWN) dodgeButton();
  });
  btnNo.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (Date.now() - lastDodgeTime >= DODGE_COOLDOWN) {
      lastDodgeTime = Date.now();
      dodgeButton();
    }
  });
  btnNo.addEventListener("click", (e) => {
    e.preventDefault();
    if (Date.now() - lastDodgeTime >= DODGE_COOLDOWN) dodgeButton();
  });
  
  // Yes Button Click - Transition to Planner
  btnYes.addEventListener("click", () => {
    playChimeSound();
    btnNo.remove(); // Remove the No button completely once Yes is clicked!
    transitionToScreen("planner-screen");
    triggerConfetti();
  });
}

function checkSadStateTrigger() {
  const elapsed = chaseStartTime ? (Date.now() - chaseStartTime) : 0;
  
  if ((elapsed >= 10000 || dodgeCount >= 5) && !isSadState) {
    isSadState = true;
    
    // Transition DOM to sad layout
    const banner = document.getElementById("main-kitten-img");
    banner.src = "assets/sad_kitten.png";
    
    const header = document.getElementById("main-header");
    header.innerText = "Why are you running away? 😭😭";
    
    // Play specialized sad synth meow crying sequence
    playMeowSound();
    setTimeout(playMeowSound, 400);
    
    // Keep playing crying sounds periodically to be cute and persuasive
    const cryingInterval = setInterval(() => {
      if (document.getElementById("invitation-screen").classList.contains("active")) {
        playMeowSound();
      } else {
        clearInterval(cryingInterval);
      }
    }, 4000);
  }
}

// Screen Transition Engine
function transitionToScreen(screenId) {
  const activeScreen = document.querySelector(".screen.active");
  const targetScreen = document.getElementById(screenId);
  
  if (activeScreen) {
    activeScreen.style.opacity = "0";
    activeScreen.style.transform = "translateY(-20px)";
    
    setTimeout(() => {
      activeScreen.classList.remove("active");
      targetScreen.classList.add("active");
      
      // Let it render first, then fade/slide up
      setTimeout(() => {
        targetScreen.style.opacity = "1";
        targetScreen.style.transform = "translateY(0)";
      }, 50);
    }, 400);
  } else {
    targetScreen.classList.add("active");
    setTimeout(() => {
      targetScreen.style.opacity = "1";
      targetScreen.style.transform = "translateY(0)";
    }, 50);
  }
}

// ==========================================
// PLANNER SCREEN LOGIC
// ==========================================
function initPlannerLogic() {
  // Food Card Selection
  const foodCards = document.querySelectorAll(".food-option");
  const customFoodInput = document.getElementById("custom-food-input");
  
  foodCards.forEach(card => {
    card.addEventListener("click", () => {
      foodCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const val = card.getAttribute("data-value");
      
      if (val === "custom") {
        customFoodInput.style.display = "block";
        customFoodInput.focus();
        selectedFood = customFoodInput.value ? ("Custom: " + customFoodInput.value) : "";
      } else {
        customFoodInput.style.display = "none";
        selectedFood = val;
      }
      playChimeSound();
      checkPlannerCompletion();
    });
  });
  
  // Custom Food Input keyboard listener
  customFoodInput.addEventListener("input", () => {
    selectedFood = customFoodInput.value ? ("Custom: " + customFoodInput.value) : "";
    checkPlannerCompletion();
  });
  
  // Activity Card Selection
  const activityCards = document.querySelectorAll(".activity-option");
  const customActivityInput = document.getElementById("custom-activity-input");
  
  activityCards.forEach(card => {
    card.addEventListener("click", () => {
      activityCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const val = card.getAttribute("data-value");
      
      if (val === "custom") {
        customActivityInput.style.display = "block";
        customActivityInput.focus();
        selectedActivity = customActivityInput.value ? ("Custom: " + customActivityInput.value) : "";
      } else {
        customActivityInput.style.display = "none";
        selectedActivity = val;
      }
      playChimeSound();
      checkPlannerCompletion();
    });
  });
  
  // Custom Activity Input keyboard listener
  customActivityInput.addEventListener("input", () => {
    selectedActivity = customActivityInput.value ? ("Custom: " + customActivityInput.value) : "";
    checkPlannerCompletion();
  });

  // June 20th Date Options Selection
  const dateCards = document.querySelectorAll(".date-option");
  dateCards.forEach(card => {
    card.addEventListener("click", () => {
      dateCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedDate = card.getAttribute("data-value");
      playChimeSound();
      checkPlannerCompletion();
    });
  });
  
  document.getElementById("btn-submit-planner").addEventListener("click", () => {
    playChimeSound();
    showSuccessScreen();
  });
}

function checkPlannerCompletion() {
  const submitBtn = document.getElementById("btn-submit-planner");
  
  if (selectedFood && selectedActivity && selectedDate) {
    submitBtn.removeAttribute("disabled");
    submitBtn.style.opacity = "1";
  } else {
    submitBtn.setAttribute("disabled", "true");
    submitBtn.style.opacity = "0.6";
  }
}

// ==========================================
// SUCCESS SCREEN & TEXT COMPILER
// ==========================================
function showSuccessScreen() {
  // Populate summary UI
  document.getElementById("summary-food").innerText = selectedFood;
  document.getElementById("summary-activity").innerText = selectedActivity;
  document.getElementById("summary-date").innerText = selectedDate;
  
  transitionToScreen("success-screen");
  triggerConfetti();
  
  // Play double chime
  playChimeSound();
  setTimeout(playChimeSound, 300);
  
  // Setup Email Send link
  const btnEmail = document.getElementById("btn-email");
  btnEmail.addEventListener("click", () => {
    const subject = encodeURIComponent("Yes! I would love to go on a date with you! 💖");
    const body = encodeURIComponent(`Hi! I would love to go on a date with you! 💖\n\n🍽️ Dinner: ${selectedFood}\n🎡 Activity: ${selectedActivity}\n📅 Date & Time: ${selectedDate}\n\nCan't wait! 🥰`);
    
    const mailtoUrl = `mailto:mah120400@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  });
}

// ==========================================
// PAGE INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initBackgroundHearts();
  initButtonInteractions();
  initPlannerLogic();
  
  // Listen for interaction to play background music (only valid browser click/tap activations!)
  document.addEventListener("touchstart", handleFirstInteraction);
  document.addEventListener("click", handleFirstInteraction);
  // Also trigger on first mouse movement
  document.addEventListener("mousemove", handleFirstInteraction, { once: true });
  
  // Bind music controls
  document.getElementById("music-btn").addEventListener("click", toggleMusic);
  
  // Trigger entry animation for initial screen
  transitionToScreen("invitation-screen");
});
