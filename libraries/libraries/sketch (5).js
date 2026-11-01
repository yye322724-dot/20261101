// ============================================================
// 露營裝備小管家：雙關卡拖曳與情境選擇遊戲
// 使用方式：請將本檔案完整貼到 p5.js Web Editor 的 sketch.js。
// 本程式只使用 p5.js 基本圖形與 emoji，不使用圖片、音效或外部檔案。
// ============================================================

// ------------------------------
// 遊戲狀態：清楚分成五個主要畫面。
// start：關卡介紹頁。
// drag：關卡一，將用品拖進露營背包。
// level1Complete：關卡一完成後的過場頁。
// situation：關卡二，逐題回答五題情境題。
// result：顯示全部分數與作答摘要。
// ------------------------------
let state = "start";

// ------------------------------
// 關卡一的 15 個用品資料。
// correct 為 true 代表露營時應準備；false 代表干擾用品。
// inBag 為 true 代表目前已放入露營背包。
// ------------------------------
const items = [
  { name: "帳篷", emoji: "⛺", correct: true, inBag: false },
  { name: "睡袋", emoji: "🛌", correct: true, inBag: false },
  { name: "睡墊", emoji: "🧘", correct: true, inBag: false },
  { name: "手電筒", emoji: "🔦", correct: true, inBag: false },
  { name: "頭燈", emoji: "💡", correct: true, inBag: false },
  { name: "飲用水", emoji: "💧", correct: true, inBag: false },
  { name: "食物", emoji: "🍱", correct: true, inBag: false },
  { name: "雨衣", emoji: "🧥", correct: true, inBag: false },
  { name: "急救包", emoji: "🩹", correct: true, inBag: false },
  { name: "垃圾袋", emoji: "🗑️", correct: true, inBag: false },
  { name: "電視", emoji: "📺", correct: false, inBag: false },
  { name: "大型玩具", emoji: "🧸", correct: false, inBag: false },
  { name: "電腦螢幕", emoji: "🖥️", correct: false, inBag: false },
  { name: "花瓶", emoji: "🏺", correct: false, inBag: false },
  { name: "室內拖鞋", emoji: "🥿", correct: false, inBag: false }
];

// ------------------------------
// 關卡二的五題情境選擇題。
// answer 以 A、B、C 表示正確選項。
// ------------------------------
const situations = [
  {
    question: "開始下大雨，帳篷附近的地面開始積水，應該怎麼做？",
    options: [
      { label: "A", text: "留在原地等待" },
      { label: "B", text: "移動到安全、較高且不積水的位置" },
      { label: "C", text: "到溪邊查看水位" }
    ],
    answer: "B",
    explanation: "遇到大雨或積水時，應移動到安全、較高且不積水的位置，並遠離溪流與低窪處。"
  },
  {
    question: "在森林中迷路了，第一個較適合的做法是什麼？",
    options: [
      { label: "A", text: "繼續亂走找路" },
      { label: "B", text: "留在相對安全的位置並發出求救訊號" },
      { label: "C", text: "躲起來睡覺" }
    ],
    answer: "B",
    explanation: "迷路時不要任意亂走，應留在相對安全的位置，並利用哨子、手機或聲音求救。"
  },
  {
    question: "發現附近有野生動物時，應該怎麼做？",
    options: [
      { label: "A", text: "靠近拍照" },
      { label: "B", text: "保持距離，不餵食也不追趕" },
      { label: "C", text: "拿食物吸引牠" }
    ],
    answer: "B",
    explanation: "遇到野生動物應保持距離，避免餵食、挑釁或追趕，並慢慢離開。"
  },
  {
    question: "露營結束離開前，最重要的環境整理工作是什麼？",
    options: [
      { label: "A", text: "把垃圾留在營地" },
      { label: "B", text: "將垃圾帶走並恢復場地整潔" },
      { label: "C", text: "把食物丟在樹下" }
    ],
    answer: "B",
    explanation: "離開營地前應帶走所有垃圾，盡量恢復原本環境，做到不留下痕跡。"
  },
  {
    question: "露營時發現自己有小擦傷，應該怎麼做？",
    options: [
      { label: "A", text: "用乾淨的水清潔並使用急救用品處理" },
      { label: "B", text: "用泥土塗在傷口上" },
      { label: "C", text: "完全不處理" }
    ],
    answer: "A",
    explanation: "小擦傷應先用乾淨的水清潔，再使用適當的急救用品；傷勢嚴重時應尋求協助。"
  }
];

// ------------------------------
// 關卡一與關卡二的分數及結果資料。
// 關卡一最高 10 分，關卡二最高 5 分，滿分總計 15 分。
// ------------------------------
let level1Score = 0;
let correctSelected = [];
let missedItems = [];
let wrongSelected = [];
let situationScore = 0;
let situationCurrent = 0;
let situationAnswerSelected = null;
let situationSummary = [];

// ------------------------------
// 各畫面按鈕的碰撞區域。
// ------------------------------
let startButton = null;
let confirmButton = null;
let continueButton = null;
let situationNextButton = null;
let restartButton = null;
let situationOptionRects = [];

// ------------------------------
// 關卡一拖曳與觸控變數。
// ------------------------------
let draggingItem = null;
let dragPointerOffsetX = 0;
let dragPointerOffsetY = 0;
let dragSourceWasBag = false;
let lastTouchX = 0;
let lastTouchY = 0;
let touchIsScrolling = false;
let suppressNextMouse = false;

// ------------------------------
// 各畫面的畫布內部捲動位置。
// ------------------------------
let contentScroll = 0;
let contentMaxScroll = 0;
let situationScroll = 0;
let situationMaxScroll = 0;
let resultScroll = 0;
let resultMaxScroll = 0;
let situationTouchScrolling = false;
let resultTouchScrolling = false;

// ------------------------------
// 滿分彩帶陣列與動畫控制變數。
// ------------------------------
let confetti = [];
let confettiActive = false;
let confettiFrameCount = 0;

// ------------------------------
// 共用配色設定。
// ------------------------------
const palette = {
  background: [242, 238, 224],
  green: [67, 112, 75],
  darkGreen: [45, 78, 53],
  lightGreen: [218, 233, 211],
  cream: [255, 253, 244],
  brown: [115, 88, 61],
  orange: [202, 126, 54],
  red: [182, 73, 65],
  border: [139, 135, 108]
};

