const STORAGE_KEY = "bousai_bottles_v1";

const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const qEl = document.getElementById("q");
const clearBtn = document.getElementById("clearSearch");

function loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,"0");
    const day = String(d.getDate()).padStart(2,"0");
    const hh = String(d.getHours()).padStart(2,"0");
    const mm = String(d.getMinutes()).padStart(2,"0");
    return `${y}/${m}/${day} ${hh}:${mm}`;
  } catch {
    return "";
  }
}

function render(list) {
  listEl.innerHTML = "";
  if (!list || list.length === 0) {
    emptyEl.textContent = "まだ投稿がありません。防災ボトル体験ページから投稿してください。";
    return;
  }
  emptyEl.textContent = "";

  list.forEach(entry => {
    const itemsHtml = (entry.items || [])
      .map(it => `<li>${it.name}（${it.score}点）</li>`)
      .join("");

    const scenario = entry.scenario ? `<div class="pill">状況：${escapeHtml(entry.scenario)}</div>` : "";
    const date = entry.createdAt ? `<div class="pill">投稿：${formatDate(entry.createdAt)}</div>` : "";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;">
        <div style="font-weight:bold;">${escapeHtml(entry.authorType || "個人")}の防災ボトル</div>
        <div class="pill">合計：${entry.totalScore || 0}点</div>
      </div>

      <div class="meta">
        ${scenario}
        ${date}
      </div>

      <ul class="items">
        ${itemsHtml}
      </ul>

      <div class="reason">
        <div style="font-weight:bold;margin-bottom:6px;">理由、使い方イメージ</div>
        ${reactionHTML(entry.id)}
        <div>${escapeHtml(entry.reason || "")}</div>
      </div>
    `;
    listEl.appendChild(card);
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function applySearch() {
  const q = (qEl.value || "").trim().toLowerCase();
  const all = loadAll();

  if (!q) {
    render(all);
    return;
  }

  const filtered = all.filter(e => {
    const hay = [
      e.authorType,
      e.scenario,
      e.reason,
      ...(e.items || []).map(it => it.name)
    ].join(" ").toLowerCase();
    return hay.includes(q);
  });

  render(filtered);
}

qEl.addEventListener("input", applySearch);
clearBtn.addEventListener("click", () => {
  qEl.value = "";
  applySearch();
});
// 初期表示
render(loadAll());

const REACT_KEY = "reactions_v1"; // 全ページ共通でOK（被らせる）

function loadReacts(){
  try { return JSON.parse(localStorage.getItem(REACT_KEY) || "{}"); }
  catch { return {}; }
}
function saveReacts(obj){
  localStorage.setItem(REACT_KEY, JSON.stringify(obj));
}

/**
 * entryId: 投稿ID
 * kind: "heart" | "like" など
 * 1端末1回のトグル（押すとON、もう一度押すとOFF）
 */
function toggleReact(entryId, kind){
  const reacts = loadReacts();
  const key = `${location.pathname}:${entryId}:${kind}`; // ページごとに分離

  if(!reacts[key]){
    reacts[key] = { on:true, count:1 };
  }else{
    // トグル
    reacts[key].on = !reacts[key].on;
    reacts[key].count += reacts[key].on ? 1 : -1;
    if(reacts[key].count < 0) reacts[key].count = 0;
  }

  saveReacts(reacts);
  return reacts[key];
}

function getReact(entryId, kind){
  const reacts = loadReacts();
  const key = `${location.pathname}:${entryId}:${kind}`;
  return reacts[key] || { on:false, count:0 };
}

function reactionHTML(entryId){
  const heart = getReact(entryId, "heart");
  const like  = getReact(entryId, "like");

  return `
    <div class="reactions">
      <button class="reactBtn ${heart.on ? "is-on":""}" data-id="${entryId}" data-kind="heart" type="button">
        💖 <span>いいね</span> <span class="reactCount">${heart.count}</span>
      </button>
      <button class="reactBtn ${like.on ? "is-on":""}" data-id="${entryId}" data-kind="like" type="button">
        👍 <span>参考になった</span> <span class="reactCount">${like.count}</span>
      </button>
    </div>
  `;
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".reactBtn");
  if(!btn) return;

  const entryId = btn.dataset.id;
  const kind = btn.dataset.kind;

  const state = toggleReact(entryId, kind);

  // 見た目更新（ボタン）
  btn.classList.toggle("is-on", state.on);
  const countEl = btn.querySelector(".reactCount");
  if(countEl) countEl.textContent = state.count;

  // 同じカード内の別ボタンも、押し状態のままにしたいならここは不要
});


