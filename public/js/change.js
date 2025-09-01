const userInput = document.getElementById("user-input");
const autoChangeBtn = document.getElementById("autoChange-btn");

autoChangeBtn.addEventListener("click", () => {
  autoChangeBtn.classList.toggle("active");
});

function hiraToKata(str) {
  return [...str].map(ch => {
    const code = ch.charCodeAt(0);
    return (code >= 0x3041 && code <= 0x3096)
      ? String.fromCharCode(code + 0x60)
      : ch;
  }).join('');
}

function kataToHira(str) {
  return [...str].map(ch => {
    const code = ch.charCodeAt(0);
    return (code >= 0x30A1 && code <= 0x30F6)
      ? String.fromCharCode(code - 0x60)
      : ch;
  }).join('');
}

function getCharType(ch) {
  const code = ch.charCodeAt(0);

  if (code >= 0xAC00 && code <= 0xD7A3) {
    return "han"; // 한글
  }
  if (code >= 0x3040 && code <= 0x309F) {
    return "hira"; // 히라가나
  }
  if ((code >= 0x30A0 && code <= 0x30FF) || (code >= 0x31F0 && code <= 0x31FF)) {
    return "kata"; // 가타카나
  }
  return "etc"; // 그 외
}

const mainHMap = {
    "아": "あ", "이": "い", "우": "う", "으": "う", "에": "え", "애": "え",
    "오": "お", "야": "や", "요": "よ", "유": "ゆ",
    "카": "か", "키": "き", "쿠": "く", "크": "く", "케": "け", "캐": "け",
    "코": "こ", "캬": "きゃ", "쿄": "きょ", "큐": "きゅ",
    "가": "が", "기": "ぎ", "구": "ぐ", "그": "ぐ", "게": "げ", "개": "げ",
    "고": "ご", "갸": "ぎゃ", "교": "ぎょ", "규": "ぎゅ",
    "사": "さ", "시": "し", "수": "す", "스": "す", "세": "せ", "새": "せ",
    "소": "そ", "샤": "しゃ", "쇼": "しょ", "슈": "しゅ",
    "자": "ざ", "지": "じ", "주": "ず", "즈": "ず", "제": "ぜ", "재": "ぜ",
    "조": "ぞ", "쟈": "じゃ", "죠": "じょ", "쥬": "じゅ",
    "타": "た", "치": "ち", "츠": "つ", "츠": "つ", "테": "て", "태": "て",
    "토": "と", "탸": "ちゃ", "쵸": "ちょ", "츄": "ちゅ",
    "다": "だ", "디": "ぢ", "두": "づ", "드": "づ", "데": "で", "대": "で",
    "도": "ど", "댜": "ぢゃ", "됴": "ぢょ", "듀": "ぢゅ",
    "나": "な", "니": "に", "누": "ぬ", "느": "ぬ", "네": "ね", "내": "ね",
    "노": "の", "냐": "にゃ", "뇨": "にょ", "뉴": "にゅ",
    "하": "は", "히": "ひ", "후": "ふ", "흐": "ふ", "헤": "へ", "해": "へ",
    "호": "ほ", "햐": "ひゃ", "효": "ひょ", "휴": "ひゅ",
    "바": "ば", "비": "び", "부": "ぶ", "브": "ぶ", "베": "べ", "배": "べ",
    "보": "ぼ", "뱌": "びゃ", "뵤": "びょ", "뷔": "びゅ",
    "파": "ぱ", "피": "ぴ", "푸": "ぷ", "프": "ぷ", "페": "ぺ", "패": "ぺ",
    "포": "ぽ", "퍄": "ぴゃ", "표": "ぴょ", "퓨": "ぴゅ",
    "마": "ま", "미": "み", "무": "む", "므": "む", "메": "め", "매": "め",
    "모": "も", "먀": "みゃ", "묘": "みょ", "뮤": "みゅ",
    "라": "ら", "리": "り", "루": "る", "르": "る", "레": "れ", "래": "れ",
    "로": "ろ", "랴": "りゃ", "료": "りょ", "류": "りゅ",
    "와": "わ", "ㅗ": "を", "응": "ん",
    "까": "か", "ㅡ": "ー"
  };
  