// ============================================================
// p5.js 初始化與主迴圈
// ============================================================

// ------------------------------
// 建立全螢幕畫布並關閉瀏覽器外部捲動。
// ------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont("sans-serif");

  // 讓手機觸控只作用在畫布，不觸發瀏覽器頁面捲動。
  const canvasElement = document.querySelector("canvas");
  if (canvasElement) {
    canvasElement.style.touchAction = "none";
    canvasElement.style.display = "block";
  }

  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.style.background = "#f2eee0";
}

// ------------------------------
// 根據 state 繪製目前畫面。
// ------------------------------
function draw() {
  if (state === "start") {
    drawStartScreen();
  } else if (state === "drag") {
    drawDragScreen();
  } else if (state === "level1Complete") {
    drawLevel1CompleteScreen();
  } else if (state === "situation") {
    drawSituationScreen();
  } else if (state === "result") {
    drawResultScreen();
  }
}

// ============================================================
// start：關卡介紹畫面
// ============================================================

// ------------------------------
// 顯示遊戲名稱、兩個關卡與遊戲流程。
// ------------------------------
function drawStartScreen() {
  background(...palette.background);
  drawBackgroundDecoration();

  fill(...palette.darkGreen);
  noStroke();
  textSize(min(width * 0.085, 64));
  text("露營裝備小管家", width / 2, height * 0.16);

  fill(...palette.brown);
  textSize(min(width * 0.030, 21));
  text("完成兩個關卡，學會做好露營前準備！", width / 2, height * 0.235);

  // 依照螢幕寬度安排兩張關卡說明卡。
  const isSmall = width < 680;
  const margin = isSmall ? 20 : 42;
  const gap = isSmall ? 14 : 24;
  const cardW = isSmall ? width - margin * 2 : (width - margin * 2 - gap) / 2;
  const cardH = isSmall ? 112 : 150;
  const cardsY = height * 0.30;

  drawLevelIntroCard(
    margin,
    cardsY,
    cardW,
    cardH,
    "關卡一：露營裝備",
    "把需要的用品拖進露營背包",
    "⛺",
    color(...palette.green)
  );

  const secondX = isSmall ? margin : margin + cardW + gap;
  const secondY = isSmall ? cardsY + cardH + gap : cardsY;
  drawLevelIntroCard(
    secondX,
    secondY,
    cardW,
    cardH,
    "關卡二：情境題",
    "完成 5 題露營安全選擇題",
    "🧭",
    color(...palette.orange)
  );

  // 明確說明一定要先完成關卡一，再按繼續進入關卡二。
  const noteY = isSmall ? secondY + cardH + 30 : cardsY + cardH + 35;
  fill(...palette.darkGreen);
  textSize(isSmall ? 15 : 18);
  text("請先完成關卡一，按下確認清單後，再按「繼續到關卡二」開始情境題。", width / 2, noteY);

  // 開始挑戰按鈕固定在說明文字下方。
  const buttonW = min(width * 0.58, 310);
  const buttonH = 58;
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = min(height - 90, noteY + 42);
  drawButton(buttonX, buttonY, buttonW, buttonH, "開始挑戰", color(...palette.green));
  startButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };
}

// ------------------------------
// 繪製開始頁的單張關卡說明卡。
// ------------------------------
function drawLevelIntroCard(x, y, w, h, title, description, icon, cardColor) {
  fill(255, 253, 244);
  stroke(cardColor);
  strokeWeight(3);
  rect(x, y, w, h, 18);

  noStroke();
  fill(cardColor);
  textSize(min(h * 0.34, 48));
  text(icon, x + w * 0.16, y + h / 2);

  fill(...palette.darkGreen);
  textSize(min(w * 0.075, 23));
  text(title, x + w * 0.60, y + h * 0.38);

  fill(...palette.brown);
  textSize(min(w * 0.050, 16));
  text(description, x + w * 0.60, y + h * 0.68);
}

// ============================================================
// drag：關卡一用品拖曳
// ============================================================

// ------------------------------
// 繪製關卡一的標題、用品區、背包與確認按鈕。
// ------------------------------
function drawDragScreen() {
  background(235, 243, 230);
  const layout = calculateGameLayout();
  drawGameHeader(layout);

  // 只讓中間內容區受到內部捲動影響。
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, layout.contentTop, width, layout.contentBottom - layout.contentTop);
  drawingContext.clip();

  push();
  translate(0, -contentScroll);
  drawItemsArea(layout);
  drawBagArea(layout);
  drawDraggingCard();
  pop();
  drawingContext.restore();

  if (contentMaxScroll > 0) {
    drawScrollHint(layout.contentTop, "上下滑動畫布可查看更多用品與背包內容");
  }

  drawConfirmButton(layout);
}

// ------------------------------
// 計算桌面左右排列與手機上下排列的響應式版面。
// ------------------------------
function calculateGameLayout() {
  const isSmall = width < 760;
  const headerH = isSmall ? 102 : 112;
  const bottomH = isSmall ? 76 : 82;
  const contentTop = headerH;
  const contentBottom = max(contentTop + 80, height - bottomH);
  const gap = isSmall ? 14 : 22;
  const margin = isSmall ? 12 : 24;

  let itemsX;
  let itemsY;
  let itemsW;
  let bagX;
  let bagY;
  let bagW;
  let bagH;
  let cardW;
  let cardH;
  let columns;
  let contentHeight;

  if (isSmall) {
    itemsX = margin;
    itemsY = contentTop + 12;
    itemsW = width - margin * 2;
    columns = width < 430 ? 3 : 4;
    cardW = (itemsW - gap * (columns - 1)) / columns;
    cardH = 82;
    const rows = ceil(items.length / columns);
    bagX = margin;
    bagY = itemsY + 18 + rows * (cardH + gap) + 26;
    bagW = width - margin * 2;
    bagH = max(230, min(300, height * 0.42));
    contentHeight = bagY + bagH + 24;
  } else {
    itemsX = margin;
    itemsY = contentTop + 18;
    itemsW = width * 0.53 - margin * 1.5;
    columns = width >= 1120 ? 3 : 2;
    cardW = (itemsW - gap * (columns - 1)) / columns;
    cardH = 88;
    bagX = itemsX + itemsW + gap;
    bagY = contentTop + 18;
    bagW = width - bagX - margin;
    bagH = max(220, contentBottom - bagY - 18);
    contentHeight = max(
      bagY + bagH + 18,
      itemsY + 18 + ceil(items.length / columns) * (cardH + gap) + 18
    );
  }

  contentMaxScroll = max(0, contentHeight - (contentBottom - contentTop));
  contentScroll = constrain(contentScroll, 0, contentMaxScroll);

  return {
    isSmall,
    headerH,
    bottomH,
    contentTop,
    contentBottom,
    itemsX,
    itemsY,
    itemsW,
    bagX,
    bagY,
    bagW,
    bagH,
    cardW,
    cardH,
    columns,
    gap,
    margin
  };
}

