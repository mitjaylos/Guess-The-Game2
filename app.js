const QUESTION_TIME_MS = 10000;
const NEXT_DELAY_MS = 2000; // пауза после неверного/тайм-аута
const CORRECT_NEXT_DELAY_MS = 2000; // пауза после верного ответа
const TOTAL_QUESTIONS = 100;
const FLAG_URL = (code) => `https://flagcdn.com/w640/${code}.png`;

// 100 стран (русские названия) + ISO-2 код для подстановки флага с flagcdn.com
// Формат: { code: "ru", name: "Россия" }
const COUNTRIES = [
  { code: "au", name: "Австралия" },
  { code: "at", name: "Австрия" },
  { code: "az", name: "Азербайджан" },
  { code: "al", name: "Албания" },
  { code: "dz", name: "Алжир" },
  { code: "ao", name: "Ангола" },
  { code: "ar", name: "Аргентина" },
  { code: "am", name: "Армения" },
  { code: "af", name: "Афганистан" },
  { code: "bd", name: "Бангладеш" },
  { code: "by", name: "Беларусь" },
  { code: "be", name: "Бельгия" },
  { code: "bg", name: "Болгария" },
  { code: "bo", name: "Боливия" },
  { code: "ba", name: "Босния и Герцеговина" },
  { code: "br", name: "Бразилия" },
  { code: "gb", name: "Великобритания" },
  { code: "hu", name: "Венгрия" },
  { code: "ve", name: "Венесуэла" },
  { code: "vn", name: "Вьетнам" },
  { code: "de", name: "Германия" },
  { code: "gr", name: "Греция" },
  { code: "ge", name: "Грузия" },
  { code: "dk", name: "Дания" },
  { code: "eg", name: "Египет" },
  { code: "il", name: "Израиль" },
  { code: "in", name: "Индия" },
  { code: "id", name: "Индонезия" },
  { code: "iq", name: "Ирак" },
  { code: "ir", name: "Иран" },
  { code: "ie", name: "Ирландия" },
  { code: "is", name: "Исландия" },
  { code: "es", name: "Испания" },
  { code: "it", name: "Италия" },
  { code: "kz", name: "Казахстан" },
  { code: "kh", name: "Камбоджа" },
  { code: "cm", name: "Камерун" },
  { code: "ca", name: "Канада" },
  { code: "qa", name: "Катар" },
  { code: "ke", name: "Кения" },
  { code: "cy", name: "Кипр" },
  { code: "cn", name: "Китай" },
  { code: "co", name: "Колумбия" },
  { code: "cg", name: "Конго" },
  { code: "cr", name: "Коста-Рика" },
  { code: "cu", name: "Куба" },
  { code: "kw", name: "Кувейт" },
  { code: "kg", name: "Киргизия" },
  { code: "la", name: "Лаос" },
  { code: "lv", name: "Латвия" },
  { code: "lt", name: "Литва" },
  { code: "lu", name: "Люксембург" },
  { code: "my", name: "Малайзия" },
  { code: "ma", name: "Марокко" },
  { code: "mx", name: "Мексика" },
  { code: "md", name: "Молдова" },
  { code: "mn", name: "Монголия" },
  { code: "nl", name: "Нидерланды" },
  { code: "nz", name: "Новая Зеландия" },
  { code: "no", name: "Норвегия" },
  { code: "ae", name: "ОАЭ" },
  { code: "om", name: "Оман" },
  { code: "pk", name: "Пакистан" },
  { code: "pa", name: "Панама" },
  { code: "py", name: "Парагвай" },
  { code: "pe", name: "Перу" },
  { code: "pl", name: "Польша" },
  { code: "pt", name: "Португалия" },
  { code: "ru", name: "Россия" },
  { code: "ro", name: "Румыния" },
  { code: "sa", name: "Саудовская Аравия" },
  { code: "rs", name: "Сербия" },
  { code: "sg", name: "Сингапур" },
  { code: "sk", name: "Словакия" },
  { code: "si", name: "Словения" },
  { code: "us", name: "США" },
  { code: "th", name: "Таиланд" },
  { code: "tw", name: "Тайвань" },
  { code: "tn", name: "Тунис" },
  { code: "tr", name: "Турция" },
  { code: "ua", name: "Украина" },
  { code: "uy", name: "Уругвай" },
  { code: "ph", name: "Филиппины" },
  { code: "fi", name: "Финляндия" },
  { code: "fr", name: "Франция" },
  { code: "hr", name: "Хорватия" },
  { code: "me", name: "Черногория" },
  { code: "cz", name: "Чехия" },
  { code: "cl", name: "Чили" },
  { code: "ch", name: "Швейцария" },
  { code: "se", name: "Швеция" },
  { code: "lk", name: "Шри-Ланка" },
  { code: "ec", name: "Эквадор" },
  { code: "ee", name: "Эстония" },
  { code: "et", name: "Эфиопия" },
  { code: "za", name: "ЮАР" },
  { code: "kr", name: "Южная Корея" },
  { code: "jp", name: "Япония" }
];

