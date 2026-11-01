// ============================================================
// 露營裝備小管家：拖曳分類遊戲
// 使用方式：將本檔案全部貼到 p5.js Web Editor 的 sketch.js
// 本程式完全不使用圖片、preload、loadImage、image、assets、外部檔案或音效。
// ============================================================

// ------------------------------
// 遊戲狀態：只使用 start、drag、result 三種畫面。
// ------------------------------
let state = "start";

// ------------------------------
// 所有用品資料：每筆資料固定包含 name、emoji、correct、inBag 四個欄位。
// correct 為 true 表示露營需要準備，false 表示干擾用品。
// inBag 為 true 表示目前已放進露營背包。
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
// 儲存結果資料，結果畫面會使用這三個陣列。
// ------------------------------
let score = 0;
let correctSelected = [];
let missedItems = [];
let wrongSelected = [];

// ------------------------------
// 儲存三個畫面上的按鈕區域。
// ------------------------------
let startButton = null;
let confirmButton = null;
let restartButton = null;

// ------------------------------
// 拖曳與觸控操作需要的變數。
// ------------------------------
let draggingItem = null;
let dragPointerOffsetX = 0;
let dragPointerOffsetY = 0;
let dragSourceWasBag = false;
let lastTouchY = 0;
let touchIsScrolling = false;
let suppressNextMouse = false;

// ------------------------------
// 小螢幕內容的內部捲動位置。
// 注意：這不是瀏覽器捲軸，而是畫布內部的捲動。
// ------------------------------
let contentScroll = 0;
let contentMaxScroll = 0;

// ------------------------------
// 共用的色彩設定。
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

// ------------------------------
// p5.js 初始化：建立全螢幕響應式畫布。
// ------------------------------
function setup() {
  // 建立與瀏覽器視窗相同大小的畫布。
  createCanvas(windowWidth, windowHeight);

  // 設定文字以水平與垂直中心對齊。
  textAlign(CENTER, CENTER);

  // 使用系統字型，避免依賴外部字型檔案。
  textFont("sans-serif");

  // 讓畫布在手機上不觸發瀏覽器頁面捲動。
  const canvasElement = document.querySelector("canvas");
  if (canvasElement) {
    canvasElement.style.touchAction = "none";
    canvasElement.style.display = "block";
  }

  // 同時關閉 body 的外部捲軸，所有操作都在畫布內完成。
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.style.background = "#f2eee0";
}

// ------------------------------
// p5.js 每一幀重新繪製目前的畫面。
// ------------------------------
function draw() {
  // 根據 state 切換開始、拖曳、結果三種畫面。
  if (state === "start") {
    drawStartScreen();
  } else if (state === "drag") {
    drawDragScreen();
  } else if (state === "result") {
    drawResultScreen();
  }
}

// ============================================================
// 開始畫面
// ============================================================
function drawStartScreen() {
  // 填滿開始畫面的背景。
  background(...palette.background);

  // 繪製簡單的森林與露營裝飾，不使用任何圖片。
  drawBackgroundDecoration();

  // 顯示主標題。
  fill(...palette.darkGreen);
  noStroke();
  textSize(min(width * 0.085, 64));
  text("露營裝備小管家", width / 2, height * 0.29);

  // 顯示遊戲說明。
  fill(...palette.brown);
  textSize(min(width * 0.031, 23));
  text("把需要的用品拖進露營背包，完成出發前檢查！", width / 2, height * 0.40);

  // 計算開始按鈕的自適應位置與大小。
  const buttonW = min(width * 0.58, 310);
  const buttonH = max(58, min(height * 0.095, 72));
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = height * 0.54;

  // 繪製開始按鈕並記錄按鈕區域。
  drawButton(buttonX, buttonY, buttonW, buttonH, "開始挑戰", color(...palette.green));
  startButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };

  // 顯示操作提示。
  fill(...palette.brown);
  textSize(min(width * 0.026, 18));
  text("桌面：按住滑鼠拖曳｜手機：按住用品滑動", width / 2, height * 0.72);
}