const subHMap = {
    "" : "", "ㄴ": "ん", "ㅇ" : "ん", "ㅅ": "っ"
};

const mainKMap = {};
for (const [kor, hira] of Object.entries(mainHMap)) {
  mainKMap[kor] = hiraToKata(hira);
}

const subKMap = {};
for (const [kor, hira] of Object.entries(subHMap)) {
  subKMap[kor] = hiraToKata(hira);
}

function splitHangul(syllable) {
  const HANGUL_BASE = 0xAC00;
  const CHOSEONG = 21 * 28;
  const JUNGSEONG = 28;

  const code = syllable.charCodeAt(0);
  if (code < HANGUL_BASE || code > 0xD7A3) {
      return [syllable, ""];
  }

  const offset = code - HANGUL_BASE;
  const jongIndex = offset % 28;
  const jungIndex = Math.floor((offset % CHOSEONG) / JUNGSEONG);
  const choIndex = Math.floor(offset / CHOSEONG);

  const cho = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"[choIndex];
  const jung = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"[jungIndex];
  const jong = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ",
                "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"][jongIndex];

  const mainChar = String.fromCharCode(HANGUL_BASE + choIndex * CHOSEONG + jungIndex * JUNGSEONG);
  return [mainChar, jong];
}

userInput.addEventListener("compositionend", (e) => {
  if (!autoChangeBtn.classList.contains("active")) return;

  const inputText = userInput.value;
  if (!inputText) return;

  const lastChar = inputText[inputText.length - 1];
  let converted = "";

  if (
    lastChar === "\n" ||
    lastChar === " " ||
    (lastChar >= "0" && lastChar <= "9") ||
    (lastChar >= "A" && lastChar <= "Z") ||
    (lastChar >= "a" && lastChar <= "z")
  ) {
    converted = lastChar;
  } else {
    const [main, sub] = splitHangul(lastChar);
    const mainJP = mainHMap[main] || main;
    const subJP = subHMap[sub] || sub;
    converted = mainJP + subJP;
  }

  userInput.value = inputText.slice(0, -1) + converted;
});

document.getElementById("toH-btn").addEventListener("click", () => {
    const userInput = document.getElementById("user-input");
    const start = userInput.selectionStart;
    const end = userInput.selectionEnd;

    if (start === end) return;

    const selectedText = userInput.value.slice(start, end);
    let converted = "";

    for (let ch of selectedText) {
      const type = getCharType(ch);
      if (type === "han") {
      const [main, sub] = splitHangul(ch);
      const mainJP = mainHMap[main] || main;
      const subJP = subHMap[sub] || sub;
      converted += mainJP + subJP;
    } else if (type === "kata") {
      converted += kataToHira(ch);
    } else {
      converted += mainHMap[ch] || ch;
    }
  }
  userInput.setRangeText(converted, start, end, "end");
});

document.getElementById("toK-btn").addEventListener("click", () => {
    const userInput = document.getElementById("user-input");
    const start = userInput.selectionStart;
    const end = userInput.selectionEnd;

    if (start === end) return;

    const selectedText = userInput.value.slice(start, end);
    let converted = "";

    for (let ch of selectedText) {
      const type = getCharType(ch);
      if (type === "han") {
      const [main, sub] = splitHangul(ch);
      const mainJP = mainKMap[main] || main;
      const subJP = subKMap[sub] || sub;
      converted += mainJP + subJP;
    } else if (type === "hira") {
      converted += hiraToKata(ch);
    } else {
      converted += mainKMap[ch] || ch;
    }
  }
  userInput.setRangeText(converted, start, end, "end");
});