const appEl = document.getElementById("app");

/** @type {HTMLImageElement} */
const flagImg = document.getElementById("flagImg");
const flagFallback = document.getElementById("flagFallback");
const answersEl = document.getElementById("answers");
const statusEl = document.getElementById("status");
const timerFill = document.getElementById("timerFill");
const timeLeftEl = document.getElementById("timeLeft");
const qIndexEl = document.getElementById("qIndex");
const qTotalEl = document.getElementById("qTotal");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const btnStart = document.getElementById("btnStart");
const btnRestart = document.getElementById("btnRestart");
const btnStop = document.getElementById("btnStop");
const celebrationEl = document.getElementById("celebration");

qTotalEl.textContent = String(TOTAL_QUESTIONS);

let deck = [];
let current = null; // { correct, options }
let qIndex = 0;
let score = 0;
let streak = 0;
let locked = true;

let timerRaf = 0;
let deadline = 0;
let scheduledNext = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sampleDifferent(fromArr, count, excludeCode) {
  const candidates = fromArr.filter((c) => c.code !== excludeCode);
  shuffle(candidates);
  return candidates.slice(0, count);
}

function setStatus(text, tone) {
  statusEl.textContent = text || "";
  statusEl.classList.remove("good", "bad");
  if (tone === "good") statusEl.classList.add("good");
  if (tone === "bad") statusEl.classList.add("bad");
}

function setLocked(isLocked) {
  locked = isLocked;
  [...answersEl.querySelectorAll("button")].forEach((b) => (b.disabled = isLocked));
}

function triggerCelebration() {
  if (!celebrationEl) return;
  celebrationEl.innerHTML = "";
  const count = 26;
  const rect = celebrationEl.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height * 0.4;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "celebration__particle";
    const angle = (Math.PI * 2 * i) / count;
    const dist = 80 + Math.random() * 90;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    p.style.left = `${cx}px`;
    p.style.top = `${cy}px`;
    p.style.setProperty("--dx", `${dx}px`);
    p.style.setProperty("--dy", `${dy}px`);
    celebrationEl.appendChild(p);
  }
  window.setTimeout(() => {
    celebrationEl.innerHTML = "";
  }, 950);
}

function resetTimerUI() {
  timerFill.style.width = "0%";
  timeLeftEl.textContent = "10.0";
}

function renderAnswers(options) {
  answersEl.innerHTML = "";
  for (const c of options) {
    const btn = document.createElement("button");
    btn.className = "btn answer";
    btn.type = "button";
    btn.textContent = c.name;
    btn.dataset.code = c.code;
    btn.addEventListener("click", () => onPick(c.code));
    answersEl.appendChild(btn);
  }
}

function markAnswers(correctCode, pickedCode) {
  const buttons = [...answersEl.querySelectorAll("button")];
  for (const b of buttons) {
    const code = b.dataset.code;
    if (code === correctCode) b.classList.add("correct");
    if (pickedCode && code === pickedCode && pickedCode !== correctCode) b.classList.add("wrong");
  }
}

function clearAnswerMarks() {
  [...answersEl.querySelectorAll("button")].forEach((b) => {
    b.classList.remove("correct", "wrong");
  });
}

function cancelTimers() {
  if (timerRaf) cancelAnimationFrame(timerRaf);
  timerRaf = 0;
  if (scheduledNext) clearTimeout(scheduledNext);
  scheduledNext = 0;
}

function startTimer() {
  cancelAnimationFrame(timerRaf);
  const start = performance.now();
  deadline = start + QUESTION_TIME_MS;

  const tick = (now) => {
    const remain = Math.max(0, deadline - now);
    const pct = Math.min(1, (QUESTION_TIME_MS - remain) / QUESTION_TIME_MS);
    timerFill.style.width = `${Math.round(pct * 100)}%`;
    timeLeftEl.textContent = (remain / 1000).toFixed(1);

    if (remain <= 0) {
      timerRaf = 0;
      onTimeout();
      return;
    }
    timerRaf = requestAnimationFrame(tick);
  };

  timerRaf = requestAnimationFrame(tick);
}

