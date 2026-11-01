// ============================================================
// 【本次版本重點】
// 1. 第一關每次開始或重新挑戰都會重新打亂 20 個用品。
// 2. 20 項用品包含 10 項必要用品與 10 項干擾用品，全部混合顯示。
// 3. 第一關限時 60 秒，時間到會自動結算並進入 level1Complete。
// 4. 第一關分數限制在 0～10 分，搭配關卡二 5 分，總分最高維持 15 分。
//
// 【原有流程修正重點】
// 1. 修正滑鼠 mousePressed 原本只處理選項、沒有處理「下一題」的問題。
// 2. 新增 situationAnswered=true 答題完成旗標；選項點擊後一定會設定。
// 3. 「下一題／查看總結果」的繪製位置與滑鼠、touchStarted 碰撞區域
//    統一由 getSituationNextButtonRect() 計算，避免座標不一致。
// 4. 第五題按鈕會切換到 result；前四題會清除答題旗標並進入下一題。
// ============================================================

// ============================================================
// 【使用說明】
// 1. 開啟 p5.js Web Editor，建立或開啟 sketch.js。
// 2. 將本檔案全部內容完整複製，覆蓋原本 sketch.js，再按播放執行。
// 3. 開始畫面按「開始挑戰」，先進入關卡 1「整理露營背包」。
// 4. 關卡一：用滑鼠按住用品卡片，拖到露營背包；拖出背包即可取消。
// 5. 放入用品時會出現短暫提示，但干擾用品仍可放入，按「確認清單」才正式計分。
// 6. 關卡一完成後，請按「繼續到關卡二」，不會自動跳過過場頁。
// 7. 關卡二：依序回答 5 題野外情境題，答對每題得到 1 分並增加星星。
// 8. 答錯時仍可按「下一題」，畫面會顯示正確答案與安全解說。
// 9. 結果頁會顯示分數、用品三類清單、五題作答摘要與成績稱號。
// 10. 總分滿 15 分時，結果頁會持續播放由 p5.js 基本圖形製作的彩帶動畫。
// 11. 手機操作：用手指按住用品拖曳；點擊空白處或上下滑動可捲動畫布內內容。
// 12. 本程式不需要上傳圖片、不需要 assets 資料夾，也不需要音效或外部檔案。
// ============================================================

// ============================================================
// 露營裝備小管家：雙關卡互動闖關遊戲
// 使用方式：將本檔案完整貼到 p5.js Web Editor 的 sketch.js。
// 本程式只使用 p5.js 基本圖形、文字、emoji 與陣列動畫。
// 不使用圖片、外部素材、音效或第三方套件。
// ============================================================

// ------------------------------------------------------------
// 遊戲狀態：五個畫面依序為開始、關卡一、關卡一完成、關卡二、結果。
// ------------------------------------------------------------
let state = "start";

// ------------------------------------------------------------
// 第一關原始用品資料：10 個必要用品與 10 個干擾用品。
// correct 為 true 代表露營時建議準備；inBag 代表目前是否在背包內。顯示順序由 level1Items 另行洗牌。
// ------------------------------------------------------------
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
  { name: "相機", emoji: "📷", correct: false, inBag: false },
  { name: "吹風機", emoji: "💨", correct: false, inBag: false },
  { name: "玻璃花瓶", emoji: "🏺", correct: false, inBag: false },
  { name: "電鍋", emoji: "🍚", correct: false, inBag: false },
  { name: "大型音響", emoji: "🔊", correct: false, inBag: false },
  { name: "電視", emoji: "📺", correct: false, inBag: false },
  { name: "大型玩具", emoji: "🧸", correct: false, inBag: false },
  { name: "電腦螢幕", emoji: "🖥️", correct: false, inBag: false },
  { name: "室內拖鞋", emoji: "🥿", correct: false, inBag: false },
  { name: "充氣泳池", emoji: "🏊", correct: false, inBag: false }
];

// ------------------------------------------------------------
// 第一關實際使用的用品陣列；每次 beginGame() 都會重新複製並洗牌。
// 洗牌只改變顯示順序，不會改變每項用品的 correct 判定。
// ------------------------------------------------------------
let level1Items = [];

// ------------------------------------------------------------
// 第一關限時設定與只結算一次的狀態。
// ------------------------------------------------------------
const level1TimeLimit = 60;
let level1StartTime = 0;
let level1TimeLeft = level1TimeLimit;
let level1FinishReason = "confirm";
let level1AlreadyFinished = false;

