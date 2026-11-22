/* 버그로그 화면 그리기 — 내용은 data.js 에서 고쳐요 (이 파일은 안 고쳐도 돼요) */
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sampleTag = (x) => (x.sample ? '<span class="badge sample">예시</span>' : "");
const photo = (src, big) =>
  src ? `<img src="${esc(src)}" alt="" loading="lazy">` : `<img class="ph" src="assets/icon.svg" alt="">`;

/* 숫자 */
function renderStats() {
  const species = new Set(LOGS.map((l) => l.insect)).size;
  const items = [
    [LOGS.length, "관찰일지"],
    [species, "만난 곤충"],
    [REPORTS.length, "탐구 보고서"],
    [VIDEOS.length, "유튜브 영상"],
  ];
  $("#stats").innerHTML = items.map(([n, t]) => `<div class="stat"><b>${n}</b><span>${t}</span></div>`).join("");
}

/* 소개 */
function renderAbout() {
  const p = PROFILE;
  $("#about-box").innerHTML = `
    <img src="assets/profile.svg" alt="버그로그 프로필">
    <div>
      <div class="name">${esc(p.nickname)}</div>
      <div class="dream">꿈: ${esc(p.dream)}</div>
      <p>${esc(p.intro)}</p>
      <div class="tags">${p.interests.map((i) => `<span class="tag">#${esc(i)}</span>`).join("")}</div>
      <h3>나의 목표</h3>
      <ul>${p.goals.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
    </div>`;
}

/* 관찰일지 */
let filter = "전체";
function renderChips() {
  const orders = ["전체", ...new Set(LOGS.map((l) => l.order))];
  $("#chips").innerHTML = orders
    .map((o) => `<button class="chip ${o === filter ? "on" : ""}" data-o="${esc(o)}">${esc(o)}</button>`)
    .join("");
}
function sortedLogs() {
  return [...LOGS].sort((a, b) => (a.date < b.date ? 1 : -1));
}
function renderLogs() {
  const q = $("#search").value.trim();
  const list = sortedLogs().filter(
    (l) => (filter === "전체" || l.order === filter) && (!q || JSON.stringify(l).includes(q))
  );
  $("#log-list").innerHTML = list.length
    ? list
        .map(
          (l) => `
      <button class="card" data-i="${LOGS.indexOf(l)}">
        <div class="thumb">${photo(l.photo)}</div>
        <div class="card-body">
          <div class="meta">${esc(l.date)} · ${esc(l.place)}</div>
          <h3>${esc(l.title)}</h3>
          <span class="badge">${esc(l.insect)}</span>${sampleTag(l)}
        </div>
      </button>`
        )
        .join("")
    : '<div class="empty">조건에 맞는 기록이 없어요</div>';
}
function openLog(i) {
  const l = LOGS[i];
  $("#modal-card").innerHTML = `
    <button class="close" aria-label="닫기">✕</button>
    <div class="thumb">${photo(l.photo)}</div>
    <div class="modal-body">
      <div class="meta">${esc(l.date)} · ${esc(l.place)} · ${esc(l.weather)}</div>
      <h3>${esc(l.title)}</h3>
      <span class="badge">${esc(l.insect)}</span> <span class="badge">${esc(l.order)}</span>${sampleTag(l)}
      <div class="qa"><b>👀 관찰한 것</b>${esc(l.observed)}</div>
      ${l.question ? `<div class="qa"><b>❓ 궁금한 점</b>${esc(l.question)}</div>` : ""}
      ${l.learned ? `<div class="qa"><b>💡 알아낸 것</b>${esc(l.learned)}</div>` : ""}
    </div>`;
  $("#modal").hidden = false;
}

/* 곤충도감: 관찰일지에서 자동 */
function renderDex() {
  const map = {};
  [...LOGS].sort((a, b) => (a.date > b.date ? 1 : -1)).forEach((l) => {
    map[l.insect] ??= { name: l.insect, order: l.order, first: l.date, count: 0, photo: l.photo };
    map[l.insect].count++;
  });
  const arr = Object.values(map);
  $("#dex-list").innerHTML = arr.length
    ? arr
        .map(
          (d, i) => `
      <div class="dex-item">
        <div class="dex-no">No.${String(i + 1).padStart(3, "0")}</div>
        <div class="thumb" style="border-radius:12px;margin:6px 0">${photo(d.photo)}</div>
        <div class="dex-name">${esc(d.name)}</div>
        <div class="meta">${esc(d.order)} · 관찰 ${d.count}회<br>처음 만난 날 ${esc(d.first)}</div>
      </div>`
        )
        .join("")
    : '<div class="empty">관찰일지를 쓰면 도감이 채워져요</div>';
}

/* 탐구 보고서 */
function renderReports() {
  $("#report-list").innerHTML = REPORTS.length
    ? REPORTS.map(
        (r, i) => `
      <details class="report" ${i === 0 ? "open" : ""}>
        <summary><span>${esc(r.title)} ${sampleTag(r)}</span><span class="meta">${esc(r.date)}</span></summary>
        <div class="steps">
          <div class="step"><b>① 질문</b>${esc(r.question)}</div>
          <div class="step"><b>② 방법</b>${esc(r.method)}</div>
          <div class="step"><b>③ 결과</b>${esc(r.result)}</div>
          <div class="step"><b>④ 느낀 점</b>${esc(r.reflection)}</div>
        </div>
      </details>`
      ).join("")
    : '<div class="empty">첫 탐구 보고서를 기다리는 중!</div>';
}

/* 성장 기록 */
function renderTimeline() {
  $("#tl-list").innerHTML = [...TIMELINE]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((t) => `<li><span class="meta">${esc(t.date)}</span><br><span class="type">${esc(t.type)}</span>${esc(t.text)} ${sampleTag(t)}</li>`)
    .join("");
}

/* 유튜브 */
function renderVideos() {
  const cta = `<div class="yt-cta"><img src="assets/profile.svg" alt=""><div>
      <b>버그로그 유튜브</b><br>${
        PROFILE.youtube
          ? `<a href="${esc(PROFILE.youtube)}" target="_blank" rel="noopener">채널 보러 가기 →</a>`
          : "채널 준비 중이에요. 곧 만나요!"
      }</div></div>`;
  $("#video-list").innerHTML =
    VIDEOS.map(
      (v) => `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}" title="${esc(v.title)}" allowfullscreen loading="lazy"></iframe><p>${esc(v.title)} <span class="meta">${esc(v.date)}</span></p></div>`
    ).join("") + cta;
}