// ============================================================
// 拖曳遊戲畫面
// ============================================================
function drawDragScreen() {
  // 設定拖曳遊戲背景。
  background(235, 243, 230);

  // 設定遊戲版面位置與卡片資料。
  const layout = calculateGameLayout();

  // 繪製固定在畫面上方的標題列。
  drawGameHeader(layout);

  // 繪製可以在畫布內部捲動的遊戲內容。
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, layout.contentTop, width, layout.contentBottom - layout.contentTop);
  drawingContext.clip();

  // 內容捲動只影響用品區與背包區，不影響底部確認按鈕。
  push();
  translate(0, -contentScroll);

  // 繪製左側或上方的用品區域。
  drawItemsArea(layout);

  // 繪製右側或下方的大型露營背包區域。
  drawBagArea(layout);

  // 畫出拖曳中的卡片，讓使用者看見目前拿著的用品。
  drawDraggingCard(layout);

  pop();
  drawingContext.restore();

  // 繪製畫布內部捲動提示，讓手機使用者知道可以上下滑動。
  if (contentMaxScroll > 0) {
    drawScrollHint(layout);
  }

  // 繪製固定在底部的確認按鈕。
  drawConfirmButton(layout);
}

// ------------------------------
// 計算遊戲畫面的響應式版面。
// 桌面採左右排列，小螢幕採上下排列。
// ------------------------------
function calculateGameLayout() {
  // 判斷目前是否為小螢幕。
  const isSmall = width < 760;

  // 設定固定標題列與底部按鈕區域。
  const headerH = isSmall ? 102 : 112;
  const bottomH = isSmall ? 76 : 82;
  const contentTop = headerH;
  const contentBottom = height - bottomH;
  const gap = isSmall ? 14 : 22;
  const margin = isSmall ? 12 : 24;

  // 依照螢幕方向配置用品區與背包區。
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
    // 小螢幕：用品區在上方，背包區在下方。
    itemsX = margin;
    itemsY = contentTop + 12;
    itemsW = width - margin * 2;
    columns = width < 430 ? 3 : 4;
    cardW = (itemsW - gap * (columns - 1)) / columns;
    cardH = 82;

    // 背包放在用品卡片全部列的下方。
    const rows = ceil(items.length / columns);
    bagX = margin;
    bagY = itemsY + rows * (cardH + gap) + 24;
    bagW = width - margin * 2;
    bagH = max(220, min(280, height * 0.40));
    contentHeight = bagY + bagH + 24;
  } else {
    // 桌面：左側用品區，右側大型背包區。
    itemsX = margin;
    itemsY = contentTop + 18;
    itemsW = width * 0.53 - margin * 1.5;
    columns = width >= 1120 ? 3 : 2;
    cardW = (itemsW - gap * (columns - 1)) / columns;
    cardH = 88;
    bagX = itemsX + itemsW + gap;
    bagY = contentTop + 18;
    bagW = width - bagX - margin;
    bagH = contentBottom - bagY - 18;
    contentHeight = max(bagY + bagH + 18, itemsY + ceil(items.length / columns) * (cardH + gap) + 18);
  }

  // 依照內容總高度計算畫布內部可捲動範圍。
  contentMaxScroll = max(0, contentHeight - (contentBottom - contentTop));
  contentScroll = constrain(contentScroll, 0, contentMaxScroll);

  // 回傳所有繪圖與碰撞判斷需要的版面資料。
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
// 繪製拖曳畫面的標題列。
// ------------------------------
function drawGameHeader(layout) {
  // 顯示主標題。
  fill(...palette.darkGreen);
  noStroke();
  textSize(layout.isSmall ? 25 : 34);
  text("露營裝備小管家", width / 2, 28);

  // 顯示操作說明。
  fill(...palette.brown);
  textSize(layout.isSmall ? 14 : 17);
  text("將需要的用品拖進右側（或下方）的露營背包", width / 2, 62);

  // 顯示目前已放入數量。
  const bagCount = items.filter((item) => item.inBag).length;
  fill(...palette.green);
  textSize(layout.isSmall ? 14 : 16);
  text("背包內：" + bagCount + " / " + items.length + " 項", width / 2, layout.headerH - 18);
}

