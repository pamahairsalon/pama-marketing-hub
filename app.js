const searchInput = document.querySelector("#contentSearch");
const contentCards = [...document.querySelectorAll(".content-card, .care-card")];
const trendCards = [...document.querySelectorAll(".trend-topic")];
const postFilters = [...document.querySelectorAll("[data-filter]")];
const careFilters = [...document.querySelectorAll("[data-care-filter]")];
const postGrid = document.querySelector("#postGrid");
const careGrid = document.querySelector("#careGrid");

let postCategory = "作品分享";
let careCategory = "服務後關心";

function filterContent(resetScroll = true) {
  const query = (searchInput?.value || "").trim().toLocaleLowerCase();

  contentCards.forEach(card => {
    const category = card.dataset.category;
    const kind = card.dataset.kind;
    const categoryMatch = kind === "post"
      ? (postCategory === "all" || category === postCategory)
      : (careCategory === "all" || category === careCategory);
    const searchMatch = !query || (card.dataset.search + " " + card.innerText).toLocaleLowerCase().includes(query);
    card.hidden = !(categoryMatch && searchMatch);
  });

  trendCards.forEach(card => {
    card.hidden = Boolean(query) && !card.innerText.toLocaleLowerCase().includes(query);
  });

  const postCount = contentCards.filter(card => card.dataset.kind === "post" && !card.hidden).length;
  const careCount = contentCards.filter(card => card.dataset.kind === "care" && !card.hidden).length;
  const postCountLabel = document.querySelector("#postResultCount");
  const careCountLabel = document.querySelector("#careResultCount");

  if (postCountLabel) {
    postCountLabel.textContent = postCount
      ? `此分類共有 ${postCount} 則發文話術，可在下方區域上下滑動瀏覽。`
      : "目前沒有符合的發文內容，請更換分類或搜尋詞。";
  }
  if (careCountLabel) {
    careCountLabel.textContent = careCount
      ? `此分類共有 ${careCount} 則關懷訊息，可在下方區域上下滑動瀏覽。`
      : "目前沒有符合的關懷情境，請更換分類或搜尋詞。";
  }

  if (resetScroll) {
    if (postGrid) postGrid.scrollTop = 0;
    if (careGrid) careGrid.scrollTop = 0;
  }
}

searchInput?.addEventListener("input", () => filterContent(true));
searchInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    const firstVisible = [...contentCards, ...trendCards].find(card => !card.hidden);
    firstVisible?.scrollIntoView({behavior:"smooth", block:"center"});
  }
});

postFilters.forEach(button => button.addEventListener("click", () => {
  postCategory = button.dataset.filter;
  postFilters.forEach(item => item.classList.toggle("active", item === button));
  filterContent(true);
}));
careFilters.forEach(button => button.addEventListener("click", () => {
  careCategory = button.dataset.careFilter;
  careFilters.forEach(item => item.classList.toggle("active", item === button));
  filterContent(true);
}));

filterContent(true);

const toast = document.querySelector("#toast");
let toastTimer;
document.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
  const text = button.dataset.copy || "";
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    copied = document.execCommand("copy");
    helper.remove();
  }
  toast.textContent = copied ? "已複製，可以貼到社群或訊息中囉！" : "複製未成功，請手動選取文字。";
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}));

const menuButton = document.querySelector(".menu-toggle");
menuButton?.addEventListener("click", () => {
  const nav = document.querySelector("#mainNav");
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  nav?.classList.toggle("mobile-open", !expanded);
});
document.querySelectorAll("#mainNav a").forEach(link => link.addEventListener("click", () => {
  document.querySelector("#mainNav")?.classList.remove("mobile-open");
  menuButton?.setAttribute("aria-expanded", "false");
}));

// PAMA Graphic Maker — runs locally in the designer's browser.
const graphicCanvas = document.querySelector("#graphicCanvas");
const graphicType = document.querySelector("#graphicType");
const graphicFormat = document.querySelector("#graphicFormat");
const graphicHeadline = document.querySelector("#graphicHeadline");
const graphicSubtitle = document.querySelector("#graphicSubtitle");
const graphicBody = document.querySelector("#graphicBody");
const graphicCta = document.querySelector("#graphicCta");
const graphicPhoto = document.querySelector("#graphicPhoto");
const graphicCaption = document.querySelector("#graphicCaption");
const graphicDownload = document.querySelector("#graphicDownload");
const graphicCopy = document.querySelector("#graphicCopy");
const previewDimension = document.querySelector("#previewDimension");
const graphicContext = graphicCanvas?.getContext("2d");
let graphicPhotoImage = null;