function updateStatsUI() {
  qIndexEl.textContent = qIndex === 0 ? "—" : String(qIndex);
  scoreEl.textContent = String(score);
  streakEl.textContent = String(streak);
}

function loadFlag(code) {
  flagFallback.hidden = true;
  flagImg.hidden = false;
  flagImg.src = FLAG_URL(code);
}

function nextQuestion() {
  cancelTimers();
  clearAnswerMarks();
  setStatus("", "");

  if (qIndex >= TOTAL_QUESTIONS) {
    locked = true;
    setLocked(true);
    btnRestart.disabled = false;
    btnStart.disabled = true;
    resetTimerUI();
    setStatus(`Финиш! Счёт: ${score} из ${TOTAL_QUESTIONS}.`, "good");
    return;
  }

  const correct = deck[qIndex];
  const wrong = sampleDifferent(COUNTRIES, 3, correct.code);
  const options = shuffle([correct, ...wrong]);
  current = { correct, options };

  qIndex += 1;
  updateStatsUI();

  // картинка
  loadFlag(correct.code);
  flagImg.alt = `Флаг: ${correct.name}`;

  // ответы
  renderAnswers(options);
  setLocked(false);
  resetTimerUI();
  startTimer();
}

function finishPick(pickedCode, reason) {
  if (!current) return;
  if (locked) return;
  setLocked(true);
  cancelAnimationFrame(timerRaf);
  timerRaf = 0;

  const correctCode = current.correct.code;
  const isCorrect = pickedCode === correctCode;

  if (reason === "timeout") {
    streak = 0;
    setStatus(`Время вышло. Правильный ответ: ${current.correct.name}`, "bad");
    markAnswers(correctCode, null);
  } else if (isCorrect) {
    score += 1;
    streak += 1;
    setStatus("Верно!", "good");
    triggerCelebration();
    markAnswers(correctCode, pickedCode);
  } else {
    streak = 0;
    setStatus(`Неверно. Правильно: ${current.correct.name}`, "bad");
    markAnswers(correctCode, pickedCode);
  }

  updateStatsUI();
  btnRestart.disabled = false;

  const delay =
    reason === "pick" && isCorrect ? CORRECT_NEXT_DELAY_MS : NEXT_DELAY_MS;

  scheduledNext = window.setTimeout(() => {
    scheduledNext = 0;
    nextQuestion();
  }, delay);
}

function onPick(code) {
  finishPick(code, "pick");
}

function onTimeout() {
  finishPick(null, "timeout");
}

function buildDeck() {
  const unique = new Map();
  for (const c of COUNTRIES) unique.set(c.code, c);
  deck = shuffle([...unique.values()]).slice(0, TOTAL_QUESTIONS);
}

function resetGame() {
  cancelTimers();
  clearAnswerMarks();
  current = null;
  qIndex = 0;
  score = 0;
  streak = 0;
  btnStart.disabled = false;
  btnRestart.disabled = true;
  btnStop.disabled = true;
  answersEl.innerHTML = "";
  flagImg.removeAttribute("src");
  flagImg.alt = "Флаг страны";
  resetTimerUI();
  setStatus("Нажмите «Старт».", "");
  updateStatsUI();
  locked = true;
  if (appEl) appEl.classList.remove("app--playing");
}

function startGame() {
  buildDeck();
  score = 0;
  streak = 0;
  qIndex = 0;
  btnStart.disabled = true;
  btnRestart.disabled = false;
  btnStop.disabled = false;
  if (appEl) appEl.classList.add("app--playing");
  nextQuestion();
}

// Фоллбек на ошибки загрузки флага (CORS/сеть)
flagImg.addEventListener("error", () => {
  flagImg.hidden = true;
  flagFallback.hidden = false;
});

btnStart.addEventListener("click", startGame);
btnRestart.addEventListener("click", () => {
  resetGame();
  startGame();
});
btnStop.addEventListener("click", () => {
  cancelTimers();
  setLocked(true);
  setStatus("Игра остановлена.", "");
  btnStart.disabled = false;
  btnRestart.disabled = false;
  btnStop.disabled = true;
});

resetGame();