// ------------------------------
// 繪製用品區，左側卡片已放入背包後會隱藏。
// ------------------------------
function drawItemsArea(layout) {
  // 繪製用品區標題。
  fill(...palette.darkGreen);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(layout.isSmall ? 18 : 22);
  text("用品清單", layout.itemsX, layout.itemsY - 12);

  // 繪製每一張尚未放入背包的用品卡片。
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // 已經放入背包的物品不在左側重複顯示。
    if (item.inBag || item === draggingItem) {
      continue;
    }

    // 計算卡片的欄列位置。
    const column = i % layout.columns;
    const row = floor(i / layout.columns);
    const x = layout.itemsX + column * (layout.cardW + layout.gap);
    const y = layout.itemsY + 18 + row * (layout.cardH + layout.gap);

    // 記錄卡片位置，供滑鼠與觸控碰撞判斷使用。
    setItemRect(item, x, y, layout.cardW, layout.cardH, "left");

    // 繪製用品卡片。
    drawItemCard(item, x, y, layout.cardW, layout.cardH, false);
  }

  // 在用品區底部顯示拖曳提示。
  textAlign(CENTER, CENTER);
}

// ------------------------------
// 繪製大型露營背包區域與背包內物品。
// ------------------------------
function drawBagArea(layout) {
  // 繪製背包外框與背景。
  const hoveringBag = draggingItem !== null && isInside(dragX(), dragY(), layout.bagX, layout.bagY, layout.bagW, layout.bagH);
  fill(hoveringBag ? color(218, 239, 208) : color(250, 248, 235));
  stroke(hoveringBag ? color(...palette.green) : color(...palette.border));
  strokeWeight(3);
  rect(layout.bagX, layout.bagY, layout.bagW, layout.bagH, 24);

  // 繪製背包圖示與標題。
  noStroke();
  fill(...palette.darkGreen);
  textAlign(CENTER, CENTER);
  textSize(layout.isSmall ? 32 : 44);
  text("🎒", layout.bagX + layout.bagW / 2, layout.bagY + (layout.isSmall ? 40 : 48));
  textSize(layout.isSmall ? 21 : 29);
  text("露營背包", layout.bagX + layout.bagW / 2, layout.bagY + (layout.isSmall ? 78 : 92));

  // 取得所有已放入背包且不是正在拖曳的用品。
  const bagItems = items.filter((item) => item.inBag && item !== draggingItem);
  const bagTop = layout.bagY + (layout.isSmall ? 105 : 125);
  const bagGap = layout.isSmall ? 8 : 12;
  const bagColumns = layout.isSmall ? 3 : 3;
  const innerW = layout.bagW - 24;
  const bagCardW = (innerW - bagGap * (bagColumns - 1)) / bagColumns;
  const bagCardH = layout.isSmall ? 67 : 78;

  // 逐一繪製背包內的用品卡片。
  for (let n = 0; n < bagItems.length; n++) {
    const item = bagItems[n];
    const column = n % bagColumns;
    const row = floor(n / bagColumns);
    const x = layout.bagX + 12 + column * (bagCardW + bagGap);
    const y = bagTop + row * (bagCardH + bagGap);

    // 記錄背包內卡片位置，供再次拖出背包使用。
    setItemRect(item, x, y, bagCardW, bagCardH, "bag");

    // 背包內卡片使用較緊湊的顯示方式。
    drawItemCard(item, x, y, bagCardW, bagCardH, true);
  }

  // 背包是空的時候顯示提示文字。
  if (bagItems.length === 0) {
    fill(...palette.brown);
    textSize(layout.isSmall ? 15 : 18);
    text("把你認為需要的用品拖到這裡", layout.bagX + layout.bagW / 2, layout.bagY + layout.bagH - 35);
  }

  // 恢復靠左對齊，避免影響其他文字。
  textAlign(CENTER, CENTER);
}

