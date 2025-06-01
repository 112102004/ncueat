// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCw0NihjYqGKqAl8iVN2rHYsjR6o-r0leY",
  authDomain: "ncueat.firebaseapp.com",
  databaseURL: "https://ncueat-default-rtdb.firebaseio.com",
  projectId: "ncueat",
  storageBucket: "ncueat.firebasestorage.app",
  messagingSenderId: "820118340199",
  appId: "1:820118340199:web:6085167b7be0e498410ac2",
  measurementId: "G-WS9X58LENS"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

let userId = null;
auth.signInAnonymously().catch(console.error);

auth.onAuthStateChanged(user => {
  if (user) {
    userId = user.uid;
    loadPreferences();
  }
});

// 所有選項
const allOptions = [
  "萊客堡", "維克美而美", "萊姆斯", "品樂", "樂活堡", "大客蔬菜蛋餅", "小木屋鬆餅",
  "吃早餐", "麥堡堡", "雙響丼", "No.17 White House", "Daddy’s 美式餐廳",
  "八哥重慶酸辣粉", "歐姆萊斯", "新福", "福泉豆花", "米豆", "迷路", "花路", "馬爾波",
  "食間", "自己煮健康鍋", "一品鍋", "粥王", "無敵蛋餅", "茶繪", "宵夜屋", "車車",
  "雞叔叔", "香雞排", "對面上海湯包", "緣杏", "立新影印店", "楊滇風", "樵夫關東煮", "宵夜街腸粉", "咖哩老師", "路易莎", "漢堡王", "曼尼"
];

// 不想吃的選項
let excludedOptions = [];
let currentOptions = [];

const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultContainer = document.getElementById('resultContainer');
const resultText = document.getElementById('resultText');
const confirmBtn = document.getElementById('confirmBtn');
const excludeBtn = document.getElementById('excludeBtn');

const centerX = wheel.width / 2;
const centerY = wheel.height / 2;
const radius = 180;

let startAngle = 0;
let arc = 0;
let spinning = false;
let spinTime = 0;
let spinTimeTotal = 0;
let spinAngleStart = 0;
let finalIndex = -1;

// ✅ 轉盤中間 icon 設定
const iconList = ["🍗", "🍜", "🍕", "🥤", "🍛", "🍣", "🍩", "🥟", "🍔"];
let centerIcon = iconList[Math.floor(Math.random() * iconList.length)];

// 載入不想吃偏好
function loadPreferences() {
  if (!userId) return;

  database.ref(`users/${userId}/preferences`).once('value').then(snapshot => {
    const prefs = snapshot.val();
    if (prefs && Array.isArray(prefs)) {
      excludedOptions = prefs;
    } else {
      excludedOptions = [];
    }
    refreshOptions();
    drawWheel();
  });
}

// 儲存偏好
function savePreferences() {
  if (!userId) return;
  database.ref(`users/${userId}/preferences`).set(excludedOptions);
}

// 更新有效選項
function refreshOptions() {
  currentOptions = allOptions.filter(o => !excludedOptions.includes(o));
  arc = Math.PI * 2 / currentOptions.length;
  startAngle = 0;
}

// 繪製轉盤
function drawWheel() {
  ctx.clearRect(0, 0, wheel.width, wheel.height);

  if (currentOptions.length === 0) {
    ctx.fillStyle = "#b67881";
    ctx.font = "24px 'Noto Sans TC'";
    ctx.textAlign = "center";
    ctx.fillText("沒有可選的餐廳囉！", centerX, centerY);
    spinBtn.disabled = true;
    return;
  } else {
    spinBtn.disabled = false;
  }

  const colors = ["#f8ccd7", "#eab0bb"];
  for (let i = 0; i < currentOptions.length; i++) {
    let angle = startAngle + i * arc;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
  }

  // ✅ 畫出轉盤中心的 icon
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(centerIcon, centerX, centerY);
}

// 轉動轉盤
function spin() {
  if (spinning || currentOptions.length === 0) return;
  spinning = true;
  spinBtn.disabled = true;
  resultContainer.classList.add('hidden');

  // ✅ 每次點擊隨機換中心 icon
  centerIcon = iconList[Math.floor(Math.random() * iconList.length)];

  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3000 + 4000;

  rotateWheel();
}

function rotateWheel() {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }

  let spinAngle =
    spinAngleStart * (1 - spinTime / spinTimeTotal) ** 3;

  startAngle += (spinAngle * Math.PI) / 180;
  drawWheel();
  spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
  spinning = false;
  let degrees = (startAngle * 180) / Math.PI + 90;
  degrees = degrees % 360;
  if (degrees < 0) degrees += 360;

  let index = Math.floor(currentOptions.length - (degrees / 360) * currentOptions.length) % currentOptions.length;
  finalIndex = index;

  resultText.textContent = currentOptions[finalIndex];
  resultContainer.classList.remove('hidden');
  spinBtn.disabled = false;
}

// 按鈕事件
spinBtn.addEventListener('click', () => {
  resultContainer.classList.add('hidden');
  spin();
});

confirmBtn.addEventListener('click', () => {
  alert(`太棒了！享用你的${currentOptions[finalIndex]}吧！`);
  resultContainer.classList.add('hidden');
});

excludeBtn.addEventListener('click', () => {
  const item = currentOptions[finalIndex];
  if (!excludedOptions.includes(item)) {
    excludedOptions.push(item);
    savePreferences();
    refreshOptions();
    drawWheel();
  }
  alert(`已加入不想吃清單，下次不會出現${item}。`);
  resultContainer.classList.add('hidden');
});

// 初始化
refreshOptions();
drawWheel();
