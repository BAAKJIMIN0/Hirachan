// npm install express openai dotenv mysql12 kuroshiro kuroshiro-analyzer-kuromoji
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const { translateGpt } = require('./src/scripts/translate.js');
const { chatGpt } = require('./src/scripts/chatbot.js');
const { initFurigana, toFurigana } = require('./src/scripts/furigana.js');
const { getMessages } = require('./src/scripts/db.js');

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

// 대화 불러오기
app.get('/messages/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const rows = await getMessages(userId);
    res.json(rows);
  } catch (err) {
    console.error("메시지 불러오기 오류:", err);
    res.status(500).json({ error: '메시지 조회 중 오류 발생' });
  }
});

// 번역 요청
app.post('/translate', async (req, res) => {
  const { text, direction } = req.body;

  if (!text) {
    return res.status(400).json({ error: '텍스트가 존재하지 않습니다.' })
  }
  
  try {
    const translatedText = await translateGpt(text, direction);
    const targetText = direction === "kr-to-jp" ? translatedText : text;
    const furiganaHtml = await toFurigana(targetText);
    
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
    const { userText, userId } = req.body;

    if (!userText) return res.status(400).json({ error: '텍스트가 존재하지 않습니다.' });

    try {
        const recentMessages = await getMessages(userId);

        const messages = recentMessages.map(msg => ({
            role: msg.class_name === "sent" ? "user" : "assistant",
            content: msg.text
        }));

        const answer = await chatGpt(userText, messages);
        res.json({ original: userText, answer });
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