// ------------------------------
// 繪製單張用品卡片：emoji 在上方，名稱在下方。
// ------------------------------
function drawItemCard(item, x, y, w, h, inBagView) {
  // 判斷滑鼠是否停在卡片上，提供桌面 hover 回饋。
  const hovering = isInside(mouseX, mouseY + contentScroll, x, y, w, h);

  // 正在放入背包的卡片使用綠色，其他卡片使用白色。
  if (inBagView) {
    fill(224, 239, 216);
  } else if (hovering) {
    fill(246, 249, 232);
  } else {
    fill(...palette.cream);
  }

  // 繪製卡片外框。
  stroke(inBagView ? color(...palette.green) : color(...palette.border));
  strokeWeight(2);
  rect(x, y, w, h, 14);

  // 顯示用品 emoji。
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(min(w * 0.30, inBagView ? 29 : 36));
  text(item.emoji, x + w / 2, y + h * 0.35);

  // 顯示用品名稱。
  fill(...palette.darkGreen);
  textSize(min(w * 0.16, inBagView ? 15 : 17));
  text(item.name, x + w / 2, y + h * 0.78);
}

// ------------------------------
// 繪製拖曳中的浮動卡片。
// ------------------------------
function drawDraggingCard(layout) {
  // 沒有拖曳物品時不需要繪製浮動卡片。
  if (!draggingItem) {
    return;
  }

  // 讀取目前指標位置，並修正內容捲動座標。
  const x = dragX() - dragPointerOffsetX;
  const y = dragY() - dragPointerOffsetY;

  // 讓浮動卡片稍微透明，表示它正在被拖曳。
  push();
  drawingContext.globalAlpha = 0.88;
  drawItemCard(draggingItem, x, y, draggingItem.w, draggingItem.h, dragSourceWasBag);
  drawingContext.globalAlpha = 1;
  pop();
}

// ------------------------------
// 繪製手機內部捲動提示。
// ------------------------------
function drawScrollHint(layout) {
  // 以半透明色帶顯示提示，不遮住主要操作區。
  noStroke();
  fill(235, 243, 230, 220);
  rect(0, layout.contentTop, width, 24);
  fill(...palette.brown);
  textSize(13);
  text("上下滑動畫布可查看更多用品與背包內容", width / 2, layout.contentTop + 12);
}

// ------------------------------
// 繪製固定於底部的確認清單按鈕。
// ------------------------------
function drawConfirmButton(layout) {
  // 計算按鈕大小，確保手機也容易按到。
  const buttonW = min(width * 0.60, 310);
  const buttonH = max(52, min(layout.bottomH - 16, 64));
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = height - layout.bottomH + (layout.bottomH - buttonH) / 2;

  // 繪製確認按鈕並保存碰撞區域。
  drawButton(buttonX, buttonY, buttonW, buttonH, "確認清單", color(...palette.green));
  confirmButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };
}

// ============================================================
// 結果畫面
// ============================================================
function drawResultScreen() {
  // 填滿結果畫面背景。
  background(...palette.background);
  drawBackgroundDecoration();

  // 顯示結果標題。
  fill(...palette.darkGreen);
  noStroke();
  textSize(min(width * 0.075, 48));
  text("檢查結果", width / 2, 42);

  // 顯示總分。
  fill(...palette.green);
  textSize(min(width * 0.060, 38));
  text("總分：" + score + " 分", width / 2, 91);

  // 顯示小提醒。
  fill(...palette.brown);
  textSize(min(width * 0.026, 17));
  text("選對 +1｜漏選 -1｜誤選 -1", width / 2, 124);

  // 判斷結果欄位採三欄或手機三列。
  const isSmall = width < 700;
  const margin = isSmall ? 12 : 28;
  const gap = isSmall ? 9 : 16;
  const boxW = isSmall ? width - margin * 2 : (width - margin * 2 - gap * 2) / 3;
  const boxH = isSmall ? min(104, max(82, (height - 280) / 3)) : max(220, height - 300);
  const startY = isSmall ? 150 : 165;

  // 繪製三個結果區塊。
  drawResultBox("選對的物品", correctSelected, margin, startY, boxW, boxH, color(...palette.green), isSmall);
  drawResultBox("漏選的物品", missedItems, isSmall ? margin : margin + boxW + gap, isSmall ? startY + boxH + gap : startY, boxW, boxH, color(...palette.orange), isSmall);
  drawResultBox("誤選的物品", wrongSelected, isSmall ? margin : margin + (boxW + gap) * 2, isSmall ? startY + (boxH + gap) * 2 : startY, boxW, boxH, color(...palette.red), isSmall);

  // 計算並繪製重新挑戰按鈕。
  const buttonW = min(width * 0.58, 310);
  const buttonH = 56;
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = height - 70;
  drawButton(buttonX, buttonY, buttonW, buttonH, "重新挑戰", color(...palette.green));
  restartButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };
}

