// ---- One-time cache reset (avoid old SW/JS) ----
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations?.().then(rs => rs.forEach(r => r.unregister()));
  caches?.keys?.().then(keys => keys.forEach(k => caches.delete(k)));
}

// ===== ST★RLIGHT ORB V3 =====
let currentAI = "MIA";
let userName = localStorage.getItem("userName") || null;

const orb = document.getElementById("orb");
const aiLabel = document.getElementById("aiLabel");
const secondsInput = document.getElementById("seconds");
const countdownEl = document.getElementById("countdown");
const presetMenu = document.getElementById("presetMenu");
let timerId = null;

// ===== Robust voice loading =====
let VOICES = [];
function loadVoicesOnce() {
  return new Promise(resolve => {
    const load = () => {
      VOICES = speechSynthesis.getVoices();
      if (VOICES.length) resolve(VOICES);
    };
    load();
    if (!VOICES.length) {
      speechSynthesis.onvoiceschanged = load;
      const t = setInterval(() => {
        if (speechSynthesis.getVoices().length) {
          clearInterval(t);
          load();
        }
      }, 200);
      setTimeout(() => { clearInterval(t); load(); }, 4000);
    }
  });
}

const MIA_PREF   = ["Aria","Jenny","Samantha","Google UK English Female","Victoria","Karen"];
const BRIAN_PREF = ["Guy","Christopher","Daniel","Google UK English Male","Tom"];

function pickVoice(list) {
  if (!VOICES.length) return null;
  for (const n of list) {
    const v = VOICES.find(v => v.name === n) || VOICES.find(v => v.name?.includes(n));
    if (v) return v;
  }
  return VOICES.find(v => /en-/i.test(v.lang)) || VOICES[0];
}

function speak(ai, text) {
  const u = new SpeechSynthesisUtterance(text);
  if (ai === "MIA") { u.voice = pickVoice(MIA_PREF);   u.pitch = 1.15; u.rate = 0.98; }
  else              { u.voice = pickVoice(BRIAN_PREF); u.pitch = 0.95; u.rate = 1.04; }
  u.onstart = () => orb.classList.add("talking");
  u.onend   = () => orb.classList.remove("talking");
  speechSynthesis.speak(u);
}

// Unlock audio and greet (requires a user gesture on most browsers)
let audioReady = false;
async function primeAudio() {
  if (audioReady) return;
  audioReady = true;
  await loadVoicesOnce();
  if (!userName) {
    userName = prompt("Welcome. What shall I call you?") || "Operator";
    localStorage.setItem("userName", userName);
  }
  // Greet immediately WITH the saved/entered name
  speak("MIA", `Hello ${userName}. Starlight systems online.`);
}
window.addEventListener("pointerdown", primeAudio, { once:true });
window.addEventListener("keydown",     primeAudio, { once:true });

// Assistant switch (MIA = blue/white, BRIAN = green/white)
document.querySelectorAll(".chip").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    currentAI = btn.dataset.ai;
    aiLabel.textContent = `Selected: ${currentAI}`;
    orb.className = currentAI === "MIA" ? "mia" : "brian";
    speak(currentAI, `Ready, ${userName || "Operator"}.`);
  };
});

// Presets
const presets = {
  "Meditation (5m)": 300,
  "Water Break (2m)": 120,
  "Study Session (25m)": 1500,
  "Brush Teeth (2m)": 120,
  "Cool Down (3m)": 180
};
Object.entries(presets).forEach(([label, secs]) => {
  const o = document.createElement("option");
  o.value = secs; o.textContent = label;
  presetMenu.appendChild(o);
});
presetMenu.onchange = () => {
  const v = parseInt(presetMenu.value||"0",10);
  if (v > 0) {
    secondsInput.value = v;
    speak(currentAI, `Preset set: ${presetMenu.options[presetMenu.selectedIndex].text}`);
  }
};

// Timer
document.getElementById("startBtn").onclick = () => {
  let t = Math.max(1, parseInt(secondsInput.value || "600", 10));
  speak(currentAI, `Starting ${Math.floor(t/60)} minute session, ${userName || "Operator"}.`);
  clearInterval(timerId);
  function tick() {
    countdownEl.textContent = t > 0 ? `${Math.floor(t/60)}m ${t%60}s` : "Complete";
    if (t <= 0) {
      clearInterval(timerId);
      speak(currentAI, `Session complete. Excellent work, ${userName || "Operator"}.`);
    }
    t--;
  }
  tick();
  timerId = setInterval(tick, 1000);
};

document.getElementById("stopBtn").onclick = () => {
  clearInterval(timerId);
  countdownEl.textContent = "Stopped.";
  speak(currentAI, `Timer stopped, ${userName || "Operator"}.`);
};

console.log("%cST★RLIGHT ORB v3 loaded","color:#8ff");