// ------------------------------------------------------------
// 關卡二的五題情境題；bgEmoji 會顯示在題目卡片的情境背景。
// ------------------------------------------------------------
const situations = [
  {
    bgEmoji: "🌧️⛈️",
    theme: "大雨情境",
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
    bgEmoji: "🌲🧭",
    theme: "迷路情境",
    question: "在森林中迷路了，第一個較適合的做法是什麼？",
    options: [
      { label: "A", text: "繼續亂走找路" },
      { label: "B", text: "留在相對安全的位置並發出求救訊號" },
      { label: "C", text: "躲起來睡覺" }
    ],
    answer: "B",
    explanation: "迷路時不要任意亂走，應留在相對安全的位置，並利用手機、哨子或聲音求救。"
  },
  {
    bgEmoji: "🌲🦌",
    theme: "野生動物情境",
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
    bgEmoji: "🏕️🗑️",
    theme: "環境整理情境",
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
    bgEmoji: "🩹🧰",
    theme: "小擦傷情境",
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

// ------------------------------------------------------------
// 分數、清單與情境題作答紀錄。
// ------------------------------------------------------------
let level1Score = 0;
let situationScore = 0;
let correctSelected = [];
let missedItems = [];
let wrongSelected = [];
let situationCurrent = 0;
let situationAnswerSelected = null;
// 重要修正：明確記錄本題是否已作答，避免只依賴選項文字造成按鈕流程卡住。
let situationAnswered = false;
let situationSummary = [];

// ------------------------------------------------------------
// 各畫面的按鈕與選項碰撞區域。
// ------------------------------------------------------------
let startButton = null;
let confirmButton = null;
let continueButton = null;
let situationNextButton = null;
let restartButton = null;
let situationOptionRects = [];

// ------------------------------------------------------------
// 拖曳與手機觸控變數。
// ------------------------------------------------------------
let draggingItem = null;
let dragPointerOffsetX = 0;
let dragPointerOffsetY = 0;
let dragSourceWasBag = false;
let lastTouchY = 0;
let touchIsScrolling = false;
let situationTouchScrolling = false;
let resultTouchScrolling = false;
let suppressNextMouse = false;

// ------------------------------------------------------------
// 畫布內部捲動位置；只捲動畫布內容，不捲動瀏覽器頁面。
// ------------------------------------------------------------
let contentScroll = 0;
let contentMaxScroll = 0;
let situationScroll = 0;
let situationMaxScroll = 0;
let resultScroll = 0;
let resultMaxScroll = 0;

// ------------------------------------------------------------
// 短暫提示與答題回饋動畫。
// ------------------------------------------------------------
let toastText = "";
let toastUntil = 0;
let answerFlashUntil = 0;
let answerFlashColor = null;
let rewardStars = [];

// ------------------------------------------------------------
// 滿分彩帶陣列與動畫狀態。
// ------------------------------------------------------------
let confetti = [];
let confettiActive = false;

// ------------------------------------------------------------
// 共用配色。
// ------------------------------------------------------------
const palette = {
  background: [242, 238, 224],
  green: [67, 112, 75],
  darkGreen: [45, 78, 53],
  lightGreen: [218, 233, 211],
  cream: [255, 253, 244],
  brown: [115, 88, 61],
  orange: [202, 126, 54],
  red: [182, 73, 65],
  border: [139, 135, 108],
  blue: [74, 123, 158]
};

// ============================================================
// p5.js 初始化與主迴圈
// ============================================================

// ------------------------------
// 建立全螢幕畫布，並設定手機觸控不捲動瀏覽器頁面。
// ------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont("sans-serif");

  const canvasElement = document.querySelector("canvas");
  if (canvasElement) {
    canvasElement.style.touchAction = "none";
    canvasElement.style.display = "block";
  }

  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.style.background = "#f2eee0";
  level1Items = createShuffledLevel1Items();
}

// ------------------------------
// 根據目前狀態繪製不同畫面。
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

  // 提示會在時間到達後自動消失，不會阻擋其他操作。
  drawToast();
}

// ============================================================
// 開始畫面：角色、關卡介紹與開始按鈕
// ============================================================

// ------------------------------
// 顯示小熊對話、兩個關卡與「關卡 1 / 2」進度。
// ------------------------------
function drawStartScreen() {
  background(...palette.background);
  drawBackgroundDecoration();

  fill(...palette.darkGreen);
  noStroke();
  textSize(min(width * 0.085, 64));
  text("露營裝備小管家", width / 2, height * 0.105);

  drawCharacterBubble("🐻", "小熊", "嗨！我是小熊，我們一起準備露營吧！", width / 2, height * 0.205);

  const isSmall = width < 680;
  const margin = isSmall ? 18 : 42;
  const gap = isSmall ? 12 : 24;
  const cardW = isSmall ? width - margin * 2 : (width - margin * 2 - gap) / 2;
  const cardH = isSmall ? 104 : 138;
  const cardsY = height * 0.31;

  drawLevelIntroCard(
    margin,
    cardsY,
    cardW,
    cardH,
    "關卡 1 / 2",
    "整理露營背包",
    "⛺",
    "把需要的用品拖進背包",
    color(...palette.green)
  );

  const secondX = isSmall ? margin : margin + cardW + gap;
  const secondY = isSmall ? cardsY + cardH + gap : cardsY;
  drawLevelIntroCard(
    secondX,
    secondY,
    cardW,
    cardH,
    "關卡 2 / 2",
    "破解野外情境題",
    "🧭",
    "完成 5 題安全情境挑戰",
    color(...palette.orange)
  );

  const noteY = isSmall ? secondY + cardH + 28 : cardsY + cardH + 30;
  fill(...palette.darkGreen);
  textSize(isSmall ? 14 : 17);
  text("完成關卡一後，按「繼續到關卡二」再挑戰情境題！", width / 2, noteY);

  const buttonW = min(width * 0.58, 310);
  const buttonH = 58;
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = min(height - 78, noteY + 38);
  drawButton(buttonX, buttonY, buttonW, buttonH, "開始挑戰", color(...palette.green));
  startButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };
}

