const MAX_SCORE = 15;
const STORAGE_KEY = "bousai_bottles_v1";

/* ===== カテゴリ付きにする ===== */
const itemsData = [
  { name: "飴玉2個", score: 1, category: "食料・エネルギー" },

  { name: "懐中電灯", score: 3, category: "連絡・安全" },
  { name: "笛", score: 2, category: "連絡・安全" },
  { name: "小銭", score: 1, category: "連絡・安全" },

  { name: "アルミブランケット", score: 3, category: "体温・防寒" },
  { name: "カイロ", score: 3, category: "体温・防寒" },

  { name: "ウェットティッシュ", score: 4, category: "衛生" },
  { name: "簡易トイレ", score: 4, category: "衛生" },
  { name: "備蓄用ボディタオル", score: 4, category: "衛生" },
  { name: "アルコール綿", score: 2, category: "衛生" },
  { name: "紙石鹸3枚", score: 2, category: "衛生" },
  { name: "洗剤シート", score: 2, category: "衛生" },
  { name: "マスク（袋付き）", score: 1, category: "衛生" },

  { name: "ガーゼ", score: 3, category: "医療・応急処置" },
  { name: "絆創膏", score: 1, category: "医療・応急処置" },
  { name: "サージカルテープ", score: 3, category: "医療・応急処置" },
  { name: "薬", score: 1, category: "医療・応急処置" },

  { name: "軍手（組）", score: 3, category: "作業・道具" },
  { name: "チャック付き袋", score: 1, category: "作業・道具" },
  { name: "シリコンカップ", score: 3, category: "作業・道具" }
];

/* ===== 画面要素 ===== */
const els = {
  items: document.getElementById("items"),
  total: document.getElementById("total"),
  remain: document.getElementById("remain"),
  list: document.getElementById("selectedList"),
  saveBtn: document.getElementById("saveBtn"),
  resetBtn: document.getElementById("resetBtn"),
  limitMsg: document.getElementById("limitMsg"),
  statusArea: document.getElementById("statusArea"),
  scenario: document.getElementById("scenario"),
  reason: document.getElementById("reason"),
  msg: document.getElementById("msg")
};

let selected = [];

/* ===== localStorage ===== */
function loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* ===== サンプル1件（最初だけ） ===== */
function ensureSample() {
  const list = loadAll();
  if (list.length > 0) return;

  const sample = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    authorType: "個人",
    scenario: "通学・通勤時に携行できる最小限を想定",
    items: [
      { name: "懐中電灯", score: 3 },
      { name: "アルミブランケット", score: 3 },
      { name: "マスク（袋付き）", score: 1 },
      { name: "小銭", score: 1 },
      { name: "チャック付き袋", score: 1 },
      { name: "薬", score: 1 },
      { name: "笛", score: 2 }
    ],
    totalScore: 12,
    reason: "停電や暗所移動を想定し懐中電灯を優先した。体温低下を防ぐためアルミブランケットを入れた。電子決済が使えない状況に備えて小銭も携行する。笛は助けを呼ぶ用途と居場所を知らせるため。"
  };

  saveAll([sample]);
}

/* ===== ② アイテム表示：カテゴリ見出しを挿入 ===== */
const CATEGORY_ORDER = [
  "食料・エネルギー",
  "連絡・安全",
  "体温・防寒",
  "衛生",
  "医療・応急処置",
  "作業・道具"
];

function renderItems() {
  els.items.innerHTML = "";

  CATEGORY_ORDER.forEach(cat => {
    const title = document.createElement("div");
    title.className = "catTitle";
    title.textContent = cat;
    els.items.appendChild(title);

    itemsData
      .filter(i => i.category === cat)
      .forEach(item => {
        const div = document.createElement("div");
        div.className = "item";
        div.textContent = `${item.name}（${item.score}点）`;
        div.onclick = () => toggleItem(item, div);
        els.items.appendChild(div);
        item.el = div;
      });
  });
}

function toggleItem(item, el) {
  const exists = selected.includes(item);

  if (!exists) {
    if (totalScore() + item.score > MAX_SCORE) return;
    selected.push(item);
    el.classList.add("selected");
  } else {
    selected = selected.filter(i => i !== item);
    el.classList.remove("selected");
  }

  updateUI();
}

function totalScore() {
  return selected.reduce((sum, i) => sum + i.score, 0);
}

function updateDisableState() {
  const sum = totalScore();
  itemsData.forEach(item => {
    if (!item.el) return;
    if (!selected.includes(item) && sum + item.score > MAX_SCORE) {
      item.el.classList.add("disabled");
    } else {
      item.el.classList.remove("disabled");
    }
  });
}

/* ===== ③ 選択済み：チップ表示 ===== */
function renderSelectedList() {
  els.list.innerHTML = "";

  selected.forEach(i => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${i.name}</span>
      <span class="miniScore">${i.score}点</span>
    `;
    els.list.appendChild(li);
  });
}

/* ===== UI更新 ===== */
function updateUI() {
  const sum = totalScore();
  els.total.textContent = sum;
  els.remain.textContent = MAX_SCORE - sum;

  renderSelectedList();
  updateDisableState();

  if (sum === MAX_SCORE) {
    els.limitMsg.textContent = "🎒 ボトルがいっぱいになりました！";
    els.saveBtn.disabled = false;
    els.saveBtn.classList.add("is-highlight");
    els.statusArea.scrollIntoView({ behavior: "smooth" });
  } else {
    els.limitMsg.textContent = "";
    els.saveBtn.disabled = true;
    els.saveBtn.classList.remove("is-highlight");
  }
}

/* ===== リセット ===== */
function resetAll() {
  selected = [];
  itemsData.forEach(item => {
    if (!item.el) return;
    item.el.classList.remove("selected");
    item.el.classList.remove("disabled");
  });

  els.total.textContent = 0;
  els.remain.textContent = MAX_SCORE;
  els.list.innerHTML = "";
  els.limitMsg.textContent = "";
  els.msg.textContent = "";

  els.saveBtn.disabled = true;
  els.saveBtn.classList.remove("is-highlight");

  if (els.reason) els.reason.value = "";
  if (els.scenario) els.scenario.value = "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===== 保存して共有 ===== */
function saveBottle() {
  els.msg.textContent = "";

  const sum = totalScore();
  if (sum === 0) {
    els.msg.textContent = "アイテムを1つ以上選んでください。";
    return;
  }
  if (sum > MAX_SCORE) {
    els.msg.textContent = "合計点が15点を超えています。";
    return;
  }

  const reason = (els.reason?.value || "").trim();
  if (!reason) {
    els.msg.textContent = "理由、使い方イメージを入力してください。";
    return;
  }

  const scenario = (els.scenario?.value || "").trim();

  const entry = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    authorType: "個人",
    scenario,
    items: selected.map(i => ({ name: i.name, score: i.score })),
    totalScore: sum,
    reason
  };

  const list = loadAll();
  list.unshift(entry);
  saveAll(list);

  els.msg.textContent = "保存しました。みんなの防災ボトルへ移動します。";

  setTimeout(() => {
    location.href = "./bottle_gallery.html";
  }, 600);
}

/* ===== 起動 ===== */
ensureSample();
renderItems();
updateUI();

els.resetBtn.addEventListener("click", resetAll);
els.saveBtn.addEventListener("click", saveBottle);