const graphicPresets = {
  work: {
    headline:"讓髮型，成為你的風格",
    subtitle:"從適合自己的設計開始",
    body:"依照臉型、髮質與日常習慣，找到最適合你的造型方向。",
    cta:"預約你的專屬造型提案",
    caption:"每一次的髮型設計，都從了解你開始。依照自己的喜好、髮況與日常習慣，找到真正適合的造型。想嘗試新的樣子，歡迎和我聊聊。"
  },
  knowledge: {
    headline:"好整理的髮型，從細節開始",
    subtitle:"剪裁與日常習慣都很重要",
    body:"適合的層次、長度與輪廓，能讓每天整理頭髮更符合自己的生活節奏。",
    cta:"一起找到適合你的剪裁",
    caption:"好整理的髮型，不只是跟上流行，更要符合自己的髮質、髮流與生活習慣。下一次整理頭髮時，也可以和設計師聊聊最在意的細節。"
  },
  care: {
    headline:"把日常照護，變成好髮質",
    subtitle:"了解髮況，選擇適合的方式",
    body:"從清潔、吹整到居家養護，依照目前髮況調整照護習慣。",
    cta:"詢問適合自己的養護方式",
    caption:"漂亮的髮型，也需要日常照護一起成就。了解自己的髮況，選擇適合的清潔與養護方式，讓柔順與光澤成為日常。"
  },
  booking: {
    headline:"留一點時間，整理喜歡的自己",
    subtitle:"近期預約時段開放安排",
    body:"想整理髮型、調整髮色或安排養護，歡迎提前與設計師討論。",
    cta:"私訊設計師安排時間",
    caption:"最近想幫頭髮換個樣子嗎？剪髮、染髮、燙髮或養護，都可以先和我聊聊你的想法，再一起安排適合的時間。"
  },
  seasonal: {
    headline:"為季節，換一種新的風格",
    subtitle:"讓造型跟上生活的每個時刻",
    body:"從髮色、線條到日常造型，找到適合當下自己的變化。",
    cta:"聊聊你的季節造型提案",
    caption:"每個季節都有新的靈感。想嘗試不一樣的髮色、剪裁或造型嗎？可以依照髮況與平常習慣，一起找到適合自己的改變。"
  }
};

function showGraphicToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2500);
}

function roundedPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapGraphicText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const paragraphs = String(text || "").split("\n");
  const lines = [];
  paragraphs.forEach((paragraph, paragraphIndex) => {
    let current = "";
    for (const character of paragraph) {
      const candidate = current + character;
      if (current && ctx.measureText(candidate).width > maxWidth) {
        lines.push(current);
        current = character;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    if (paragraphIndex < paragraphs.length - 1) lines.push("");
  });
  const visibleLines = lines.slice(0, maxLines);
  visibleLines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + visibleLines.length * lineHeight;
}

function drawPhotoCover(ctx, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const cropWidth = width / scale;
  const cropHeight = height / scale;
  const cropX = (image.width - cropWidth) / 2;
  const cropY = (image.height - cropHeight) / 2;
  ctx.save();
  roundedPath(ctx, x, y, width, height, 18);
  ctx.clip();
  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, x, y, width, height);
  ctx.restore();
}

const graphicLogo = new Image();
graphicLogo.onload = () => renderGraphic();
graphicLogo.src = "assets/pama-logo.svg";

