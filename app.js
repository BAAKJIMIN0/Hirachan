// npm install express openai dotenv kuroshiro kuroshiro-analyzer-kuromoji
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const { translateGpt } = require('./src/scripts/translate.js');
const { chatGpt } = require('./src/scripts/chatbot.js');
const { initFurigana, toFurigana } = require('./src/scripts/furigana.js');

// 정적 파일 제공 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

initFurigana()
  .then(() => console.log("Kuroshiro initialized!"))
  .catch(err => console.error("Kuroshiro 초기화 실패:", err));

// API 예시
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 번역 요청
app.post('/translate', async (req, res) => {
  const { text, direction } = req.body;

  if (!text) {
    return res.status(400).json({ error: '텍스트가 존재하지 않습니다.' })
  }
  
  try {
    const translatedText = await translateGpt(text, direction);
    let furiganaHtml = "";
    if (direction === "kr-to-jp") {
      furiganaHtml = await toFurigana(translatedText);
    }
    else if (direction === "jp-to-kr") {
      furiganaHtml = await toFurigana(text);
    }
    
    res.json({ 
      direction: direction,
      original: text,
      translatedText: translatedText,
      furiganaHtml: furiganaHtml
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '번역 중 오류가 발생했습니다.' });
  }
});

// 채팅 요청
app.post('/chat', async (req, res) => {
  const { recentHistory, userText } = req.body;

  if (!userText) {
    return res.status(400).json({ error: '텍스트가 존재하지 않습니다.' })
  }

  const messages = (recentHistory || []).map(msg => ({
    role: msg.className === "sent" ? "user" : "assistant",
    content: msg.text
  }));
  
  try {
    const answer = await chatGpt(userText, messages);
    res.json({ 
      original: userText,
      answer: answer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '채팅 중 오류가 발생했습니다.' });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});