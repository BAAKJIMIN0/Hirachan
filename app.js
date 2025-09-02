// npm install express openai dotenv
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const { translateGpt } = require('./src/scripts/translate.js');

// 정적 파일 제공 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API 예시
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 번역 요청
app.post('/translate', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: '텍스트가 존재하지 않습니다.' })
  }
  
  try {
    const translation = await translateGpt(text);
    res.json({ 
      original: text,
      translation: translation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '번역 중 오류가 발생했습니다.' });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});