// ------------------------------
// 繪製關卡一固定在上方的標題列。
// ------------------------------
function drawGameHeader(layout) {
  fill(...palette.darkGreen);
  noStroke();
  textSize(layout.isSmall ? 24 : 34);
  text("關卡一：露營裝備", width / 2, 28);

  fill(...palette.brown);
  textSize(layout.isSmall ? 13 : 17);
  text("把需要的用品拖進露營背包；拖出背包即可取消", width / 2, 61);

  const bagCount = items.filter((item) => item.inBag).length;
  fill(...palette.green);
  textSize(layout.isSmall ? 14 : 16);
  text("背包內：" + bagCount + " / " + items.length + " 項", width / 2, layout.headerH - 18);
}

// ------------------------------
// 繪製尚未放入背包的用品卡片。
// ------------------------------
function drawItemsArea(layout) {
  fill(...palette.darkGreen);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(layout.isSmall ? 18 : 22);
  text("用品清單", layout.itemsX, layout.itemsY - 10);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.inBag || item === draggingItem) {
      continue;
    }

    const column = i % layout.columns;
    const row = floor(i / layout.columns);
    const x = layout.itemsX + column * (layout.cardW + layout.gap);
    const y = layout.itemsY + 18 + row * (layout.cardH + layout.gap);
    setItemRect(item, x, y, layout.cardW, layout.cardH, "left");
    drawItemCard(item, x, y, layout.cardW, layout.cardH, false);
  }

  textAlign(CENTER, CENTER);
}

// ------------------------------
// 繪製露營背包區與背包內的用品卡片。
// ------------------------------
function drawBagArea(layout) {
  const hoveringBag = draggingItem !== null && isInside(
    dragX(),
    dragY(),
    layout.bagX,
    layout.bagY,
    layout.bagW,
    layout.bagH
  );

  fill(hoveringBag ? color(218, 239, 208) : color(250, 248, 235));
  stroke(hoveringBag ? color(...palette.green) : color(...palette.border));
  strokeWeight(3);
  rect(layout.bagX, layout.bagY, layout.bagW, layout.bagH, 24);

  noStroke();
  fill(...palette.darkGreen);
  textAlign(CENTER, CENTER);
  textSize(layout.isSmall ? 32 : 44);
  text("🎒", layout.bagX + layout.bagW / 2, layout.bagY + (layout.isSmall ? 40 : 48));
  textSize(layout.isSmall ? 21 : 29);
  text("露營背包", layout.bagX + layout.bagW / 2, layout.bagY + (layout.isSmall ? 78 : 92));

  const bagItems = items.filter((item) => item.inBag && item !== draggingItem);
  const bagTop = layout.bagY + (layout.isSmall ? 105 : 125);
  const bagGap = layout.isSmall ? 8 : 12;
  const bagColumns = 3;
  const innerW = layout.bagW - 24;
  const bagCardW = (innerW - bagGap * (bagColumns - 1)) / bagColumns;
  const bagCardH = layout.isSmall ? 67 : 78;

  for (let n = 0; n < bagItems.length; n++) {
    const item = bagItems[n];
    const column = n % bagColumns;
    const row = floor(n / bagColumns);
    const x = layout.bagX + 12 + column * (bagCardW + bagGap);
    const y = bagTop + row * (bagCardH + bagGap);
    setItemRect(item, x, y, bagCardW, bagCardH, "bag");
    drawItemCard(item, x, y, bagCardW, bagCardH, true);
  }

  if (bagItems.length === 0) {
    fill(...palette.brown);
    textSize(layout.isSmall ? 15 : 18);
    text("把你認為需要的用品拖到這裡", layout.bagX + layout.bagW / 2, layout.bagY + layout.bagH - 35);
  }

  textAlign(CENTER, CENTER);
}

// ------------------------------
// 繪製單張用品卡片，使用 emoji 與用品名稱。
// ------------------------------
function drawItemCard(item, x, y, w, h, inBagView) {
  const hovering = isInside(mouseX, mouseY + contentScroll, x, y, w, h);

  if (inBagView) {
    fill(224, 239, 216);
  } else if (hovering) {
    fill(246, 249, 232);
  } else {
    fill(...palette.cream);
  }

  stroke(inBagView ? color(...palette.green) : color(...palette.border));
  strokeWeight(2);
  rect(x, y, w, h, 14);

  noStroke();
  textAlign(CENTER, CENTER);
  textSize(min(w * 0.30, inBagView ? 29 : 36));
  text(item.emoji, x + w / 2, y + h * 0.35);

  fill(...palette.darkGreen);
  textSize(min(w * 0.16, inBagView ? 15 : 17));
  text(item.name, x + w / 2, y + h * 0.78);
}

// ------------------------------
// 繪製正在拖曳中的浮動用品卡片。
// ------------------------------
function drawDraggingCard() {
  if (!draggingItem) {
    return;
  }

  const x = dragX() - dragPointerOffsetX;
  const y = dragY() - dragPointerOffsetY;
  push();
  drawingContext.globalAlpha = 0.88;
  drawItemCard(draggingItem, x, y, draggingItem.w, draggingItem.h, dragSourceWasBag);
  drawingContext.globalAlpha = 1;
  pop();
}