// ------------------------------
// 繪製開始頁的角色對話泡泡。
// ------------------------------
function drawCharacterBubble(character, name, message, centerX, centerY) {
  const bubbleW = min(width * 0.86, 590);
  const bubbleH = 72;
  const bubbleX = centerX - bubbleW / 2;
  const bubbleY = centerY - bubbleH / 2;

  fill(255, 253, 244);
  stroke(...palette.border);
  strokeWeight(2);
  rect(bubbleX, bubbleY, bubbleW, bubbleH, 18);

  noStroke();
  textSize(min(40, width * 0.08));
  text(character, bubbleX + 38, centerY);
  fill(...palette.darkGreen);
  textAlign(LEFT, CENTER);
  textSize(min(width * 0.027, 18));
  text(name + "：" + message, bubbleX + 72, centerY);
  textAlign(CENTER, CENTER);
}

// ------------------------------
// 繪製單張關卡介紹卡。
// ------------------------------
function drawLevelIntroCard(x, y, w, h, progress, title, icon, description, cardColor) {
  fill(255, 253, 244);
  stroke(cardColor);
  strokeWeight(3);
  rect(x, y, w, h, 18);

  noStroke();
  fill(cardColor);
  textSize(min(h * 0.34, 46));
  text(icon, x + w * 0.15, y + h * 0.50);

  fill(...palette.brown);
  textSize(min(w * 0.052, 16));
  text(progress, x + w * 0.60, y + h * 0.22);
  fill(...palette.darkGreen);
  textSize(min(w * 0.075, 23));
  text(title, x + w * 0.60, y + h * 0.48);
  fill(...palette.brown);
  textSize(min(w * 0.048, 15));
  text(description, x + w * 0.60, y + h * 0.77);
}

// ============================================================
// 關卡一：拖曳用品到背包
// ============================================================