function renderGraphic() {
  if (!graphicCanvas || !graphicContext) return;
  const isStory = graphicFormat?.value === "story";
  const width = 1080;
  const height = isStory ? 1920 : 1350;
  if (graphicCanvas.width !== width) graphicCanvas.width = width;
  if (graphicCanvas.height !== height) graphicCanvas.height = height;
  if (previewDimension) previewDimension.textContent = isStory ? "1080 × 1920 px" : "1080 × 1350 px";

  const ctx = graphicContext;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#FFF6E9";
  ctx.fillRect(0, 0, width, height);

  // Top brand header
  if (graphicLogo.complete && graphicLogo.naturalWidth) {
    ctx.drawImage(graphicLogo, 62, 38, 205, 75);
  } else {
    ctx.fillStyle = "#375B57";
    ctx.font = "600 33px Georgia, serif";
    ctx.fillText("PAMA", 62, 86);
  }
  ctx.textAlign = "right";
  ctx.fillStyle = "#7F8B80";
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText("DESIGNER'S STYLE NOTE", 1018, 82);
  ctx.textAlign = "left";
  ctx.fillStyle = "#DFB743";
  ctx.fillRect(62, 133, 956, 2);

  ctx.fillStyle = "#A28B4D";
  ctx.font = "600 17px Arial, sans-serif";
  ctx.fillText((graphicType?.selectedOptions?.[0]?.textContent || "PAMA STYLE").toUpperCase(), 68, 190);

  ctx.fillStyle = "#294744";
  ctx.font = "500 48px 'Noto Serif TC', 'Songti TC', serif";
  wrapGraphicText(ctx, graphicHeadline?.value || "分享你的專屬風格", 68, 254, 940, 62, 2);

  ctx.fillStyle = "#78847B";
  ctx.font = "24px 'Noto Sans TC', sans-serif";
  wrapGraphicText(ctx, graphicSubtitle?.value || "", 70, 316, 930, 36, 1);

  const imageY = 365;
  const imageHeight = isStory ? 900 : 490;
  const imageX = 60;
  const imageWidth = 960;
  if (graphicPhotoImage) {
    drawPhotoCover(ctx, graphicPhotoImage, imageX, imageY, imageWidth, imageHeight);
  } else {
    ctx.save();
    roundedPath(ctx, imageX, imageY, imageWidth, imageHeight, 18);
    ctx.clip();
    const gradient = ctx.createLinearGradient(imageX, imageY, imageX + imageWidth, imageY + imageHeight);
    gradient.addColorStop(0, "#B8B8A8");
    gradient.addColorStop(0.55, "#718279");
    gradient.addColorStop(1, "#375B57");
    ctx.fillStyle = gradient;
    ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
    ctx.fillStyle = "rgba(255,246,233,.15)";
    ctx.beginPath();
    ctx.ellipse(720, imageY + imageHeight * .46, 300, imageHeight * .52, -.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,246,233,.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(540, imageY + imageHeight * .5, 395, imageHeight * .58, .18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#FFF6E9";
    ctx.font = "italic 29px Georgia, serif";
    ctx.fillText("YOUR PHOTO", 95, imageY + imageHeight - 45);
    ctx.restore();
  }

  const bottomY = imageY + imageHeight + (isStory ? 78 : 63);
  ctx.fillStyle = "#A28B4D";
  ctx.font = "600 17px Arial, sans-serif";
  ctx.fillText("PAMA / HAIR DESIGN", 68, bottomY);
  ctx.fillStyle = "#294744";
  ctx.font = "500 34px 'Noto Serif TC', 'Songti TC', serif";
  const bodyEnd = wrapGraphicText(ctx, graphicBody?.value || "", 68, bottomY + 57, 920, 46, isStory ? 4 : 3);

  const ctaY = isStory ? 1690 : 1138;
  roundedPath(ctx, 68, ctaY - 42, 455, 62, 31);
  ctx.fillStyle = "#375B57";
  ctx.fill();
  ctx.fillStyle = "#FFF6E9";
  ctx.font = "500 22px 'Noto Sans TC', sans-serif";
  ctx.fillText(graphicCta?.value || "了解更多造型提案", 94, ctaY - 3);

  ctx.fillStyle = "#9A9B8E";
  ctx.font = "16px Arial, sans-serif";
  ctx.fillText("PROFESSIONAL · ACTIVE · MODERN · ARTISTIC", 68, height - 47);
  ctx.textAlign = "right";
  ctx.fillStyle = "#A28B4D";
  ctx.fillText("PAMA SALON", 1018, height - 47);
  ctx.textAlign = "left";
}

function applyGraphicPreset() {
  const preset = graphicPresets[graphicType?.value || "work"];
  if (!preset) return;
  if (graphicHeadline) graphicHeadline.value = preset.headline;
  if (graphicSubtitle) graphicSubtitle.value = preset.subtitle;
  if (graphicBody) graphicBody.value = preset.body;
  if (graphicCta) graphicCta.value = preset.cta;
  if (graphicCaption) graphicCaption.value = preset.caption;
  renderGraphic();
}

[graphicHeadline, graphicSubtitle, graphicBody, graphicCta].forEach(field => {
  field?.addEventListener("input", renderGraphic);
});
graphicFormat?.addEventListener("change", renderGraphic);
graphicType?.addEventListener("change", applyGraphicPreset);

graphicPhoto?.addEventListener("change", () => {
  const file = graphicPhoto.files?.[0];
  if (!file) {
    graphicPhotoImage = null;
    renderGraphic();
    return;
  }
  if (!file.type.startsWith("image/")) {
    showGraphicToast("請選擇圖片檔案。");
    graphicPhoto.value = "";
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    showGraphicToast("圖片請控制在 12 MB 以內。");
    graphicPhoto.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      graphicPhotoImage = image;
      renderGraphic();
    };
    image.onerror = () => showGraphicToast("圖片讀取失敗，請換一張照片。");
    image.src = String(reader.result);
  };
  reader.onerror = () => showGraphicToast("圖片讀取失敗，請重試。");
  reader.readAsDataURL(file);
});

graphicDownload?.addEventListener("click", () => {
  if (!graphicCanvas) return;
  graphicCanvas.toBlob(blob => {
    if (!blob) {
      showGraphicToast("圖卡產生失敗，請重新試一次。");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = graphicFormat?.value === "story" ? "PAMA-限時動態圖卡.png" : "PAMA-貼文圖卡.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showGraphicToast("圖卡已下載！");
  }, "image/png");
});

graphicCopy?.addEventListener("click", async () => {
  const text = graphicCaption?.value || "";
  if (!text.trim()) {
    showGraphicToast("請先輸入貼文文案。");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showGraphicToast("貼文文案已複製！");
  } catch {
    graphicCaption?.focus();
    graphicCaption?.select();
    const copied = document.execCommand("copy");
    showGraphicToast(copied ? "貼文文案已複製！" : "請手動選取文案複製。");
  }
});

if (graphicCanvas) {
  if (document.fonts?.ready) document.fonts.ready.then(renderGraphic);
  else renderGraphic();
}


// PAMA Free Prompt Helper — no API key, paid plugin or company seat required.
const pamaPromptTask=document.querySelector("#pamaPromptTask");
const pamaPromptService=document.querySelector("#pamaPromptService");
const pamaPromptDetails=document.querySelector("#pamaPromptDetails");
const pamaPromptPlatform=document.querySelector("#pamaPromptPlatform");
const pamaPromptTone=document.querySelector("#pamaPromptTone");
const pamaPromptExtra=document.querySelector("#pamaPromptExtra");
const pamaPromptResult=document.querySelector("#pamaPromptResult");
const pamaPromptGenerate=document.querySelector("#pamaPromptGenerate");
const pamaPromptCopy=document.querySelector("#pamaPromptCopy");
const pamaPromptReset=document.querySelector("#pamaPromptReset");
const pamaPromptTasks={
work:{name:"髮型作品分享貼文",goal:"撰寫一篇能呈現作品特色、吸引適合客群並自然引導諮詢的作品分享內容。",requirements:"提供2個不同切入角度，先列出最推薦版本。包含吸引人的開頭、作品特色、適合族群或造型亮點，以及自然的預約／諮詢引導。不要捏造服務效果、價格、時間或顧客評價。"},
story:{name:"Instagram 限時動態",goal:"把資訊整理成容易閱讀、能快速吸引注意的限時動態內容。",requirements:"規劃3張連續限時動態，每張包含主標、簡短內文與建議互動方式。文字精簡，避免一張塞入太多資訊。"},
reels:{name:"Reels 短影音腳本",goal:"規劃一支適合手機直式拍攝的短影音。",requirements:"提供15～30秒腳本，按秒數分鏡，包含畫面、字幕、口白／旁白、拍攝建議與結尾行動引導。以門店實際能拍攝的畫面為主，不假設有昂貴器材。"},
knowledge:{name:"髮型／造型知識內容",goal:"把髮型或造型知識轉化成消費者看得懂、願意收藏的內容。",requirements:"提供3個實用重點及適合社群閱讀的標題。不確定的專業內容請標示待設計師確認，不誇大效果或保證結果。"},
care:{name:"服務後顧客關心",goal:"撰寫一段服務後自然、有溫度的關心訊息。",requirements:"提供短版及較親切版各一則，像設計師親自傳送，不要立刻推銷；提醒事項只依實際服務內容，不自行推測。"},
revisit:{name:"熟客回訪邀約",goal:"撰寫不造成壓力的熟客回訪訊息。",requirements:"提供2種語氣版本，避免催促。若沒有提供上次服務日期或建議回訪時間，不要自行編造。"},
reply:{name:"顧客訊息回覆",goal:"協助設計師回覆顧客訊息，清楚、親切並維持專業。",requirements:"先整理顧客想問的重點，再提供可直接傳送的回覆。資訊不足時列出需確認的問題，不要自行承諾價格、時段、效果或補償。"},
campaign:{name:"活動／節慶宣傳",goal:"把活動資訊整理成清楚、有吸引力且不過度促銷的社群文案。",requirements:"先整理活動時間、對象、內容、價格或優惠（僅使用已提供資訊），再提供貼文版本與限動精簡版。不得捏造規則、名額、價格或截止日期。"}
};
function buildPamaPrompt(){
 const item=pamaPromptTasks[pamaPromptTask?.value||"work"];
 if(!item||!pamaPromptResult)return;
 const service=(pamaPromptService?.value||"").trim();
 const details=(pamaPromptDetails?.value||"").trim();
 const extra=(pamaPromptExtra?.value||"").trim();
 pamaPromptResult.value=[
 "請你扮演「帕瑪造型沙龍」的專業社群與顧客服務內容助理，協助我完成以下工作。","","【品牌背景與語氣】",
 "品牌：帕瑪造型沙龍（PAMA Hair Salon）。品牌核心為 Professional（專業）、Active（熱情）、Modern（時尚）、Artistic（藝術）。",
 "請使用台灣繁體中文，語氣自然、專業、有溫度及質感；避免浮誇、硬銷、過度制式或中國用語。不要把男士燙髮當成品牌整體定位。",
 "不得自行編造價格、優惠、營業時間、門店資訊或服務承諾；資訊不足時請先詢問，不要猜測。","","【本次任務】",
 "工作類型："+item.name,"工作目標："+item.goal,"發布／使用平台："+(pamaPromptPlatform?.value||"Instagram 貼文"),
 "希望的文字風格："+(pamaPromptTone?.value||"自然、有質感"),"作品或服務資訊："+(service||"未提供，請勿自行假設"),
 "希望呈現的重點："+(details||"請依已提供資料整理；不足時先詢問"),"其他補充："+(extra||"無"),"","【交付要求】",
 item.requirements,"請先提供可直接使用的完整版本，再簡短列出需要我確認或補充的資訊。文字要適合手機閱讀，並把標題、內文、行動引導清楚分開。",
 "如果資訊不足，先提出最多3個最重要的問題，不要憑空補資料。","","【顧客隱私】",
 "不要要求或輸出顧客姓名、電話、LINE ID、地址、健康狀況或其他可識別個人的敏感資料。請使用匿名描述。"
 ].join("\n");
 pamaPromptResult.focus();
}
pamaPromptGenerate?.addEventListener("click",()=>{buildPamaPrompt();showGraphicToast("帕瑪專屬指令已產生！");});
pamaPromptCopy?.addEventListener("click",async()=>{
 const text=pamaPromptResult?.value||"";
 if(!text.trim()){showGraphicToast("請先產生指令。");return;}
 try{await navigator.clipboard.writeText(text);showGraphicToast("指令已複製！接著開啟 ChatGPT 貼上即可。");}
 catch{pamaPromptResult?.focus();pamaPromptResult?.select();const copied=document.execCommand("copy");showGraphicToast(copied?"指令已複製！":"請手動選取指令複製。");}
});
pamaPromptReset?.addEventListener("click",()=>{
 if(pamaPromptTask)pamaPromptTask.value="work";
 if(pamaPromptService)pamaPromptService.value="";
 if(pamaPromptDetails)pamaPromptDetails.value="";
 if(pamaPromptPlatform)pamaPromptPlatform.value="Instagram 貼文";
 if(pamaPromptTone)pamaPromptTone.selectedIndex=0;
 if(pamaPromptExtra)pamaPromptExtra.value="";
 if(pamaPromptResult)pamaPromptResult.value="";
 showGraphicToast("已清除內容。");
});