// ------------------------------
// 繪製畫布內部捲動提示。
// ------------------------------
function drawScrollHint(y, message) {
  noStroke();
  fill(235, 243, 230, 225);
  rect(0, y, width, 24);
  fill(...palette.brown);
  textAlign(CENTER, CENTER);
  textSize(12);
  text(message, width / 2, y + 12);
}

// ------------------------------
// 繪製固定在底部的確認清單按鈕。
// ------------------------------
function drawConfirmButton(layout) {
  const buttonW = min(width * 0.60, 310);
  const buttonH = max(52, min(layout.bottomH - 16, 64));
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = height - layout.bottomH + (layout.bottomH - buttonH) / 2;
  drawButton(buttonX, buttonY, buttonW, buttonH, "確認清單", color(...palette.green));
  confirmButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };
}

// ============================================================
// level1Complete：關卡一完成過場頁
// ============================================================

// ------------------------------
// 顯示關卡一用品分數與進入關卡二的明確按鈕。
// ------------------------------
function drawLevel1CompleteScreen() {
  background(...palette.background);
  drawBackgroundDecoration();

  fill(...palette.darkGreen);
  noStroke();
  textSize(min(width * 0.075, 52));
  text("關卡一完成！", width / 2, height * 0.22);

  fill(...palette.green);
  textSize(min(width * 0.060, 40));
  text("用品分數：" + level1Score + " / 10 分", width / 2, height * 0.36);

  fill(...palette.brown);
  textSize(min(width * 0.030, 21));
  text("你已經完成露營用品檢查，接下來挑戰 5 題情境題！", width / 2, height * 0.47);
  text("準備好後，按下按鈕進入關卡二。", width / 2, height * 0.53);

  const buttonW = min(width * 0.70, 360);
  const buttonH = 62;
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = height * 0.63;
  drawButton(buttonX, buttonY, buttonW, buttonH, "繼續到關卡二", color(...palette.green));
  continueButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };
}

// ============================================================
// situation：關卡二五題情境選擇題
// ============================================================

// ------------------------------
// 繪製情境題、選項、答題回饋與下一題按鈕。
// ------------------------------
function drawSituationScreen() {
  background(...palette.background);
  drawBackgroundDecoration();

  const isSmall = width < 700;
  const headerH = isSmall ? 88 : 108;
  const bottomH = 78;
  const contentTop = headerH;
  const contentBottom = max(contentTop + 100, height - bottomH);
  const margin = isSmall ? 14 : 34;
  const boxW = width - margin * 2;
  const question = situations[situationCurrent];
  const questionY = contentTop + 18;
  const questionH = isSmall ? 150 : 132;
  const optionY = questionY + questionH + 16;
  const optionH = isSmall ? 65 : 68;
  const optionGap = isSmall ? 10 : 12;
  const feedbackY = optionY + question.options.length * (optionH + optionGap) + 8;
  const feedbackH = isSmall ? 205 : 150;

  const contentHeight = situationAnswerSelected === null
    ? optionY + question.options.length * (optionH + optionGap) + 20
    : feedbackY + feedbackH + 20;

  situationMaxScroll = max(0, contentHeight - (contentBottom - contentTop));
  situationScroll = constrain(situationScroll, 0, situationMaxScroll);

  fill(...palette.darkGreen);
  noStroke();
  textSize(isSmall ? 24 : 34);
  text("關卡二：情境題", width / 2, 29);
  fill(...palette.brown);
  textSize(isSmall ? 14 : 17);
  text("第 " + (situationCurrent + 1) + " / " + situations.length + " 題｜答對一題得 1 分", width / 2, 65);

  // 只捲動題目內容，不捲動標題與底部按鈕。
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, contentTop, width, contentBottom - contentTop);
  drawingContext.clip();

  push();
  translate(0, -situationScroll);

  fill(255, 253, 244);
  stroke(...palette.border);
  strokeWeight(2);
  rect(margin, questionY, boxW, questionH, 18);
  fill(...palette.darkGreen);
  noStroke();
  drawWrappedCenteredText(question.question, width / 2, questionY + 14, boxW - 28, questionH - 28, isSmall ? 19 : 25);

  situationOptionRects = [];
  for (let i = 0; i < question.options.length; i++) {
    const option = question.options[i];
    const y = optionY + i * (optionH + optionGap);
    let optionFill = color(255, 253, 244);
    let optionStroke = color(...palette.border);

    if (situationAnswerSelected !== null) {
      if (option.label === question.answer) {
        optionFill = color(218, 239, 208);
        optionStroke = color(...palette.green);
      } else if (option.label === situationAnswerSelected) {
        optionFill = color(248, 218, 211);
        optionStroke = color(...palette.red);
      }
    } else if (isInside(mouseX, mouseY + situationScroll, margin, y, boxW, optionH)) {
      optionFill = color(236, 244, 225);
    }

    fill(optionFill);
    stroke(optionStroke);
    strokeWeight(2);
    rect(margin, y, boxW, optionH, 14);
    fill(...palette.darkGreen);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(isSmall ? 16 : 19);
    text(option.label + ".", margin + 14, y + optionH / 2);
    drawWrappedLeftText(option.text, margin + 42, y + 10, boxW - 56, optionH - 18, isSmall ? 16 : 19);
    situationOptionRects.push({ x: margin, y, w: boxW, h: optionH, label: option.label });
  }

  // 選擇後顯示答對、答錯、正確答案與解說。
  if (situationAnswerSelected !== null) {
    const isCorrect = situationAnswerSelected === question.answer;
    fill(isCorrect ? color(229, 245, 220) : color(252, 231, 225));
    stroke(isCorrect ? color(...palette.green) : color(...palette.red));
    strokeWeight(2);
    rect(margin, feedbackY, boxW, feedbackH, 16);
    noStroke();
    fill(isCorrect ? color(...palette.green) : color(...palette.red));
    textAlign(CENTER, CENTER);
    textSize(isSmall ? 23 : 28);
    text(isCorrect ? "答對了！" : "答錯了！", width / 2, feedbackY + 26);
    fill(...palette.darkGreen);
    textSize(isSmall ? 15 : 18);
    text("正確答案：" + question.answer, width / 2, feedbackY + 59);
    drawWrappedCenteredText(question.explanation, width / 2, feedbackY + 78, boxW - 28, feedbackH - 88, isSmall ? 15 : 18);
  }

  pop();
  drawingContext.restore();

  if (situationMaxScroll > 0) {
    drawScrollHint(contentTop, "上下滑動可查看題目與答題解說");
  }

  situationNextButton = null;
  if (situationAnswerSelected !== null) {
    const buttonW = min(width * 0.58, 310);
    const buttonH = 58;
    const buttonX = width / 2 - buttonW / 2;
    const buttonY = height - bottomH + (bottomH - buttonH) / 2;
    const label = situationCurrent === situations.length - 1 ? "查看總結結果" : "下一題";
    drawButton(buttonX, buttonY, buttonW, buttonH, label, color(...palette.green));
    situationNextButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };
  }
}