// ------------------------------
// 繪製拖曳遊戲畫面與可捲動內容。
// ------------------------------
function drawDragScreen() {
  // 每一幀更新倒數；時間到會自動前往第一關完成頁。
  updateLevel1Timer();
  if (state !== "drag") {
    return;
  }

  background(235, 243, 230);
  const layout = calculateGameLayout();
  drawGameHeader(layout);

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
  const headerH = isSmall ? 128 : 128;
  const bottomH = isSmall ? 76 : 82;
  const contentTop = headerH;
  const contentBottom = max(contentTop + 90, height - bottomH);
  const gap = isSmall ? 14 : 22;
  const margin = isSmall ? 12 : 24;

  let itemsX, itemsY, itemsW, bagX, bagY, bagW, bagH;
  let cardW, cardH, columns, contentHeight;

  if (isSmall) {
    itemsX = margin;
    itemsY = contentTop + 12;
    itemsW = width - margin * 2;
    columns = width < 430 ? 3 : 4;
    cardW = (itemsW - gap * (columns - 1)) / columns;
    cardH = 82;
    const rows = ceil(level1Items.length / columns);
    bagX = margin;
    bagY = itemsY + 18 + rows * (cardH + gap) + 22;
    bagW = width - margin * 2;
    bagH = max(230, min(310, height * 0.43));
    contentHeight = bagY + bagH + 26;
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
      itemsY + 18 + ceil(level1Items.length / columns) * (cardH + gap) + 18
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
// 繪製關卡一固定標題、關卡進度與背包數量。
// ------------------------------
function drawGameHeader(layout) {
  // 顯示第一關標題。
  fill(...palette.darkGreen);
  noStroke();
  textSize(layout.isSmall ? 23 : 32);
  text("關卡 1 / 2｜整理露營背包", width / 2, 25);

  // 顯示每次開始都會重新洗牌的玩法提示。
  fill(...palette.brown);
  textSize(layout.isSmall ? 12 : 15);
  text("用品已打亂，請在時間內挑出露營需要的 10 項用品", width / 2, 52);

  // 剩餘十秒時改用紅色，讓使用者注意倒數。
  fill(level1TimeLeft <= 10 ? color(...palette.red) : color(...palette.orange));
  textSize(layout.isSmall ? 16 : 19);
  text("⏱ 剩餘時間：" + level1TimeLeft + " 秒", width * 0.28, 84);

  // 顯示目前背包數量與總用品數量。
  const bagCount = level1Items.filter((item) => item.inBag).length;
  fill(...palette.green);
  textSize(layout.isSmall ? 14 : 17);
  text("背包：" + bagCount + " / 20 項", width * 0.72, 84);

  // 只提示必要用品數量，不直接公布哪些用品正確。
  fill(...palette.darkGreen);
  textSize(layout.isSmall ? 11 : 14);
  text("提示：至少選出 10 項必要用品，但不要只靠數量猜答案！", width / 2, 110);
}

// ------------------------------
// 繪製尚未放入背包的用品卡片。
// ------------------------------
function drawItemsArea(layout) {
  fill(...palette.darkGreen);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(layout.isSmall ? 18 : 22);
  text("混合混合用品清單", layout.itemsX, layout.itemsY - 10);

  for (let i = 0; i < level1Items.length; i++) {
    const item = level1Items[i];
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
// 繪製背包區與背包內卡片。
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
  textSize(layout.isSmall ? 32 : 44);
  text("🎒", layout.bagX + layout.bagW / 2, layout.bagY + (layout.isSmall ? 39 : 48));
  textSize(layout.isSmall ? 21 : 29);
  text("露營背包", layout.bagX + layout.bagW / 2, layout.bagY + (layout.isSmall ? 77 : 92));

  const bagItems = level1Items.filter((item) => item.inBag && item !== draggingItem);
  const bagTop = layout.bagY + (layout.isSmall ? 104 : 125);
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
// 繪製用品卡片：emoji 在上方、名稱在下方。
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
// 繪製正在拖曳中的半透明卡片。
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
// 顯示畫布內捲動提示。
// ------------------------------
function drawScrollHint(y, message) {
  noStroke();
  fill(235, 243, 230, 225);
  rect(0, y, width, 24);
  fill(...palette.brown);
  textSize(12);
  text(message, width / 2, y + 12);
}

// ------------------------------
// 繪製固定於底部的確認清單按鈕。
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
// 關卡一完成過場：按鈕控制進入關卡二
// ============================================================

// ------------------------------
// 顯示小熊祝賀對話與繼續按鈕，不會自動跳到關卡二。
// ------------------------------
function drawLevel1CompleteScreen() {
  background(...palette.background);
  drawBackgroundDecoration();

  fill(...palette.darkGreen);
  noStroke();
  textSize(min(width * 0.075, 52));
  text("關卡 1 完成！", width / 2, height * 0.18);

  const completeMessage = level1FinishReason === "timeout"
    ? "時間到囉！小熊先幫你結算用品清單。"
    : "太好了！背包準備完成！";
  drawCharacterBubble("🐻", "小熊", completeMessage, width / 2, height * 0.31);

  fill(...palette.green);
  textSize(min(width * 0.060, 40));
  text("用品分數：" + level1Score + " / 10 分", width / 2, height * 0.46);

  fill(...palette.orange);
  textSize(min(width * 0.043, 27));
  text("你選了 " + correctSelected.length + " / 10 個必要用品", width / 2, height * 0.53);

  fill(...palette.brown);
  textSize(min(width * 0.030, 20));
  text("接下來一起破解 5 題野外情境題吧！", width / 2, height * 0.60);
  text("準備好後，按下按鈕進入關卡二。", width / 2, height * 0.65);

  const buttonW = min(width * 0.70, 360);
  const buttonH = 62;
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = min(height - 88, height * 0.71);
  drawButton(buttonX, buttonY, buttonW, buttonH, "繼續到關卡二", color(...palette.green));
  continueButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };
}

// ============================================================
// 關卡二：五題情境選擇題
// ============================================================

// ------------------------------
// 顯示關卡二進度、情境 emoji、選項、星星與答題回饋。
// ------------------------------
function drawSituationScreen() {
  const question = situations[situationCurrent];
  const isSmall = width < 700;
  const headerH = isSmall ? 112 : 122;
  const bottomH = 78;
  const contentTop = headerH;
  const contentBottom = max(contentTop + 120, height - bottomH);
  const margin = isSmall ? 14 : 34;
  const boxW = width - margin * 2;
  const questionY = contentTop + 18;
  const questionH = isSmall ? 172 : 150;
  const optionY = questionY + questionH + 16;
  const optionH = isSmall ? 70 : 70;
  const optionGap = isSmall ? 10 : 12;
  const feedbackY = optionY + question.options.length * (optionH + optionGap) + 8;
  const feedbackH = isSmall ? 224 : 170;

  const contentHeight = !situationAnswered
    ? optionY + question.options.length * (optionH + optionGap) + 24
    : feedbackY + feedbackH + 24;

  situationMaxScroll = max(0, contentHeight - (contentBottom - contentTop));
  situationScroll = constrain(situationScroll, 0, situationMaxScroll);

  // 答題後短暫變色，增加答對或答錯的視覺回饋。
  if (situationAnswered && millis() < answerFlashUntil) {
    background(answerFlashColor || color(...palette.background));
  } else {
    background(...palette.background);
  }
  drawBackgroundDecoration();

  fill(...palette.darkGreen);
  noStroke();
  textSize(isSmall ? 24 : 34);
  text("關卡 2 / 2｜破解野外情境題", width / 2, 25);
  fill(...palette.brown);
  textSize(isSmall ? 14 : 17);
  text("情境題 " + (situationCurrent + 1) + " / " + situations.length, width / 2, 59);

  // 顯示目前答對題數的星星進度。
  fill(...palette.orange);
  textSize(isSmall ? 18 : 22);
  text(getStarProgress(), width / 2, 88);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, contentTop, width, contentBottom - contentTop);
  drawingContext.clip();

  push();
  translate(0, -situationScroll);

  // 題目卡片上方顯示每題對應的 emoji 情境背景。
  fill(255, 253, 244);
  stroke(...palette.border);
  strokeWeight(2);
  rect(margin, questionY, boxW, questionH, 18);
  noStroke();
  textSize(isSmall ? 34 : 48);
  text(question.bgEmoji, width / 2, questionY + 34);
  fill(...palette.orange);
  textSize(isSmall ? 14 : 17);
  text(question.theme, width / 2, questionY + 73);
  fill(...palette.darkGreen);
  drawWrappedCenteredText(question.question, width / 2, questionY + 87, boxW - 26, questionH - 96, isSmall ? 18 : 23);

  situationOptionRects = [];
  for (let i = 0; i < question.options.length; i++) {
    const option = question.options[i];
    const y = optionY + i * (optionH + optionGap);
    let optionFill = color(255, 253, 244);
    let optionStroke = color(...palette.border);

    if (situationAnswered) {
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
    drawWrappedLeftText(option.text, margin + 42, y + 9, boxW - 56, optionH - 18, isSmall ? 16 : 19);
    situationOptionRects.push({ x: margin, y, w: boxW, h: optionH, label: option.label });
  }

  // 選擇後顯示固定格式的答對或答錯回饋與解說。
  if (situationAnswered) {
    const isCorrect = situationAnswerSelected === question.answer;
    fill(isCorrect ? color(229, 245, 220) : color(252, 231, 225));
    stroke(isCorrect ? color(...palette.green) : color(...palette.red));
    strokeWeight(2);
    rect(margin, feedbackY, boxW, feedbackH, 16);
    noStroke();
    fill(isCorrect ? color(...palette.green) : color(...palette.red));
    textSize(isSmall ? 23 : 28);
    text(isCorrect ? "🎉 太棒了！答對了！" : "💡 沒關係，看看解說再挑戰！", width / 2, feedbackY + 29);
    fill(...palette.darkGreen);
    textSize(isSmall ? 15 : 18);
    text("正確答案：" + question.answer, width / 2, feedbackY + 64);
    drawWrappedCenteredText(question.explanation, width / 2, feedbackY + 82, boxW - 28, feedbackH - 94, isSmall ? 15 : 18);
  }

  // 答對時畫出簡單的星星飄動動畫。
  drawRewardStars();
  pop();
  drawingContext.restore();

  if (situationMaxScroll > 0) {
    drawScrollHint(contentTop, "上下滑動可查看選項與答題解說");
  }

  // 重要修正：按鈕的繪製矩形與事件碰撞矩形共用同一函式，避免看得到卻按不到。
  situationNextButton = getSituationNextButtonRect();
  if (situationNextButton) {
    const label = situationCurrent === situations.length - 1 ? "查看總結果" : "下一題";
    drawButton(
      situationNextButton.x,
      situationNextButton.y,
      situationNextButton.w,
      situationNextButton.h,
      label,
      color(...palette.green)
    );
  }
}

// ------------------------------
// 取得情境題底部下一題按鈕的唯一矩形。
// 繪製、滑鼠與觸控事件都呼叫這裡，確保碰撞區域和實際位置一致。
// ------------------------------
function getSituationNextButtonRect() {
  if (state !== "situation" || !situationAnswered) {
    return null;
  }

  const bottomH = 78;
  const buttonW = min(width * 0.58, 310);
  const buttonH = 58;
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = height - bottomH + (bottomH - buttonH) / 2;
  return { x: buttonX, y: buttonY, w: buttonW, h: buttonH };
}

// ------------------------------
// 回傳星星進度，例如「🌟 🌟 ☆ ☆ ☆」。
// ------------------------------
function getStarProgress() {
  let result = "";
  for (let i = 0; i < situations.length; i++) {
    result += i < situationScore ? "🌟 " : "☆ ";
  }
  return result.trim();
}

// ------------------------------
// 繪製答對後從題目附近飄動的星星。
// ------------------------------
function drawRewardStars() {
  for (const star of rewardStars) {
    const age = frameCount - star.startFrame;
    if (age < 0 || age > 75) {
      continue;
    }
    const progress = age / 75;
    const alphaValue = 255 * (1 - progress);
    push();
    noStroke();
    fill(246, 180, 55, alphaValue);
    textSize(star.size);
    text("★", star.x + sin(age * 0.10 + star.phase) * 10, star.y - age * 0.8);
    pop();
  }
}

// ------------------------------
// 將繁體中文逐字換行後置中繪製。
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
// 將繁體中文逐字換行後靠左繪製。
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
// 依照目前字型寬度切割文字，避免超出卡片。
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
// 結果頁：稱號、分數、三類用品與五題摘要
// ============================================================

// ------------------------------
// 顯示完整成績與滿分彩帶；結果內容可以在畫布內捲動。
// ------------------------------
function drawResultScreen() {
  const isSmall = width < 700;
  const headerH = isSmall ? 148 : 156;
  const bottomH = 78;
  const contentTop = headerH;
  const contentBottom = max(contentTop + 120, height - bottomH);
  const margin = isSmall ? 12 : 28;
  const gap = isSmall ? 10 : 16;
  const contentW = width - margin * 2;
  const totalScore = getDisplayedTotalScore();
  const perfect = totalScore === 15;

  background(...palette.background);
  drawBackgroundDecoration();

  fill(...palette.darkGreen);
  noStroke();
  textSize(isSmall ? 28 : 42);
  text("全部挑戰結果", width / 2, 27);
  fill(...palette.green);
  textSize(isSmall ? 21 : 30);
  text("總分：" + totalScore + " / 15 分", width / 2, 66);
  fill(...palette.orange);
  textSize(isSmall ? 17 : 24);
  text(getTitleByScore(totalScore), width / 2, 103);
  fill(...palette.brown);
  textSize(isSmall ? 14 : 17);
  text(perfect ? "🎊 恭喜你完成所有挑戰！" : "小熊：很棒的嘗試！再挑戰一次會更厲害！", width / 2, 133);

  const summaryH = isSmall ? 130 : 116;
  const listY = contentTop + summaryH + gap;
  const listH = isSmall ? 154 : 244;
  const columnW = isSmall ? contentW : (contentW - gap * 2) / 3;
  const secondY = isSmall ? listY + listH + gap : listY;
  const thirdY = isSmall ? secondY + listH + gap : listY;
  const situationY = isSmall ? thirdY + listH + gap : listY + listH + gap;
  const situationH = isSmall ? 245 : 194;
  const contentHeight = situationY + situationH + 24;

  resultMaxScroll = max(0, contentHeight - (contentBottom - contentTop));
  resultScroll = constrain(resultScroll, 0, resultMaxScroll);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, contentTop, width, contentBottom - contentTop);
  drawingContext.clip();

  push();
  translate(0, -resultScroll);
  drawScoreSummary(margin, contentTop, contentW, summaryH, isSmall);
  drawResultBox("✅ 選對的用品", correctSelected, margin, listY, columnW, listH, color(...palette.green), isSmall);
  drawResultBox("⚠️ 漏選的用品", missedItems, isSmall ? margin : margin + columnW + gap, secondY, columnW, listH, color(...palette.orange), isSmall);
  drawResultBox("❌ 誤選的用品", wrongSelected, isSmall ? margin : margin + (columnW + gap) * 2, thirdY, columnW, listH, color(...palette.red), isSmall);
  drawSituationSummary(margin, situationY, contentW, situationH, isSmall);
  pop();
  drawingContext.restore();

  if (resultMaxScroll > 0) {
    drawScrollHint(contentTop, "上下滑動可查看完整結果與五題作答摘要");
  }

  const buttonW = min(width * 0.58, 310);
  const buttonH = 58;
  const buttonX = width / 2 - buttonW / 2;
  const buttonY = height - bottomH + (bottomH - buttonH) / 2;
  drawButton(buttonX, buttonY, buttonW, buttonH, "重新挑戰", color(...palette.green));
  restartButton = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };

  // 滿分時持續繪製由基本圖形組成的彩帶動畫。
  if (perfect) {
    drawConfetti();
  }
}

// ------------------------------
// 將原始計分最低限制為 0，讓稱號符合 0～7 分級距。
// ------------------------------
function getDisplayedTotalScore() {
  return max(0, level1Score + situationScore);
}

// ------------------------------
// 根據總分回傳成績稱號。
// ------------------------------
function getTitleByScore(totalScore) {
  if (totalScore === 15) {
    return "🏆 野外生存大師";
  }
  if (totalScore >= 12) {
    return "🌟 露營安全達人";
  }
  if (totalScore >= 8) {
    return "⛺ 露營小高手";
  }
  return "🎒 露營新手";
}

// ------------------------------
// 繪製結果頁的分數明細。
// ------------------------------
function drawScoreSummary(x, y, w, h, isSmall) {
  fill(255, 253, 244);
  stroke(...palette.border);
  strokeWeight(2);
  rect(x, y, w, h, 16);
  noStroke();
  fill(...palette.darkGreen);
  textSize(isSmall ? 17 : 22);
  text("分數明細", x + w / 2, y + 23);
  fill(...palette.brown);
  textSize(isSmall ? 14 : 18);
  text("關卡一用品：" + level1Score + " 分", x + w * 0.25, y + h * 0.62);
  text("關卡二答對：" + situationScore + " 題／" + situationScore + " 分", x + w * 0.75, y + h * 0.62);
}

// ------------------------------
// 繪製選對、漏選、誤選三類用品清單。
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
// 繪製五題情境題摘要，顯示每題答案與結果。
// ------------------------------
function drawSituationSummary(x, y, w, h, isSmall) {
  fill(255, 253, 244);
  stroke(...palette.border);
  strokeWeight(2);
  rect(x, y, w, h, 16);
  noStroke();
  fill(...palette.darkGreen);
  textSize(isSmall ? 17 : 22);
  text("五題情境題作答摘要", x + w / 2, y + 24);

  const lineH = isSmall ? 35 : 28;
  textAlign(LEFT, CENTER);
  textSize(isSmall ? 13 : 16);
  for (let i = 0; i < situationSummary.length; i++) {
    const record = situationSummary[i];
    const isCorrect = record.selected === record.answer;
    fill(isCorrect ? color(...palette.green) : color(...palette.red));
    text(
      (i + 1) + ". " + (isCorrect ? "答對" : "答錯") + "｜你的答案：" + record.selected + "｜正確答案：" + record.answer,
      x + 14,
      y + 54 + i * lineH
    );
  }
  textAlign(CENTER, CENTER);
}

// ============================================================
// 滑鼠與觸控事件
// ============================================================

// ------------------------------
// 滑鼠按下：處理按鈕、情境選項與拖曳起點。
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
      level1FinishReason = "confirm";
      finishLevel1();
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
    // 重要修正：滑鼠也要先判斷固定在底部的下一題按鈕。
    // 原程式只呼叫選項判定，所以滑鼠按「下一題」時不會切換題目。
    if (situationAnswered) {
      const nextButton = getSituationNextButtonRect();
      if (nextButton && isInside(mouseX, mouseY, nextButton.x, nextButton.y, nextButton.w, nextButton.h)) {
        goToNextSituation();
        return false;
      }
    }
    if (!situationAnswered) {
      handleSituationPointer(mouseX, mouseY);
    }
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
// 手機觸控開始：支援按鈕、拖曳、情境選項與捲動。
// ------------------------------
function touchStarted() {
  const point = getTouchPoint();
  if (!point) {
    return false;
  }

  suppressNextMouse = true;
  lastTouchY = point.y;

  if (state === "start") {
    if (startButton && isInside(point.x, point.y, startButton.x, startButton.y, startButton.w, startButton.h)) {
      beginGame();
    }
    return false;
  }

  if (state === "drag") {
    if (confirmButton && isInside(point.x, point.y, confirmButton.x, confirmButton.y, confirmButton.w, confirmButton.h)) {
      level1FinishReason = "confirm";
      finishLevel1();
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
    // 重要修正：touchStarted 與滑鼠共用完全相同的下一題碰撞區域。
    if (situationAnswered) {
      const nextButton = getSituationNextButtonRect();
      if (nextButton && isInside(point.x, point.y, nextButton.x, nextButton.y, nextButton.w, nextButton.h)) {
        goToNextSituation();
        return false;
      }
      situationTouchScrolling = true;
    } else {
      const selected = handleSituationPointer(point.x, point.y);
      if (!selected) {
        situationTouchScrolling = true;
      }
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
// 手機觸控移動：拖曳用品或捲動畫布內容。
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
// 手機觸控結束：完成拖曳或清除捲動狀態。
// ------------------------------
function touchEnded() {
  const point = getTouchPoint();
  const endX = point ? point.x : mouseX;
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
// 流程、拖曳與計分
// ============================================================

// ------------------------------
// 開始遊戲或重新挑戰時重設所有資料。
// ------------------------------
// ------------------------------
// 建立用品副本並使用 Fisher-Yates 演算法洗牌。
// 每次重新挑戰都會重新呼叫，因此順序不會固定。
// ------------------------------
function createShuffledLevel1Items() {
  const shuffled = items.map((item) => ({
    name: item.name,
    emoji: item.emoji,
    correct: item.correct,
    inBag: false,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    area: ""
  }));

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = floor(random(i + 1));
    const temporary = shuffled[i];
    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = temporary;
  }
  return shuffled;
}

function beginGame() {
  // 每次開始或重新挑戰都重新洗牌，確保用品順序會改變。
  level1Items = createShuffledLevel1Items();

  // 重設第一關 60 秒倒數與自動結算旗標。
  level1StartTime = millis();
  level1TimeLeft = level1TimeLimit;
  level1FinishReason = "confirm";
  level1AlreadyFinished = false;
  for (const item of level1Items) {
    item.inBag = false;
    item.x = 0;
    item.y = 0;
    item.w = 0;
    item.h = 0;
    item.area = "";
  }

  level1Score = 0;
  situationScore = 0;
  correctSelected = [];
  missedItems = [];
  wrongSelected = [];
  situationCurrent = 0;
  situationAnswerSelected = null;
  situationAnswered = false;
  situationSummary = [];
  situationOptionRects = [];

  draggingItem = null;
  contentScroll = 0;
  situationScroll = 0;
  resultScroll = 0;
  contentMaxScroll = 0;
  situationMaxScroll = 0;
  resultMaxScroll = 0;
  toastText = "";
  toastUntil = 0;
  rewardStars = [];
  confetti = [];
  confettiActive = false;
  state = "drag";
}

// ------------------------------
// 按下繼續後才進入關卡二第一題。
// ------------------------------
function startSituation() {
  situationCurrent = 0;
  situationScore = 0;
  situationAnswerSelected = null;
  situationAnswered = false;
  situationSummary = [];
  situationScroll = 0;
  situationMaxScroll = 0;
  rewardStars = [];
  state = "situation";
}

// ------------------------------
// 在用品卡片上開始拖曳，並處理內部捲動座標。
// ------------------------------
function startDraggingAt(pointerX, pointerY) {
  calculateGameLayout();
  const contentX = pointerX;
  const contentY = pointerY + contentScroll;

  for (let i = level1Items.length - 1; i >= 0; i--) {
    const item = level1Items[i];
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
// 拖曳中的卡片跟隨指標，座標在繪圖時即時讀取。
// ------------------------------
function updateDraggingAt(pointerX, pointerY) {
  return;
}

// ------------------------------
// 放開用品時依卡片中心判斷是否進入背包，並顯示自動消失提示。
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
  const wasInBag = draggingItem.inBag;

  draggingItem.inBag = droppedInBag;

  if (droppedInBag && !wasInBag) {
    if (draggingItem.correct) {
      showToast("✅ " + draggingItem.name + "已放入背包！", 1700);
    } else {
      showToast("⚠️ 這個用品可能不適合露營喔！", 1900);
    }
  } else if (!droppedInBag && wasInBag) {
    showToast("↩️ " + draggingItem.name + "已從背包取出", 1300);
  }

  draggingItem = null;
  touchIsScrolling = false;
}

// ------------------------------
// 計算用品分數：選對 +1、漏選 -1、誤選 -1。
// ------------------------------
function calculateLevel1Result() {
  // 每次確認或時間到都重新整理三類用品清單。
  let rawScore = 0;
  correctSelected = [];
  missedItems = [];
  wrongSelected = [];

  // 依照 level1Items 的目前順序檢查，但判定仍使用每筆 correct 資料。
  for (const item of level1Items) {
    if (item.correct && item.inBag) {
      rawScore += 1;
      correctSelected.push(item.name);
    } else if (item.correct && !item.inBag) {
      rawScore -= 1;
      missedItems.push(item.name);
    } else if (!item.correct && item.inBag) {
      rawScore -= 1;
      wrongSelected.push(item.name);
    }
  }

  // 第一關最高 10 分、最低 0 分，維持總分最高 15 分。
  level1Score = constrain(rawScore, 0, 10);
}

// ------------------------------
// 關卡一完成時只結算一次，並先停在 level1Complete 過場頁。
// ------------------------------
function finishLevel1() {
  if (level1AlreadyFinished) {
    return;
  }

  level1AlreadyFinished = true;
  calculateLevel1Result();
  draggingItem = null;
  touchIsScrolling = false;
  state = "level1Complete";
}

// ------------------------------
// 更新第一關倒數；時間到會自動進入 level1Complete。
// ------------------------------
function updateLevel1Timer() {
  if (state !== "drag" || level1AlreadyFinished) {
    return;
  }

  const elapsedSeconds = floor((millis() - level1StartTime) / 1000);
  level1TimeLeft = max(0, level1TimeLimit - elapsedSeconds);

  if (level1TimeLeft <= 0) {
    level1FinishReason = "timeout";
    finishLevel1();
  }
}


// ------------------------------
// 判斷情境題選項或下一題按鈕。
// ------------------------------
function handleSituationPointer(pointerX, pointerY) {
  // 已作答後鎖定選項，只能按下一題，不會重複計分。
  if (situationAnswered) {
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
// 選擇情境題後顯示回饋；答對增加分數與星星。
// ------------------------------
function answerSituation(selectedLabel) {
  if (situationAnswered) {
    return;
  }

  const question = situations[situationCurrent];
  situationAnswerSelected = selectedLabel;
  // 重要修正：選項被點擊後立即設定旗標，讓回饋與下一題按鈕同步出現。
  situationAnswered = true;
  const isCorrect = selectedLabel === question.answer;

  if (isCorrect) {
    situationScore += 1;
    answerFlashColor = color(226, 244, 218);
    rewardStars = [];
    for (let i = 0; i < 12; i++) {
      rewardStars.push({
        x: width * 0.20 + random(width * 0.60),
        y: 180 + random(100),
        size: random(16, 29),
        phase: random(TWO_PI),
        startFrame: frameCount + random(0, 12)
      });
    }
  } else {
    answerFlashColor = color(250, 232, 225);
    rewardStars = [];
  }
  answerFlashUntil = millis() + 650;

  situationSummary.push({
    selected: selectedLabel,
    answer: question.answer
  });
  situationScroll = 0;
}

// ------------------------------
// 按下一題；第五題後進入結果頁。
// ------------------------------
function goToNextSituation() {
  // 沒有完成作答時，不允許跳題。
  if (!situationAnswered) {
    return;
  }

  if (situationCurrent >= situations.length - 1) {
    confettiActive = getDisplayedTotalScore() === 15;
    if (confettiActive) {
      createConfetti();
    }
    resultScroll = 0;
    state = "result";
    return;
  }

  situationCurrent += 1;
  situationAnswerSelected = null;
  situationAnswered = false;
  situationScroll = 0;
  situationMaxScroll = 0;
  situationOptionRects = [];
  rewardStars = [];
}

// ============================================================
// 滿分彩帶：只使用 p5.js 基本圖形與陣列
// ============================================================

// ------------------------------
// 建立不同顏色、速度、角度與形狀的彩帶。
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

  for (let i = 0; i < 170; i++) {
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
}

// ------------------------------
// 更新並繪製持續循環落下的彩帶。
// ------------------------------
function drawConfetti() {
  if (!confettiActive) {
    return;
  }

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
// 共用工具
// ============================================================

// ------------------------------
// 顯示短暫提示，時間到後自動清除。
// ------------------------------
function showToast(message, duration) {
  toastText = message;
  toastUntil = millis() + duration;
}

// ------------------------------
// 繪製不阻擋操作的浮動提示。
// ------------------------------
function drawToast() {
  if (!toastText || millis() >= toastUntil) {
    return;
  }

  const toastW = min(width * 0.88, 470);
  const toastH = 46;
  const toastX = width / 2 - toastW / 2;
  const toastY = 8;
  const remaining = toastUntil - millis();
  const alphaValue = remaining < 300 ? map(remaining, 0, 300, 0, 235) : 235;

  fill(45, 78, 53, alphaValue);
  noStroke();
  rect(toastX, toastY, toastW, toastH, 18);
  fill(255, alphaValue);
  textSize(min(width * 0.035, 18));
  text(toastText, width / 2, toastY + toastH / 2);
}

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
// 判斷座標是否位於矩形中。
// ------------------------------
function isInside(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

// ------------------------------
// 取得拖曳中的指標內容座標。
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
// 繪製不依賴外部素材的背景裝飾。
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
// 視窗尺寸改變時重新設定畫布與內容捲動。
// ------------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  contentScroll = 0;
  situationScroll = 0;
  resultScroll = 0;
}
