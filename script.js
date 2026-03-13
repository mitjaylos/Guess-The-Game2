const TOTAL_ROUNDS = 10;
const BLUR_START = 20;
const BLUR_STEP = 2;
const BLUR_TICK_MS = 2000;
const ANSWER_DELAY_MS = 1100;

const QUESTION_BANK = [
  { image: "images/Alstan.webp", correct: "Alstan" },
  { image: "images/BlackSands.webp", correct: "Black Sands" },
  { image: "images/Crossout.webp", correct: "Crossout" },
  { image: "images/Diablo2.webp", correct: "Diablo II" },
  { image: "images/Diablo2_2.webp", correct: "Diablo II (2)" },
  { image: "images/Diablo2_3.webp", correct: "Diablo II (3)" },
  { image: "images/EASportsMaddenNFL26.webp", correct: "EA Sports Madden NFL 26" },
  { image: "images/GhostofYoteiLegends.webp", correct: "Ghost of Yotei Legends" },
  { image: "images/GranTurismo7.webp", correct: "Gran Turismo 7" },
  { image: "images/HellguardOnlineActionRPG.webp", correct: "Hellguard Online Action RPG" },
  { image: "images/Narin-SecretsofDwarvenia.webp", correct: "Narin - Secrets of Dwarvenia" },
  { image: "images/PARANORMASIGHT-TheMermaid'sCurse.webp", correct: "PARANORMASIGHT - The Mermaid's Curse" },
  { image: "images/ParasiteZ.webp", correct: "Parasite Z" },
  { image: "images/Peace_island.webp", correct: "Peace Island" },
  { image: "images/piontblank.webp", correct: "Point Blank" },
  { image: "images/SilentReverie.webp", correct: "Silent Reverie" },
  { image: "images/worldship.webp", correct: "Worldship" },
];

const el = {
  startScreen: document.getElementById("startScreen"),
  gameScreen: document.getElementById("gameScreen"),
  resultsScreen: document.getElementById("resultsScreen"),
  btnStart: document.getElementById("btnStart"),
  btnPlayAgain: document.getElementById("btnPlayAgain"),
  btnMenu: document.getElementById("btnMenu"),
  roundIndex: document.getElementById("roundIndex"),
  roundTotal: document.getElementById("roundTotal"),
  score: document.getElementById("score"),
  timeElapsed: document.getElementById("timeElapsed"),
  blurAmount: document.getElementById("blurAmount"),
  hintBlur: document.getElementById("hintBlur"),
  revealProgress: document.getElementById("revealProgress"),
  progressFill: document.getElementById("progressFill"),
  shotImg: document.getElementById("shotImg"),
  shotHint: document.getElementById("shotHint"),
  answers: document.getElementById("answers"),
  finalScore: document.getElementById("finalScore"),
  accuracy: document.getElementById("accuracy"),
  avgTime: document.getElementById("avgTime"),
  roundsList: document.getElementById("roundsList"),
};

/** @type {{image:string, correct:string, options:string[]}[]} */
let deck = [];
let round = 0;
let score = 0;
let current = null;
let isAnswered = false;
let blur = BLUR_START;
let timeElapsed = 0;
let blurTimer = 0;
let timeTimer = 0;
let nextTimer = 0;
let startInProgress = false;
/** @type {{correct:boolean,timeElapsed:number,points:number,gameName:string}[]} */
let results = [];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setScreen(name) {
  el.startScreen.hidden = name !== "start";
  el.gameScreen.hidden = name !== "game";
  el.resultsScreen.hidden = name !== "results";
}

function stopTimers() {
  if (blurTimer) clearInterval(blurTimer);
  if (timeTimer) clearInterval(timeTimer);
  if (nextTimer) clearTimeout(nextTimer);
  blurTimer = 0;
  timeTimer = 0;
  nextTimer = 0;
}

function calculatePoints(seconds) {
  const maxPoints = 1000;
  const minPoints = 100;
  const maxTime = 20;
  if (seconds >= maxTime) return minPoints;
  const points = maxPoints - (maxPoints - minPoints) * (seconds / maxTime);
  return Math.round(Math.max(minPoints, points));
}

function buildDeck() {
  const unique = new Map();
  for (const q of QUESTION_BANK) {
    const key = `${q.image}|${q.correct}`;
    if (!unique.has(key)) unique.set(key, q);
  }
  const all = shuffle([...unique.values()]);
  const names = all.map((q) => q.correct);
  deck = all.slice(0, Math.min(TOTAL_ROUNDS, all.length)).map((q) => {
    const wrong = shuffle(names.filter((name) => name !== q.correct)).slice(0, 3);
    return { image: q.image, correct: q.correct, options: shuffle([q.correct, ...wrong]) };
  });
}

