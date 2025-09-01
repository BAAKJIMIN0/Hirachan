const express = require('express');
const path = require('path');
const app = express();

// 정적 파일 제공 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// API 예시 (GET)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});