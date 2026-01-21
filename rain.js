const rainEl = document.getElementById("rain");
const showBtn = document.getElementById("show");
const playBtn = document.getElementById("playSound");
const stopBtn = document.getElementById("stopSound");

const resultEl = document.getElementById("result");
const audioEl = document.getElementById("rainAudio");
const sourceEl = document.getElementById("rainSource");
const audioStatusEl = document.getElementById("audioStatus");

function rainAudioFor(mm) {
  if (mm <= 8) return "audio/rain1.mp3";
  if (mm <= 15) return "audio/rain2.mp3";
  if (mm <= 30) return "audio/rain3.mp3";
  if (mm <= 50) return "audio/rain4.mp3";
  return "audio/rain5.mp3";
}

// 風は今は「用意だけ」して実際には再生しない（雨音だけでOKならこれで十分）
function windAudioFor(mm) {
  if (mm >= 30 && mm <= 50) return "audio/wind3.mp3";
  if (mm > 50) return "audio/wind5.mp3";
  return null;
}

// 画像：rain4.jpg は無いので null にする
function imageFor(mm) {
  if (mm <= 8) return "images/rain1.jpg";
  if (mm <= 15) return "images/rain2.jpg";
  if (mm <= 30) return "images/rain3.jpg";
  if (mm <= 50) return null;
  return "images/rain5.jpg";
}

function riskInfo(level) {
  switch (level) {
    case "注意": return { icon: "⚠️", bg: "#fff3cd" };
    case "警戒": return { icon: "⚠️⚠️", bg: "#ffe0b2" };
    case "高い": return { icon: "⚠️⚠️⚠️", bg: "#ffd6d6" };
    case "非常に高い": return { icon: "🚨", bg: "#ffb3b3" };
    default: return { icon: "ℹ️", bg: "#f1f3f5" };
  }
}

function scenario(mm) {
  if (mm <= 8) {
    return {
      risk: "参考",
      title: "弱い雨でも場所によっては水がたまりやすい",
      text: [
        "側溝や低い場所では水たまりができやすくなります。",
        "普段から危険な場所を確認しておくことが大切です。"
      ]
    };
  }
  if (mm <= 15) {
    return {
      risk: "注意",
      title: "道路冠水が始まりやすくなる",
      text: [
        "排水が追いつかず、道路に水があふれる可能性があります。",
        "自転車や徒歩での移動にも注意が必要です。"
      ]
    };
  }
  if (mm <= 30) {
    return {
      risk: "警戒",
      title: "道路冠水や低地の浸水が発生しやすい",
      text: [
        "視界が悪くなり、移動が危険になることがあります。",
        "不要不急の外出を控える判断が重要です。"
      ]
    };
  }
  if (mm <= 50) {
    return {
      risk: "高い",
      title: "河川の増水や土砂災害の危険性が高まる",
      text: [
        "川沿いや山の近くでは特に警戒が必要です。",
        "避難情報をこまめに確認してください。"
      ]
    };
  }
  return {
    risk: "非常に高い",
    title: "氾濫や大規模な浸水が想定される",
    text: [
      "外出自体が非常に危険な状況です。",
      "命を守る行動を最優先してください。"
    ]
  };
}

function renderResult() {
  const mm = Number(rainEl.value);
  const s = scenario(mm);
  const risk = riskInfo(s.risk);
  const img = imageFor(mm);

  const list = s.text.map(t => `<li style="margin-bottom:6px;">${t}</li>`).join("");

  let imageHTML = "";
  if (img) {
    imageHTML = `
      <img src="./${img}" alt="雨量に対応した写真" style="max-width:100%; border-radius:12px; border:1px solid #ccc;">
      <p style="font-size:13px; color:#555; margin-top:6px;">この雨量で想定される被災イメージ</p>
    `;
  } else {
    imageHTML = `
      <div style="padding:30px; border:2px dashed #999; border-radius:12px; color:#666;">
        写真準備中（rain4.jpg を後で追加予定）
      </div>
    `;
  }

  resultEl.innerHTML = `
    <div style="background:${risk.bg}; padding:16px; border-radius:14px;">
      <p style="text-align:center; margin:0 0 8px;"><strong>${mm}mm / 1時間</strong></p>
      <h3 style="text-align:center; margin:0 0 8px;">${risk.icon} 危険度：${s.risk}</h3>
      <p style="text-align:center; font-size:18px; font-weight:bold; margin:0 0 10px;">${s.title}</p>

      <ul style="max-width:650px; margin:10px auto; padding-left:18px;">
        ${list}
      </ul>

      <div style="text-align:center; margin-top:12px;">
        ${imageHTML}
      </div>
    </div>
  `;
}

function updateAudio() {
  const mm = Number(rainEl.value);
  const rainFile = rainAudioFor(mm);

  sourceEl.src = "./" + rainFile;
  audioEl.load();

  const windFile = windAudioFor(mm);
  audioStatusEl.textContent = windFile
    ? `雨音（${rainFile}）を再生できます。強い雨では風の音も想像してみよう。`
    : `雨音（${rainFile}）を再生できます。`;
}

rainEl.addEventListener("change", () => {
  updateAudio();
  renderResult();
});

showBtn.addEventListener("click", renderResult);

playBtn.addEventListener("click", async () => {
  updateAudio();
  try {
    await audioEl.play();
  } catch (e) {
    console.error(e);
    alert("音声が再生できません。audioフォルダの配置とファイル名を確認してください。");
  }
});

stopBtn.addEventListener("click", () => {
  audioEl.pause();
  audioEl.currentTime = 0;
});

// 初期表示
updateAudio();
renderResult();