// ------------------------------
// 繪製單個結果欄位，並在小螢幕中使用多欄文字避免超出畫面。
// ------------------------------
function drawResultBox(title, list, x, y, w, h, titleColor, isSmall) {
  // 繪製結果外框。
  fill(255, 253, 244);
  stroke(...palette.border);
  strokeWeight(2);
  rect(x, y, w, h, 16);

  // 顯示欄位標題。
  noStroke();
  fill(titleColor);
  textSize(isSmall ? 17 : min(w * 0.13, 23));
  text(title, x + w / 2, y + 25);

  // 清單為空時顯示「無」。
  fill(...palette.brown);
  textSize(isSmall ? 14 : min(w * 0.105, 17));
  if (list.length === 0) {
    text("無", x + w / 2, y + h / 2 + 8);
    return;
  }

  // 依照可用寬度切換一欄或兩欄顯示。
  const columns = isSmall && list.length > 3 ? 2 : 1;
  const rows = ceil(list.length / columns);
  const colW = (w - 20) / columns;
  const lineH = min(24, max(16, (h - 47) / max(rows, 1)));

  // 顯示每個用品名稱。
  for (let i = 0; i < list.length; i++) {
    const column = i % columns;
    const row = floor(i / columns);
    const itemX = x + 10 + colW * column + colW / 2;
    const itemY = y + 50 + lineH * row;
    text("・" + list[i], itemX, itemY);
  }
}

// ============================================================
// 互動事件：滑鼠與手機觸控共用同一套拖曳邏輯
// ============================================================

// ------------------------------
// 滑鼠按下：開始按鈕、用品卡片、背包卡片或確認按鈕。
// ------------------------------
function mousePressed() {
  // 避免手機觸控後又觸發一次滑鼠事件造成重複操作。
  if (suppressNextMouse) {
    suppressNextMouse = false;
    return false;
  }

  // 開始畫面只需要判斷開始按鈕。
  if (state === "start") {
    if (startButton && isInside(mouseX, mouseY, startButton.x, startButton.y, startButton.w, startButton.h)) {
      beginGame();
    }
    return false;
  }

  // 結果畫面只需要判斷重新挑戰按鈕。
  if (state === "result") {
    if (restartButton && isInside(mouseX, mouseY, restartButton.x, restartButton.y, restartButton.w, restartButton.h)) {
      beginGame();
    }
    return false;
  }

  // 拖曳畫面先處理固定在底部的確認按鈕。
  if (state === "drag") {
    if (confirmButton && isInside(mouseX, mouseY, confirmButton.x, confirmButton.y, confirmButton.w, confirmButton.h)) {
      calculateResult();
      state = "result";
      draggingItem = null;
      return false;
    }

    // 在畫布座標中尋找被按下的用品卡片。
    startDraggingAt(mouseX, mouseY);
  }

  return false;
}

// ------------------------------
// 滑鼠拖曳：更新浮動卡片位置。
// ------------------------------
function mouseDragged() {
  if (state !== "drag" || !draggingItem) {
    return false;
  }

  updateDraggingAt(mouseX, mouseY);
  return false;
}

// ------------------------------
// 滑鼠放開：判斷放在背包內或背包外。
// ------------------------------
function mouseReleased() {
  if (state === "drag" && draggingItem) {
    finishDraggingAt(mouseX, mouseY);
  }
  return false;
}

