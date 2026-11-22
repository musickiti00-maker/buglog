/* 버그로그 화면 그리기 — 내용은 data.js 에서 고쳐요 (이 파일은 안 고쳐도 돼요) */
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sampleTag = (x) => (x.sample ? '<span class="badge sample">예시</span>' : "");
const photo = (src, big) =>
  src ? `<img src="${esc(src)}" alt="" loading="lazy">` : `<span class="ph-text">📷 사진 준비 중</span>`;

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
  const cta = `<div class="yt-cta"><div>
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

/* 이벤트 */
document.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (chip) { filter = chip.dataset.o; renderChips(); renderLogs(); }
  const card = e.target.closest(".card");
  if (card) openLog(+card.dataset.i);
  if (e.target.closest(".close") || e.target.id === "modal") $("#modal").hidden = true;
});
document.addEventListener("keydown", (e) => e.key === "Escape" && ($("#modal").hidden = true));
$("#search").addEventListener("input", renderLogs);

renderChips(); renderLogs(); renderDex(); renderReports(); renderTimeline(); renderVideos(); setupHelper();

/* 첫 화면을 누르면(터치하면) 페이드인 다시 */
document.querySelector(".hero").addEventListener("click", () => {
  [".hero", ".hero-title"].forEach((s) => {
    const el = document.querySelector(s);
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  });
});

/* 페이드인 시작할 때 희미한 소리 (바람 + 맑은 종소리) */
let heroAC;
function heroSound() {
  try {
    heroAC ??= new (window.AudioContext || window.webkitAudioContext)();
    const a = heroAC; a.resume();
    const t = a.currentTime + 0.02;
    // 부드러운 바람 소리
    const n = Math.floor(a.sampleRate * 1.6), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; f.type = "bandpass"; f.Q.value = 0.8;
    f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(1800, t + 1.2);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.02, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    src.connect(f).connect(g).connect(a.destination); src.start(t); src.stop(t + 1.7);
    // 맑은 종소리 두 번
    [[880, 0.1], [1318.5, 0.28]].forEach(([fr, dt]) => {
      const o = a.createOscillator(), og = a.createGain(), s = t + dt;
      o.type = "sine"; o.frequency.value = fr;
      og.gain.setValueAtTime(0.0001, s); og.gain.exponentialRampToValueAtTime(0.014, s + 0.02); og.gain.exponentialRampToValueAtTime(0.0001, s + 1.4);
      o.connect(og).connect(a.destination); o.start(s); o.stop(s + 1.5);
    });
  } catch (e) {}
}
document.querySelector(".hero").addEventListener("click", heroSound);
heroSound(); // 처음 열 때 (브라우저가 막으면 조용히 넘어감)