// ------------------------------
// 將文字依畫面寬度逐字換行後置中繪製。
// ------------------------------
function drawWrappedCenteredText(value, centerX, startY, maxWidth, maxHeight, fontSizeValue) {
  textAlign(CENTER, TOP);
  textSize(fontSizeValue);
  const lines = wrapText(value, maxWidth);
  const lineHeight = fontSizeValue * 1.42;
  const visibleLines = min(lines.length, max(1, floor(maxHeight / lineHeight)));
  const totalHeight = visibleLines * lineHeight;
  let y = startY + (maxHeight - totalHeight) / 2;

  for (let i = 0; i < visibleLines; i++) {
    text(lines[i], centerX, y);
    y += lineHeight;
  }
  textAlign(CENTER, CENTER);
}

// ------------------------------
// 將文字逐字換行後靠左繪製。
// ------------------------------
function drawWrappedLeftText(value, x, startY, maxWidth, maxHeight, fontSizeValue) {
  textAlign(LEFT, TOP);
  textSize(fontSizeValue);
  const lines = wrapText(value, maxWidth);
  const lineHeight = fontSizeValue * 1.35;
  const visibleLines = min(lines.length, max(1, floor(maxHeight / lineHeight)));
  let y = startY + (maxHeight - visibleLines * lineHeight) / 2;

  for (let i = 0; i < visibleLines; i++) {
    text(lines[i], x, y);
    y += lineHeight;
  }
  textAlign(CENTER, CENTER);
}

// ------------------------------
// 以字元寬度切割繁體中文，避免文字超出卡片。
// ------------------------------
function wrapText(value, maxWidth) {
  const lines = [];
  let current = "";

  for (const character of value) {
    const testLine = current + character;
    if (current.length > 0 && textWidth(testLine) > maxWidth) {
      lines.push(current);
      current = character;
    } else {
      current = testLine;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }
  return lines.length > 0 ? lines : [""];
}

// ============================================================
// result：總結結果頁
// ============================================================

// ------------------------------
// 顯示兩關分數、總分、用品清單與情境題摘要。
// 小螢幕會自動啟用結果區內部捲動。
// ------------------------------
function drawResultScreen() {
  background(...palette.background);
  drawBackgroundDecoration();

  const isSmall = width < 700;
  const headerH = isSmall ? 134 : 148;
  const bottomH = 78;
  const contentTop = headerH;
  const contentBottom = max(contentTop + 100, height - bottomH);
  const margin = isSmall ? 12 : 28;
  const gap = isSmall ? 10 : 16;
  const contentW = width - margin * 2;
  const totalScore = level1Score + situationScore;
  const isPerfect = level1Score === 10 && situationScore === situations.length;

  // 標題與分數固定在結果頁上方。
  fill(...palette.darkGreen);
  noStroke();
  textSize(isSmall ? 28 : 42);
  text("全部挑戰結果", width / 2, 29);
  fill(...palette.green);
  textSize(isSmall ? 21 : 30);
  text("總分：" + totalScore + " / 15 分", width / 2, 70);
  fill(...palette.brown);
  textSize(isSmall ? 14 : 17);
  text("關卡一用品：" + level1Score + " / 10｜關卡二答對：" + situationScore + " / 5", width / 2, 106);

  // 滿分時顯示恭喜訊息，非滿分時顯示鼓勵文字。
  if (isPerfect) {
    fill(...palette.orange);
    textSize(isSmall ? 18 : 24);
    text("恭喜你完成所有挑戰！", width / 2, 130);
  } else {
    fill(...palette.brown);
    textSize(isSmall ? 15 : 18);
    text("再檢查一次用品與情境題，就能挑戰更高分！", width / 2, 130);
  }

  const summaryH = isSmall ? 126 : 112;
  const listY = contentTop + summaryH + gap;
  const listH = isSmall ? 154 : 240;
  const columnW = isSmall ? contentW : (contentW - gap * 2) / 3;
  const secondListY = isSmall ? listY + listH + gap : listY;
  const thirdListY = isSmall ? secondListY + listH + gap : listY;
  const situationY = isSmall ? thirdListY + listH + gap : listY + listH + gap;
  const situationH = isSmall ? 230 : 190;
  const contentHeight = situationY + situationH + 20;

  resultMaxScroll = max(0, contentHeight - (contentBottom - contentTop));
  resultScroll = constrain(resultScroll, 0, resultMaxScroll);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, contentTop, width, contentBottom - contentTop);
  drawingContext.clip();

  push();
  translate(0, -resultScroll);
  drawScoreSummary(margin, contentTop, contentW, summaryH, isSmall);
  drawResultBox("選對的用品", correctSelected, margin, listY, columnW, listH, color(...palette.green), isSmall);
  drawResultBox("漏選的用品", missedItems, isSmall ? margin : margin + columnW + gap, secondListY, columnW, listH, color(...palette.orange), isSmall);
  drawResultBox("誤選的用品", wrongSelected, isSmall ? margin : margin + (columnW + gap) * 2, thirdListY, columnW, listH, color(...palette.red), isSmall);
  drawSituationSummary(margin, situationY, contentW, situationH, isSmall);
  pop();
  drawingContext.restore();

  if (resultMaxScroll > 0) {
    drawScrollHint(contentTop, "上下滑動可查看完整結果與情境題摘要");
  }

  const buttonW = min(width * 0.58, 310);
  const buttonH = 58;
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = height - bottomH + (bottomH - buttonH) / 2;
  drawButton(buttonX, buttonY, buttonW, buttonH, "重新挑戰", color(...palette.green));
  restartButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };

  // 滿分時使用 p5.js 基本圖形更新彩帶動畫。
  if (isPerfect) {
    drawConfetti();
  }
}