// ------------------------------
// 手機觸控開始：支援單指拖曳。
// ------------------------------
function touchStarted() {
  // 只處理第一根手指，避免多指同時改變遊戲狀態。
  const point = getTouchPoint();
  if (!point) {
    return false;
  }

  // 標記後續可能產生的滑鼠事件不應再次執行。
  suppressNextMouse = true;

  // 開始畫面與結果畫面共用按鈕判斷。
  if (state === "start") {
    if (startButton && isInside(point.x, point.y, startButton.x, startButton.y, startButton.w, startButton.h)) {
      beginGame();
    }
    return false;
  }

  if (state === "result") {
    if (restartButton && isInside(point.x, point.y, restartButton.x, restartButton.y, restartButton.w, restartButton.h)) {
      beginGame();
    }
    return false;
  }

  // 拖曳畫面的確認按鈕優先判斷。
  if (state === "drag") {
    if (confirmButton && isInside(point.x, point.y, confirmButton.x, confirmButton.y, confirmButton.w, confirmButton.h)) {
      calculateResult();
      state = "result";
      return false;
    }

    // 先嘗試抓取卡片，抓不到才視為內部捲動手勢。
    const grabbed = startDraggingAt(point.x, point.y);
    if (!grabbed) {
      lastTouchY = point.y;
      touchIsScrolling = true;
    }
  }

  return false;
}

// ------------------------------
// 手機觸控移動：拖曳卡片，或上下滑動畫布內容。
// ------------------------------
function touchMoved() {
  const point = getTouchPoint();
  if (!point || state !== "drag") {
    return false;
  }

  // 正在拖曳用品時，用品跟隨手指移動。
  if (draggingItem) {
    updateDraggingAt(point.x, point.y);
    return false;
  }

  // 沒有抓取用品時，改變畫布內部捲動位置。
  if (touchIsScrolling) {
    const delta = lastTouchY - point.y;
    contentScroll = constrain(contentScroll + delta, 0, contentMaxScroll);
    lastTouchY = point.y;
  }

  return false;
}

// ------------------------------
// 手機觸控結束：完成拖曳或停止內部捲動。
// ------------------------------
function touchEnded() {
  const point = getTouchPoint();

  if (state === "drag" && draggingItem && point) {
    finishDraggingAt(point.x, point.y);
  }

  draggingItem = null;
  touchIsScrolling = false;
  return false;
}

// ------------------------------
// 滑鼠滾輪：在小螢幕或內容超出時捲動畫布內部內容。
// ------------------------------
function mouseWheel(event) {
  if (state === "drag" && contentMaxScroll > 0) {
    contentScroll = constrain(contentScroll + event.delta, 0, contentMaxScroll);
    return false;
  }
}

// ============================================================
// 拖曳、重設與計分函式
// ============================================================

// ------------------------------
// 開始遊戲或重新挑戰時重設所有資料。
// ------------------------------
function beginGame() {
  // 清除所有用品的背包狀態。
  for (const item of items) {
    item.inBag = false;
    item.x = 0;
    item.y = 0;
    item.w = 0;
    item.h = 0;
    item.area = "";
  }

  // 清除舊結果。
  score = 0;
  correctSelected = [];
  missedItems = [];
  wrongSelected = [];

  // 清除拖曳與捲動狀態。
  draggingItem = null;
  contentScroll = 0;
  touchIsScrolling = false;

  // 切換到拖曳遊戲畫面。
  state = "drag";
}

// ------------------------------
// 在指定畫面座標尋找並抓取用品卡片。
// ------------------------------
function startDraggingAt(pointerX, pointerY) {
  // 重新取得目前版面，確保視窗尺寸改變後座標仍正確。
  const layout = calculateGameLayout();

  // 將螢幕座標換成內容座標，補回內部捲動量。
  const contentX = pointerX;
  const contentY = pointerY + contentScroll;

  // 從後往前檢查，讓重疊時較上層的卡片優先被抓取。
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];

    // 只有未放入背包的左側卡片或已放入背包的卡片可以被抓取。
    if (!item.w || !item.h) {
      continue;
    }

    if (isInside(contentX, contentY, item.x, item.y, item.w, item.h)) {
      // 記錄目前抓到的用品。
      draggingItem = item;
      dragSourceWasBag = item.inBag;

      // 記錄手指或滑鼠在卡片中的相對位置，避免卡片跳動。
      dragPointerOffsetX = contentX - item.x;
      dragPointerOffsetY = contentY - item.y;

      // 已抓取用品後，手機不再把這次操作視為捲動。
      touchIsScrolling = false;
      return true;
    }
  }

  // 若點擊空白區，保留給手機內部捲動使用。
  return false;
}

