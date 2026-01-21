const qEl = document.getElementById("q");
const catEl = document.getElementById("filterCategory");
const roleEl = document.getElementById("filterRole");
const clearBtn = document.getElementById("clear");
const countEl = document.getElementById("count");
const cardsEl = document.getElementById("cards");
const tagCloudEl = document.getElementById("tagCloud");

// 見本データ（複数）
const samples = [
  {
    id: "sample1",
    date: "見本",
    role: "支援者",
    category: "防災学習",
    title: "子どもは数値だけだとイメージしにくい",
    content: "雨量のmmだけでは想像が難しく、過去写真など視覚的な情報が理解を助けると感じた。",
    tags: ["雨量", "子ども", "視覚化"],
    image: ""
  },
  {
    id: "sample2",
    date: "見本",
    role: "個人",
    category: "情報共有",
    title: "口コミは早いが、情報が流れて残らない",
    content: "支援情報は口伝えで早く回る一方、後から探すのが難しく、記録として残る仕組みが必要だと思った。",
    tags: ["情報共有", "口コミ", "記録"],
    image: ""
  },
  {
    id: "sample3",
    date: "見本",
    role: "支援者",
    category: "地域のつながり",
    title: "平時のつながりが災害時の連絡網を支える",
    content: "近所付き合いの観察や声かけが、安否確認や情報収集の基礎になると実感した。",
    tags: ["つながり", "安否確認", "平時"],
    image: ""
  }
];

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem("insights") || "[]");
  } catch {
    return [];
  }
}

function normalize(str) {
  return (str || "").toString().toLowerCase();
}

function match(item, q, cat, role) {
  if (cat && item.category !== cat) return false;
  if (role && item.role !== role) return false;

  if (!q) return true;
  const nq = normalize(q);

  const hay = [
    item.title,
    item.content,
    item.category,
    item.role,
    ...(item.tags || [])
  ].map(normalize).join(" ");

  return hay.includes(nq);
}

function buildTagCloud(items) {
  const map = new Map();
  items.forEach(it => (it.tags || []).forEach(t => {
    const key = t.trim();
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  }));

  const sorted = Array.from(map.entries()).sort((a,b) => b[1]-a[1]).slice(0, 30);

  tagCloudEl.innerHTML = "";
  sorted.forEach(([tag, cnt]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = `#${tag}（${cnt}）`;
    btn.style.padding = "4px 8px";
    btn.style.border = "1px solid #ccc";
    btn.style.borderRadius = "999px";
    btn.style.background = "#fff";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
      qEl.value = tag; // タグクリックで検索欄に入れる
      render();
    };

    tagCloudEl.appendChild(btn);
  });

  if (sorted.length === 0) {
    tagCloudEl.innerHTML = "<span style='color:#777;'>タグはまだありません。</span>";
  }
}

function renderCards(items) {
  cardsEl.innerHTML = "";

  items.forEach(it => {
    const card = document.createElement("div");
    card.style.border = "1px solid #ccc";
    card.style.padding = "12px";
    card.style.marginBottom = "12px";

    const tags = (it.tags || []).map(t => `#${t}`).join(" ");

    card.innerHTML = `
      <p style="margin:0 0 6px;"><strong>${it.title}</strong></p>
      <p style="margin:0 0 6px; color:#555; font-size:13px;">
        ${it.date}｜${it.role}｜${it.category}
      </p>
      <p style="margin:0 0 8px;">${it.content}</p>
      ${tags ? `<p style="margin:0 0 8px; color:#3585b7;">${tags}</p>` : ""}
      ${it.image ? `<img src="${it.image}" alt="投稿画像" style="max-width:100%; height:auto; border:1px solid #eee; margin-top:6px;">` : ""}
    `;
    cardsEl.appendChild(card);
  });

  if (items.length === 0) {
    cardsEl.innerHTML = "<p style='color:#777;'>条件に一致する投稿がありません。</p>";
  }
}

function render() {
  const q = qEl.value.trim();
  const cat = catEl.value;
  const role = roleEl.value;

  const saved = loadSaved();
  const all = [...samples, ...saved];

  // タグ一覧は全体から作る（蓄積が見える）
  buildTagCloud(all);

  // 絞り込み
  const filtered = all.filter(it => match(it, q, cat, role));

  countEl.textContent = `表示件数：${filtered.length}件`;
  renderCards(filtered);
}

[qEl, catEl, roleEl].forEach(el => el.addEventListener("input", render));
clearBtn.onclick = () => {
  qEl.value = "";
  catEl.value = "";
  roleEl.value = "";
  render();
};

render();