// ------------------------------
// 繪製分數明細區塊。
// ------------------------------
function drawScoreSummary(x, y, w, h, isSmall) {
  fill(255, 253, 244);
  stroke(...palette.border);
  strokeWeight(2);
  rect(x, y, w, h, 16);

  noStroke();
  fill(...palette.darkGreen);
  textSize(isSmall ? 17 : 22);
  text("分數明細", x + w / 2, y + 24);
  fill(...palette.brown);
  textSize(isSmall ? 14 : 18);
  text("關卡一用品：" + level1Score + " 分", x + w * 0.25, y + h * 0.62);
  text("關卡二情境：" + situationScore + " 分", x + w * 0.75, y + h * 0.62);
}

// ------------------------------
// 繪製選對、漏選、誤選用品清單。
// ------------------------------
function drawResultBox(title, list, x, y, w, h, titleColor, isSmall) {
  fill(255, 253, 244);
  stroke(...palette.border);
  strokeWeight(2);
  rect(x, y, w, h, 16);

  noStroke();
  fill(titleColor);
  textSize(isSmall ? 17 : min(w * 0.13, 23));
  text(title, x + w / 2, y + 25);

  fill(...palette.brown);
  textSize(isSmall ? 14 : min(w * 0.105, 17));
  if (list.length === 0) {
    text("無", x + w / 2, y + h / 2 + 8);
    return;
  }

  const columns = isSmall && list.length > 3 ? 2 : 1;
  const rows = ceil(list.length / columns);
  const colW = (w - 20) / columns;
  const lineH = min(24, max(16, (h - 47) / max(rows, 1)));

  for (let i = 0; i < list.length; i++) {
    const column = i % columns;
    const row = floor(i / columns);
    const itemX = x + 10 + colW * column + colW / 2;
    const itemY = y + 50 + lineH * row;
    text("・" + list[i], itemX, itemY);
  }
}

// ------------------------------
// 繪製五題情境題的作答摘要。
// ------------------------------
function drawSituationSummary(x, y, w, h, isSmall) {
  fill(255, 253, 244);
  stroke(...palette.border);
  strokeWeight(2);
  rect(x, y, w, h, 16);

  noStroke();
  fill(...palette.darkGreen);
  textSize(isSmall ? 17 : 22);
  text("情境題作答摘要", x + w / 2, y + 24);

  const lineH = isSmall ? 35 : 28;
  textAlign(LEFT, CENTER);
  textSize(isSmall ? 13 : 16);
  for (let i = 0; i < situationSummary.length; i++) {
    const record = situationSummary[i];
    const correct = record.selected === record.answer;
    fill(correct ? color(...palette.green) : color(...palette.red));
    text(
      (i + 1) + ". " + (correct ? "答對" : "答錯") +
      "｜你的答案：" + record.selected + "｜正確答案：" + record.answer,
      x + 14,
      y + 54 + i * lineH
    );
  }
  textAlign(CENTER, CENTER);
}

// ============================================================
// 滑鼠與觸控互動事件
// ============================================================

// ------------------------------
// 滑鼠按下時依照不同 state 處理按鈕、選項與拖曳。
// ------------------------------
function mousePressed() {
  if (suppressNextMouse) {
    suppressNextMouse = false;
    return false;
  }

  if (state === "start") {
    if (startButton && isInside(mouseX, mouseY, startButton.x, startButton.y, startButton.w, startButton.h)) {
      beginGame();
    }
    return false;
  }

  if (state === "drag") {
    if (confirmButton && isInside(mouseX, mouseY, confirmButton.x, confirmButton.y, confirmButton.w, confirmButton.h)) {
      calculateLevel1Result();
      state = "level1Complete";
      draggingItem = null;
      return false;
    }
    startDraggingAt(mouseX, mouseY);
    return false;
  }

  if (state === "level1Complete") {
    if (continueButton && isInside(mouseX, mouseY, continueButton.x, continueButton.y, continueButton.w, continueButton.h)) {
      startSituation();
    }
    return false;
  }

  if (state === "situation") {
    handleSituationPointer(mouseX, mouseY);
    return false;
  }

  if (state === "result") {
    if (restartButton && isInside(mouseX, mouseY, restartButton.x, restartButton.y, restartButton.w, restartButton.h)) {
      beginGame();
    }
    return false;
  }

  return false;
}

// ------------------------------
// 滑鼠拖曳與放開用品。
// ------------------------------
function mouseDragged() {
  if (state === "drag" && draggingItem) {
    updateDraggingAt(mouseX, mouseY);
  }
  return false;
}

function mouseReleased() {
  if (state === "drag" && draggingItem) {
    finishDraggingAt(mouseX, mouseY);
  }
  return false;
}

// ------------------------------
// 手機觸控開始：支援按鈕、拖曳、情境選項與內部捲動。
// ------------------------------
function touchStarted() {
  const point = getTouchPoint();
  if (!point) {
    return false;
  }

  suppressNextMouse = true;
  lastTouchX = point.x;
  lastTouchY = point.y;

  if (state === "start") {
    if (startButton && isInside(point.x, point.y, startButton.x, startButton.y, startButton.w, startButton.h)) {
      beginGame();
    }
    return false;
  }

  if (state === "drag") {
    if (confirmButton && isInside(point.x, point.y, confirmButton.x, confirmButton.y, confirmButton.w, confirmButton.h)) {
      calculateLevel1Result();
      state = "level1Complete";
      draggingItem = null;
      return false;
    }

    const grabbed = startDraggingAt(point.x, point.y);
    if (!grabbed) {
      touchIsScrolling = true;
    }
    return false;
  }

  if (state === "level1Complete") {
    if (continueButton && isInside(point.x, point.y, continueButton.x, continueButton.y, continueButton.w, continueButton.h)) {
      startSituation();
    }
    return false;
  }

  if (state === "situation") {
    if (situationNextButton && isInside(point.x, point.y, situationNextButton.x, situationNextButton.y, situationNextButton.w, situationNextButton.h)) {
      goToNextSituation();
      return false;
    }

    if (situationAnswerSelected === null) {
      const selected = handleSituationPointer(point.x, point.y);
      if (!selected) {
        situationTouchScrolling = true;
      }
    } else {
      situationTouchScrolling = true;
    }
    return false;
  }

  if (state === "result") {
    if (restartButton && isInside(point.x, point.y, restartButton.x, restartButton.y, restartButton.w, restartButton.h)) {
      beginGame();
      return false;
    }
    resultTouchScrolling = true;
    return false;
  }

  return false;
}

