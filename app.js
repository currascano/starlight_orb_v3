// ST★RLIGHT v3 — replace with full script later
console.log('loaded');
// ==========================
// ST★RLIGHT ORB — V3
// Voice AI + Timer + Orb Glow
// ==========================

// ===== State =====
let currentAI = "MIA";
let userName = localStorage.getItem("userName") || null;
let timerId = null;

// Elements
const orb = document.getElementById("orb");
const aiLabel = document.getElementById("aiLabel");
const secondsInput = document.getElementById("seconds");
const countdownEl = document.getElementById("countdown");
const presetMenu = document.getElementById("presetMenu");

// ===== Voice System =====
let VOICES = [];
let audioReady = false;

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

const MIA_PREF = ["Aria","Jenny","Samantha","Google UK English Female","Victoria"];
const BRIAN_PREF = ["Guy","Christopher","Daniel","Google UK English Male","Tom"];

function pickVoice(list) {
  if (!VOICES.length) return null;
  for (const n of list) {
    const v = VOICES.find(v => v.name === n) || VOICES.find(v => v.name.includes(n));
    if (v) return v;
  }
  return VOICES.find(v => /en-/i.test(v.lang)) || VOICES[0];
}

function speak(ai, text) {
  const u = new SpeechSynthesisUtterance(text);

  if (ai === "MIA") {
    u.voice = pickVoice(MIA_PREF);
    u.pitch = 1.15;
    u.rate = .97;
  } else {
    u.voice = pickVoice(BRIAN_PREF);
    u.pitch = .95;
    u.rate = 1.03;
  }

  u.onstart = () => orb.classList.add("talking");
  u.onend   = () => orb.classList.remove("talking");
  speechSynthesis.speak(u);
}

async function primeAudio() {
  if (audioReady) return;
  audioReady = true;
  await loadVoicesOnce();

  if (!userName) {
    userName = prompt("What shall I call you?") || "Operator";
    localStorage.setItem("userName", userName);
  }

  speak("MIA", `Starlight systems online, ${userName}.`);
}

window.addEventListener("pointerdown", primeAudio, { once:true });
window.addEventListener("keydown", primeAudio, { once:true });

// ===== AI Switch =====
document.querySelectorAll(".chip").forEach(btn => {
  btn.onclick = () => {
    currentAI = btn.dataset.ai;
    aiLabel.textContent = `Selected: ${currentAI}`;

    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");

    orb.className = currentAI === "MIA" ? "mia" : "brian";
    speak(currentAI, `Ready, ${userName}.`);
  };
});

// ===== Presets =====
const presets = {
  "Meditation (5m)": 300,
  "Water Break (2m)": 120,
  "Study Session (25m)": 1500,
  "Brush Teeth (2m)": 120,
  "Cool Down (3m)": 180
};

Object.entries(presets).forEach(([name, secs]) => {
  const o = document.createElement("option");
  o.value = secs;
  o.textContent = name;
  presetMenu.appendChild(o);
});

presetMenu.onchange = () => {
  secondsInput.value = presetMenu.value;
  speak(currentAI, `Preset set: ${presetMenu.options[presetMenu.selectedIndex].text}`);
};

// ===== Timer =====
document.getElementById("startBtn").onclick = () => {
  let t = parseInt(secondsInput.value) || 600;
  speak(currentAI, `Starting ${Math.floor(t/60)} minute session, ${userName}.`);

  clearInterval(timerId);
  function tick() {
    countdownEl.textContent = t > 0
      ? `${Math.floor(t/60)}m ${t%60}s`
      : "Complete";

    if (t <= 0) {
      clearInterval(timerId);
      speak(currentAI, `Session complete. Excellent work, ${userName}.`);
    }
    t--;
  }
  tick();
  timerId = setInterval(tick, 1000);
};

document.getElementById("stopBtn").onclick = () => {
  clearInterval(timerId);
  countdownEl.textContent = "Stopped.";
  speak(currentAI, `Timer stopped, ${userName}.`);
};

console.log("%cST★RLIGHT ORB v3 loaded","color:#8ff");
