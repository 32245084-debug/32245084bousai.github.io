const postBtn = document.getElementById("post");
const resetBtn = document.getElementById("reset");
const msgEl = document.getElementById("msg");

function parseTags(raw) {
  // "#雨量 #子ども, #避難" みたいなのを ["雨量","子ども","避難"] にする
  return (raw || "")
    .split(/[\s,、]+/g)
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t.startsWith("#") ? t.slice(1) : t)
    .filter(Boolean)
    .slice(0, 12); // タグ増えすぎ防止
}

function clearForm() {
  document.getElementById("role").value = "個人";
  document.getElementById("category").value = "防災学習";
  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
  document.getElementById("tags").value = "";
  document.getElementById("photo").value = "";
  msgEl.textContent = "";
}

resetBtn.onclick = clearForm;

postBtn.onclick = () => {
  const role = document.getElementById("role").value;
  const category = document.getElementById("category").value;
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const tags = parseTags(document.getElementById("tags").value);
  const file = document.getElementById("photo").files[0];

  if (!title || !content) {
    alert("タイトルと本文を入力してください");
    return;
  }

  const save = (imageDataUrl) => {
    const data = JSON.parse(localStorage.getItem("insights") || "[]");

    data.push({
      id: "ins_" + Date.now(),
      date: new Date().toLocaleString(),
      role,
      category,
      title,
      content,
      tags,
      image: imageDataUrl || ""
    });

    localStorage.setItem("insights", JSON.stringify(data));
    msgEl.textContent = "投稿しました。みんなの投稿一覧に反映されます。";
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => save(reader.result);
    reader.readAsDataURL(file);
  } else {
    save("");
  }
};