/* 기록 만들기 도우미 */
function setupHelper() {
  const f = $("#helper-form");
  f.date.value = new Date().toISOString().slice(0, 10);
  f.addEventListener("input", () => ($("#helper-err").textContent = ""));
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (!d.date || !d.insect.trim() || !d.title.trim() || !d.observed.trim()) {
      $("#helper-err").textContent = "날짜·곤충 이름·제목·무엇을 보았나요는 꼭 채워 주세요";
      return;
    }
    const q = (s) => JSON.stringify((s || "").trim());
    const code = `  {
    date: ${q(d.date)},
    title: ${q(d.title)},
    insect: ${q(d.insect)},
    order: ${q(d.order)},
    place: ${q(d.place)},
    weather: ${q(d.weather)},
    photo: ${q(d.photo ? "photos/" + d.photo.replace(/^photos\//, "") : "")},
    observed: ${q(d.observed)},
    question: ${q(d.question)},
    learned: ${q(d.learned)},
  },`;
    $("#helper-code").textContent = code;
    $("#helper-out").hidden = false;
  });
  $("#copy-btn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("#helper-code").textContent);
      $("#copy-btn").textContent = "복사됐어요 ✓";
    } catch {
      $("#copy-btn").textContent = "글을 직접 드래그해서 복사해 주세요";
    }
    setTimeout(() => ($("#copy-btn").textContent = "복사하기"), 2000);
  });
}

/* 소리 (로고 누르면) */
let ac;
const A = () => (ac ??= new (window.AudioContext || window.webkitAudioContext)());
function tone(f1, f2, st, dur, type, vol) {
  const a = A(), o = a.createOscillator(), g = a.createGain(), t = a.currentTime + st;
  o.type = type || "sine";
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function whoosh(st, dur) {
  const a = A(), n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + st;
  s.buffer = b; f.type = "bandpass"; f.Q.value = 1.2;
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.7);
  f.frequency.exponentialRampToValueAtTime(900, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35, t + dur * 0.65);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(a.destination);
  s.start(t); s.stop(t + dur + 0.05);
}
function logoSound() {
  A().resume();
  whoosh(0.35, 1.45);
  tone(300, 900, 1.1, 0.35, "triangle", 0.12);
  for (let i = 0; i < 14; i++) tone(900 + i * 45, 900 + i * 45, 1.5 + i * 0.04, 0.05, "sine", 0.08);
  tone(600, 1500, 2.08, 0.16, "square", 0.07);
  [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, f, 2.4 + i * 0.09, 0.35, "triangle", 0.1));
  tone(900, 1600, 2.9, 0.12, "sine", 0.25);
  tone(1100, 2000, 3.04, 0.14, "sine", 0.25);
}

/* 토리 곤충 상식 */
const FACTS = [
  "곤충은 다리가 6개, 몸은 머리·가슴·배 세 부분이야!",
  "딱정벌레목은 지구에서 종류가 가장 많은 곤충 무리야.",
  "무당벌레는 진딧물을 잡아먹어서 농부들의 친구로 불려.",
  "잠자리는 번데기 없이 자라는 '불완전변태' 곤충이야.",
  "나비 날개의 색은 아주 작은 비늘가루 덕분이야.",
  "개미는 냄새(페로몬)로 친구들에게 길을 알려줘.",
  "나는 토리! 오늘은 어떤 곤충을 관찰할 거야?",
];
let fi = 0, bt;
function toriTalk() {
  const b = $("#bubble");
  b.textContent = FACTS[fi++ % FACTS.length];
  b.hidden = false;
  tone(900, 1600, 0, 0.12, "sine", 0.2);
  tone(1100, 2000, 0.14, 0.14, "sine", 0.2);
  clearTimeout(bt);
  bt = setTimeout(() => (b.hidden = true), 4000);
}

/* 이벤트 */
document.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (chip) { filter = chip.dataset.o; renderChips(); renderLogs(); }
  const card = e.target.closest(".card");
  if (card) openLog(+card.dataset.i);
  if (e.target.closest(".close") || e.target.id === "modal") $("#modal").hidden = true;
  if (e.target.closest(".nav-links a")) $(".nav-links").classList.remove("open");
});
document.addEventListener("keydown", (e) => e.key === "Escape" && ($("#modal").hidden = true));
$("#search").addEventListener("input", renderLogs);
$(".nav-toggle").addEventListener("click", () => $(".nav-links").classList.toggle("open"));
$("#heroLogo").addEventListener("click", () => {
  const img = $("#heroLogo img");
  img.src = "assets/logo-animated.svg?t=" + Date.now();
  logoSound();
});
$("#tori").addEventListener("click", toriTalk);

renderStats(); renderAbout(); renderChips(); renderLogs(); renderDex(); renderReports(); renderTimeline(); renderVideos(); setupHelper();
