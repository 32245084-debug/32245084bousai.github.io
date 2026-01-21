const qEl = document.getElementById("q");
const catEl = document.getElementById("filterCategory");
const urgEl = document.getElementById("filterUrgency");
const roleEl = document.getElementById("filterRole");
const clearBtn = document.getElementById("clear");
const clearDataBtn = document.getElementById("clearData");
const countEl = document.getElementById("count");
const boardEl = document.getElementById("board");

// 見本データ（最初から表示）
const samples = [
  {
    id: "sample_help_1",
    date: "見本",
    role: "個人",
    category: "物資",
    urgency: "高",
    place: "中島仮設団地",
    title: "毛布が足りません",
    text: "寒さが厳しく、毛布が足りず困っています。余っている方がいれば共有方法を相談したいです。",
    image: ""
  },
  {
    id: "sample_help_2",
    date: "見本",
    role: "支援者",
    category: "移動・送迎",
    urgency: "中",
    place: "",
    title: "送迎できます",
    text: "車での送迎が可能です。病院や買い出しなど、必要があれば連絡方法を調整します。",
    image: ""
  },
  {
    id: "sample_help_3",
    date: "見本",
    role: "個人",
    category: "情報",
    urgency: "低",
    place: "七尾市内",
    title: "イベント情報を探しています",
    text: "交流イベントや炊き出しの情報を知りたいです。どこで確認できるか教えてください。",
    image: ""
  }
];

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem("help_posts") || "[]");
  } catch {
    return [];
  }
}

function normalize(str) {
  return (str || "").toString().toLowerCase();
}

function match(post, q, cat, urg, role) {
  if (cat && post.category !== cat) return false;
  if (urg && post.urgency !== urg) return false;
  if (role && post.role !== role) return false;

  if (!q) return true;
  const nq = normalize(q);
  const hay = [
    post.title,
    post.text,
    post.place,
    post.category,
    post.urgency,
    post.role
  ].map(normalize).join(" ");

  return hay.includes(nq);
}

function renderCards(posts) {
  boardEl.innerHTML = "";

  posts.forEach(p => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "12px";
    div.style.marginBottom = "12px";

    div.innerHTML = `
      <p style="margin:0 0 6px;">
        <strong>${p.title || "（タイトルなし）"}</strong>
      </p>
      <p style="margin:0 0 6px; color:#555; font-size:13px;">
        ${p.date}｜${p.role}｜${p.category}｜緊急度：${p.urgency}${p.place ? `｜場所：${p.place}` : ""}
      </p>
      <p style="margin:0 0 8px;">${p.text}</p>
      ${p.image ? `<img src="${p.image}" alt="添付画像" style="max-width:100%; height:auto; border:1px solid #eee; margin-top:6px;">` : ""}
    `;

    boardEl.appendChild(div);
  });

  if (posts.length === 0) {
    boardEl.innerHTML = "<p style='color:#777;'>条件に一致する投稿がありません。</p>";
  }
}

function render() {
  const q = qEl.value.trim();
  const cat = catEl.value;
  const urg = urgEl.value;
  const role = roleEl.value;

  const saved = loadSaved();
  const all = [...samples, ...saved];

  const filtered = all.filter(p => match(p, q, cat, urg, role));
  countEl.textContent = `表示件数：${filtered.length}件`;

  renderCards(filtered);
}

// イベント
[qEl, catEl, urgEl, roleEl].forEach(el => el.addEventListener("input", render));
clearBtn.onclick = () => {
  qEl.value = "";
  catEl.value = "";
  urgEl.value = "";
  roleEl.value = "";
  render();
};

// デモ用：保存投稿だけ消す（見本は残る）
clearDataBtn.onclick = () => {
  localStorage.removeItem("help_posts");
  render();
};

render();