// ------------------------------
// 手機觸控移動：更新拖曳或各畫面的內部捲動。
// ------------------------------
function touchMoved() {
  const point = getTouchPoint();
  if (!point) {
    return false;
  }

  if (state === "drag") {
    if (draggingItem) {
      updateDraggingAt(point.x, point.y);
    } else if (touchIsScrolling) {
      contentScroll = constrain(contentScroll + lastTouchY - point.y, 0, contentMaxScroll);
      lastTouchY = point.y;
    }
    lastTouchX = point.x;
    return false;
  }

  if (state === "situation" && situationTouchScrolling) {
    situationScroll = constrain(situationScroll + lastTouchY - point.y, 0, situationMaxScroll);
    lastTouchY = point.y;
    return false;
  }

  if (state === "result" && resultTouchScrolling) {
    resultScroll = constrain(resultScroll + lastTouchY - point.y, 0, resultMaxScroll);
    lastTouchY = point.y;
    return false;
  }

  return false;
}

// ------------------------------
// 手機觸控結束：完成用品拖曳並清除觸控捲動狀態。
// ------------------------------
function touchEnded() {
  const point = getTouchPoint();
  const endX = point ? point.x : lastTouchX;
  const endY = point ? point.y : lastTouchY;

  if (state === "drag" && draggingItem) {
    finishDraggingAt(endX, endY);
  }

  draggingItem = null;
  touchIsScrolling = false;
  situationTouchScrolling = false;
  resultTouchScrolling = false;
  return false;
}

// ------------------------------
// 滑鼠滾輪控制目前畫面的內部捲動。
// ------------------------------
function mouseWheel(event) {
  if (state === "drag" && contentMaxScroll > 0) {
    contentScroll = constrain(contentScroll + event.delta, 0, contentMaxScroll);
    return false;
  }
  if (state === "situation" && situationMaxScroll > 0) {
    situationScroll = constrain(situationScroll + event.delta, 0, situationMaxScroll);
    return false;
  }
  if (state === "result" && resultMaxScroll > 0) {
    resultScroll = constrain(resultScroll + event.delta, 0, resultMaxScroll);
    return false;
  }
}

// ============================================================
// 關卡流程、拖曳與計分函式
// ============================================================

// ------------------------------
// 開始遊戲或重新挑戰時重設所有資料，回到關卡一。
// ------------------------------
function beginGame() {
  for (const item of items) {
    item.inBag = false;
    item.x = 0;
    item.y = 0;
    item.w = 0;
    item.h = 0;
    item.area = "";
  }

  level1Score = 0;
  correctSelected = [];
  missedItems = [];
  wrongSelected = [];
  situationScore = 0;
  situationCurrent = 0;
  situationAnswerSelected = null;
  situationSummary = [];

  draggingItem = null;
  contentScroll = 0;
  contentMaxScroll = 0;
  situationScroll = 0;
  situationMaxScroll = 0;
  resultScroll = 0;
  resultMaxScroll = 0;
  touchIsScrolling = false;
  situationTouchScrolling = false;
  resultTouchScrolling = false;
  confetti = [];
  confettiActive = false;
  confettiFrameCount = 0;

  state = "drag";
}

// ------------------------------
// 從關卡一過場頁進入關卡二第一題。
// ------------------------------
function startSituation() {
  situationCurrent = 0;
  situationScore = 0;
  situationAnswerSelected = null;
  situationSummary = [];
  situationOptionRects = [];
  situationScroll = 0;
  situationMaxScroll = 0;
  state = "situation";
}

// ------------------------------
// 在用品卡片上開始拖曳，並支援內容內部捲動座標。
// ------------------------------
function startDraggingAt(pointerX, pointerY) {
  calculateGameLayout();
  const contentX = pointerX;
  const contentY = pointerY + contentScroll;

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (!item.w || !item.h) {
      continue;
    }

    if (isInside(contentX, contentY, item.x, item.y, item.w, item.h)) {
      draggingItem = item;
      dragSourceWasBag = item.inBag;
      dragPointerOffsetX = contentX - item.x;
      dragPointerOffsetY = contentY - item.y;
      touchIsScrolling = false;
      return true;
    }
  }
  return false;
}

// ------------------------------
// 保留此函式讓滑鼠與觸控拖曳流程清楚分開。
// ------------------------------
function updateDraggingAt(pointerX, pointerY) {
  lastTouchX = pointerX;
  lastTouchY = pointerY;
}

// ------------------------------
// 放開用品時，依卡片中心是否位於背包中決定是否放入。
// ------------------------------
function finishDraggingAt(pointerX, pointerY) {
  if (!draggingItem) {
    return;
  }

  const layout = calculateGameLayout();
  const contentX = pointerX;
  const contentY = pointerY + contentScroll;
  const cardX = contentX - dragPointerOffsetX;
  const cardY = contentY - dragPointerOffsetY;
  const centerX = cardX + draggingItem.w / 2;
  const centerY = cardY + draggingItem.h / 2;
  const droppedInBag = isInside(centerX, centerY, layout.bagX, layout.bagY, layout.bagW, layout.bagH);

  draggingItem.inBag = droppedInBag;
  draggingItem = null;
  touchIsScrolling = false;
}

