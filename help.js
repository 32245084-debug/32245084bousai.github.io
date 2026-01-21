const postBtn = document.getElementById("post");
const resetBtn = document.getElementById("reset");
const msgEl = document.getElementById("msg");

function clearForm() {
  document.getElementById("role").value = "個人";
  document.getElementById("category").value = "物資";
  document.getElementById("urgency").value = "低";
  document.getElementById("place").value = "";
  document.getElementById("title").value = "";
  document.getElementById("text").value = "";
  document.getElementById("photo").value = "";
  msgEl.textContent = "";
}

resetBtn.onclick = clearForm;

postBtn.onclick = () => {
  const role = document.getElementById("role").value;
  const category = document.getElementById("category").value;
  const urgency = document.getElementById("urgency").value;
  const place = document.getElementById("place").value.trim();
  const title = document.getElementById("title").value.trim();
  const text = document.getElementById("text").value.trim();
  const file = document.getElementById("photo").files[0];

  if (!text) {
    alert("内容を入力してください");
    return;
  }

  const save = (imageDataUrl) => {
    const data = JSON.parse(localStorage.getItem("help_posts") || "[]");

    data.push({
      id: "help_" + Date.now(),
      date: new Date().toLocaleString(),
      role,
      category,
      urgency,
      place,
      title,
      text,
      image: imageDataUrl || ""
    });

    localStorage.setItem("help_posts", JSON.stringify(data));
    msgEl.textContent = "投稿しました。掲示板に反映されます。";
  };

  // 画像があればBase64化して保存
  if (file) {
    const reader = new FileReader();
    reader.onload = () => save(reader.result);
    reader.readAsDataURL(file);
  } else {
    save("");
  }
};