// ------------------------------
// 更新拖曳中的用品位置，僅用於繪製浮動卡片。
// ------------------------------
function updateDraggingAt(pointerX, pointerY) {
  // 拖曳中的卡片不需要改變資料位置，繪製時直接跟隨指標。
  // 這裡保留函式讓滑鼠與觸控流程清楚分開。
  return;
}

// ------------------------------
// 放開用品時判斷是否位於背包區域。
// ------------------------------
function finishDraggingAt(pointerX, pointerY) {
  // 取得最新版面資料。
  const layout = calculateGameLayout();

  // 將指標座標換成內容座標。
  const contentX = pointerX;
  const contentY = pointerY + contentScroll;

  // 判斷卡片中心是否在背包區域，避免只碰到邊緣就算放入。
  const cardX = contentX - dragPointerOffsetX;
  const cardY = contentY - dragPointerOffsetY;
  const centerX = cardX + draggingItem.w / 2;
  const centerY = cardY + draggingItem.h / 2;
  const droppedInBag = isInside(centerX, centerY, layout.bagX, layout.bagY, layout.bagW, layout.bagH);

  // 放入背包後保留在背包中；拖到背包外則取消放入。
  draggingItem.inBag = droppedInBag;

  // 清除目前拖曳狀態，下一幀會重新排列卡片。
  draggingItem = null;
  touchIsScrolling = false;
}

// ------------------------------
// 計算分數與三種結果清單。
// ------------------------------
function calculateResult() {
  // 每次確認時都重新計算，避免重複按鈕造成分數累加。
  score = 0;
  correctSelected = [];
  missedItems = [];
  wrongSelected = [];

  // 逐一檢查 15 項用品。
  for (const item of items) {
    // 正確用品放入背包就加分，沒有放入就列為漏選並扣分。
    if (item.correct) {
      if (item.inBag) {
        score += 1;
        correctSelected.push(item.name);
      } else {
        score -= 1;
        missedItems.push(item.name);
      }
    }

    // 干擾用品放入背包就列為誤選並扣分。
    if (!item.correct && item.inBag) {
      score -= 1;
      wrongSelected.push(item.name);
    }
  }
}

// ------------------------------
// 記錄用品卡片的位置與所在區域。
// ------------------------------
function setItemRect(item, x, y, w, h, area) {
  item.x = x;
  item.y = y;
  item.w = w;
  item.h = h;
  item.area = area;
}

// ------------------------------
// 取得目前指標位置，用於背包 hover 顯示。
// ------------------------------
function dragX() {
  return mouseX;
}

function dragY() {
  return mouseY + contentScroll;
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

// ============================================================
// 共用繪圖工具
// ============================================================

// ------------------------------
// 繪製圓角按鈕。
// ------------------------------
function drawButton(x, y, w, h, label, buttonColor) {
  // 判斷滑鼠是否停在按鈕上。
  const hovering = isInside(mouseX, mouseY, x, y, w, h);
  const displayColor = hovering ? lerpColor(buttonColor, color(255), 0.14) : buttonColor;

  // 繪製按鈕外框。
  fill(displayColor);
  stroke(...palette.darkGreen);
  strokeWeight(2);
  rect(x, y, w, h, 16);

  // 繪製按鈕文字。
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(min(w * 0.105, 24));
  text(label, x + w / 2, y + h / 2);
}

// ------------------------------
// 判斷一個點是否在矩形內。
// ------------------------------
function isInside(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

// ------------------------------
// 繪製不依賴外部素材的背景裝飾。
// ------------------------------
function drawBackgroundDecoration() {
  // 關閉邊框，繪製柔和的裝飾圓。
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
// 視窗尺寸改變時重新調整全螢幕畫布。
// ------------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  contentScroll = 0;
}