function updateHUD() {
  el.roundIndex.textContent = String(round);
  el.roundTotal.textContent = String(TOTAL_ROUNDS);
  el.score.textContent = String(score);
  el.timeElapsed.textContent = timeElapsed.toFixed(1);
  el.blurAmount.textContent = String(blur);
  el.hintBlur.textContent = String(blur);
  const progress = Math.round(((BLUR_START - blur) / BLUR_START) * 100);
  el.revealProgress.textContent = String(progress);
  el.progressFill.style.width = `${progress}%`;
  el.shotImg.style.filter = `blur(${blur}px)`;
  el.shotHint.hidden = blur <= 0;
}

function setAnswersDisabled(disabled) {
  [...el.answers.querySelectorAll("button")].forEach((btn) => {
    btn.disabled = disabled;
  });
}

function renderAnswers(question) {
  el.answers.innerHTML = "";
  for (const option of question.options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn answerBtn";
    btn.textContent = option;
    btn.dataset.value = option;
    btn.addEventListener("click", () => onPick(option));
    el.answers.appendChild(btn);
  }
}

function markAnswers(correct, picked) {
  [...el.answers.querySelectorAll("button")].forEach((btn) => {
    const value = btn.dataset.value;
    if (value === correct) btn.classList.add("correct");
    if (value === picked && picked !== correct) btn.classList.add("wrong");
  });
}

function startRoundTimers() {
  blurTimer = window.setInterval(() => {
    blur = Math.max(0, blur - BLUR_STEP);
    updateHUD();
    if (blur <= 0) clearInterval(blurTimer);
  }, BLUR_TICK_MS);

  timeTimer = window.setInterval(() => {
    timeElapsed += 0.1;
    updateHUD();
  }, 100);
}

function currentQuestion() {
  return deck[round - 1] || null;
}

function nextRound() {
  stopTimers();
  if (round >= TOTAL_ROUNDS) {
    showResults();
    return;
  }

  round += 1;
  current = currentQuestion();
  if (!current) {
    showResults();
    return;
  }

  isAnswered = false;
  blur = BLUR_START;
  timeElapsed = 0;
  el.shotImg.src = current.image;
  el.shotImg.alt = `Screenshot: ${current.correct}`;
  renderAnswers(current);
  setAnswersDisabled(false);
  updateHUD();
  startRoundTimers();
}

function onPick(value) {
  if (!current || isAnswered) return;
  isAnswered = true;
  setAnswersDisabled(true);
  stopTimers();

  const isCorrect = value === current.correct;
  const points = isCorrect ? calculatePoints(timeElapsed) : 0;
  if (isCorrect) score += points;

  results.push({
    correct: isCorrect,
    timeElapsed,
    points,
    gameName: current.correct,
  });

  markAnswers(current.correct, value);
  updateHUD();
  nextTimer = window.setTimeout(() => {
    nextRound();
  }, ANSWER_DELAY_MS);
}

function renderResultsRows() {
  el.roundsList.innerHTML = "";
  results.forEach((result, idx) => {
    const row = document.createElement("div");
    row.className = "roundRow";
    row.innerHTML = `
      <div class="roundRow__left">
        <span>#${idx + 1}</span>
        <span class="roundRow__state ${result.correct ? "ok" : "bad"}">${result.correct ? "✓" : "✗"}</span>
        <span>${result.gameName}</span>
      </div>
      <div>${result.timeElapsed.toFixed(1)}s • +${result.points}</div>
    `;
    el.roundsList.appendChild(row);
  });
}

function showResults() {
  stopTimers();
  const correct = results.filter((r) => r.correct).length;
  const accuracy = results.length ? Math.round((correct / results.length) * 100) : 0;
  const avgTime =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.timeElapsed, 0) / results.length
      : 0;

  el.finalScore.textContent = String(score);
  el.accuracy.textContent = `${accuracy}%`;
  el.avgTime.textContent = `${avgTime.toFixed(1)}s`;
  renderResultsRows();
  setScreen("results");
}

function startGame() {
  if (startInProgress) return;
  startInProgress = true;
  stopTimers();
  round = 0;
  score = 0;
  results = [];
  buildDeck();
  setScreen("game");
  nextRound();
  window.setTimeout(() => {
    startInProgress = false;
  }, 0);
}
window.__startGame = startGame;

function backToMenu() {
  stopTimers();
  setScreen("start");
}

if (el.btnStart) {
  el.btnStart.addEventListener("click", startGame);
  el.btnStart.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startGame();
    }
  });
}
el.btnPlayAgain.addEventListener("click", startGame);
el.btnMenu.addEventListener("click", backToMenu);

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest("#btnStart")) startGame();
});

el.shotImg.addEventListener("error", () => {
  el.shotHint.hidden = false;
  el.shotHint.querySelector(".shotHint__text").textContent = "Image failed to load";
});

backToMenu();