// ------------------------------
// 計算關卡一分數與選對、漏選、誤選清單。
// 最高分為選對 10 項用品，共 10 分。
// ------------------------------
function calculateLevel1Result() {
  level1Score = 0;
  correctSelected = [];
  missedItems = [];
  wrongSelected = [];

  for (const item of items) {
    if (item.correct && item.inBag) {
      level1Score += 1;
      correctSelected.push(item.name);
    } else if (item.correct && !item.inBag) {
      level1Score -= 1;
      missedItems.push(item.name);
    } else if (!item.correct && item.inBag) {
      level1Score -= 1;
      wrongSelected.push(item.name);
    }
  }
}

// ------------------------------
// 處理情境題選項或固定的下一題按鈕。
// ------------------------------
function handleSituationPointer(pointerX, pointerY) {
  if (situationAnswerSelected !== null) {
    if (situationNextButton && isInside(pointerX, pointerY, situationNextButton.x, situationNextButton.y, situationNextButton.w, situationNextButton.h)) {
      goToNextSituation();
    }
    return false;
  }

  const contentY = pointerY + situationScroll;
  for (const optionRect of situationOptionRects) {
    if (isInside(pointerX, contentY, optionRect.x, optionRect.y, optionRect.w, optionRect.h)) {
      answerSituation(optionRect.label);
      return true;
    }
  }
  return false;
}

// ------------------------------
// 選擇情境題後顯示回饋，答對才增加情境題分數。
// ------------------------------
function answerSituation(selectedLabel) {
  if (situationAnswerSelected !== null) {
    return;
  }

  const question = situations[situationCurrent];
  situationAnswerSelected = selectedLabel;
  if (selectedLabel === question.answer) {
    situationScore += 1;
  }

  situationSummary.push({
    selected: selectedLabel,
    answer: question.answer
  });
  situationScroll = 0;
}

// ------------------------------
// 按下一題；第五題後進入總結結果頁。
// ------------------------------
function goToNextSituation() {
  if (situationAnswerSelected === null) {
    return;
  }

  if (situationCurrent >= situations.length - 1) {
    resultScroll = 0;
    confettiActive = level1Score === 10 && situationScore === situations.length;
    if (confettiActive) {
      createConfetti();
    }
    state = "result";
    return;
  }

  situationCurrent += 1;
  situationAnswerSelected = null;
  situationScroll = 0;
  situationMaxScroll = 0;
  situationOptionRects = [];
}

// ============================================================
// 滿分彩帶動畫：只使用 p5.js 基本圖形
// ============================================================

// ------------------------------
// 建立從畫面上方落下的彩帶資料陣列。
// ------------------------------
function createConfetti() {
  confetti = [];
  const confettiColors = [
    color(230, 80, 79),
    color(246, 180, 55),
    color(79, 144, 190),
    color(92, 170, 93),
    color(160, 97, 190),
    color(244, 123, 77)
  ];

  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: random(width),
      y: random(-height, -10),
      speed: random(1.5, 4.5),
      drift: random(-0.8, 0.8),
      angle: random(TWO_PI),
      spin: random(-0.12, 0.12),
      w: random(6, 13),
      h: random(10, 23),
      color: random(confettiColors),
      shape: random(["rect", "triangle"])
    });
  }
  confettiFrameCount = 0;
}

// ------------------------------
// 更新並繪製彩帶；彩帶會持續飄落一段時間後再循環補充。
// ------------------------------
function drawConfetti() {
  if (!confettiActive) {
    return;
  }

  confettiFrameCount += 1;
  for (const piece of confetti) {
    piece.y += piece.speed;
    piece.x += piece.drift + sin(frameCount * 0.02 + piece.angle) * 0.35;
    piece.angle += piece.spin;

    if (piece.y > height + 30) {
      piece.y = random(-180, -20);
      piece.x = random(width);
    }

    push();
    translate(piece.x, piece.y);
    rotate(piece.angle);
    fill(piece.color);
    noStroke();

    if (piece.shape === "triangle") {
      triangle(0, -piece.h / 2, piece.w / 2, piece.h / 2, -piece.w / 2, piece.h / 2);
    } else {
      rectMode(CENTER);
      rect(0, 0, piece.w, piece.h, 2);
      rectMode(CORNER);
    }
    pop();
  }
}

// ============================================================
// 共用繪圖工具
// ============================================================

// ------------------------------
// 繪製具有 hover 效果的圓角按鈕。
// ------------------------------
function drawButton(x, y, w, h, label, buttonColor) {
  const hovering = isInside(mouseX, mouseY, x, y, w, h);
  const displayColor = hovering ? lerpColor(buttonColor, color(255), 0.14) : buttonColor;

  fill(displayColor);
  stroke(...palette.darkGreen);
  strokeWeight(2);
  rect(x, y, w, h, 16);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(min(w * 0.105, 24));
  text(label, x + w / 2, y + h / 2);
}

// ------------------------------
// 判斷座標是否位於矩形內。
// ------------------------------
function isInside(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

// ------------------------------
// 取得目前拖曳指標的內容座標。
// ------------------------------
function dragX() {
  return mouseX;
}

function dragY() {
  return mouseY + contentScroll;
}

// ------------------------------
// 記錄用品卡片的碰撞區域。
// ------------------------------
function setItemRect(item, x, y, w, h, area) {
  item.x = x;
  item.y = y;
  item.w = w;
  item.h = h;
  item.area = area;
}

// ------------------------------
// 取得第一根觸控手指座標。
// ------------------------------
function getTouchPoint() {
  if (typeof touches === "undefined" || touches.length === 0) {
    return null;
  }
  return { x: touches[0].x, y: touches[0].y };
}

// ------------------------------
// 繪製不使用圖片的背景裝飾。
// ------------------------------
function drawBackgroundDecoration() {
  noStroke();
  fill(204, 222, 191, 150);
  ellipse(width * 0.12, height * 0.15, 150, 150);
  fill(230, 210, 169, 140);
  ellipse(width * 0.88, height * 0.19, 170, 170);
  fill(195, 216, 192, 130);
  ellipse(width * 0.18, height * 0.88, 190, 190);
  fill(235, 215, 180, 130);
  ellipse(width * 0.86, height * 0.84, 150, 150);
}

// ------------------------------
// 視窗尺寸改變時更新全螢幕畫布並重設捲動位置。
// ------------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  contentScroll = 0;
  situationScroll = 0;
  resultScroll = 0;
}
