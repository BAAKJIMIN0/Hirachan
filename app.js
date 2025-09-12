// npm install express openai dotenv mysql12 kuroshiro kuroshiro-analyzer-kuromoji bcrypt google-auth-library
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const { translateGpt } = require('./src/scripts/translate.js');
const { chatGpt } = require('./src/scripts/chatbot.js');
const { initFurigana, toFurigana } = require('./src/scripts/furigana.js');
const { createUser, getUserByUsername, getMessages } = require('./src/scripts/db.js');

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

const bcrypt = require('bcrypt');

// 로그인
app.post('/login', async (req, res) => {
  const { userid, password } = req.body;

  if (!userid || !password) {
    return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력하세요.' });
  }

  try {
    const user = await getUserByUsername(userid);
    if (!user) {
      return res.json({ success: false, message: '존재하지 않는 사용자입니다.' });
    }

    const valid = password === user.password;
    if (!valid) {
      return res.json({ success: false, message: '비밀번호가 올바르지 않습니다.' });
    }

    res.json({ success: true, userId: user.user_id, username: user.username });
  } catch (err) {
    console.error("로그인 오류:", err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

const { OAuth2Client } = require('google-auth-library');
const googleClientId = '631095185833-skdoc8l4mn8oqfpvnu4ktvcu3ko1n5p1.apps.googleusercontent.com'
const googleClient = new OAuth2Client(googleClientId);

// 구글 로그인
app.post('/googleLogin', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: '토큰이 없습니다.' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: googleClientId
    });

    const payload = ticket.getPayload();
    const username = payload.email.split('@')[0];
    const userEmail = payload.email;

    let user = await getUserByUsername(username);
    if (!user) {
      user = await createUser(username, userEmail);
    }

    res.json({ success: true, userId: user?.user_id || null, userEmail, username });
  } catch (err) {
    console.error("구글 로그인 검증 오류:", err);
    res.status(401).json({ success: false, message: '토큰 검증 실패' });
  }
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
  const { userId, text, direction } = req.body;

  if (!text) {
    return res.status(400).json({ error: '텍스트가 존재하지 않습니다.' })
  }
  
  try {
    const translatedText = await translateGpt(userId, text, direction);
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
    const { userId, userText } = req.body;

    if (!userText) return res.status(400).json({ error: '텍스트가 존재하지 않습니다.' });

    try {
        const recentMessages = await getMessages(userId);

        const messages = recentMessages.map(msg => ({
            role: msg.class_name === "sent" ? "user" : "assistant",
            content: msg.text
        }));

        const answer = await chatGpt(userId, userText, messages);
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