// npm install express openai dotenv mysql2 kuroshiro kuroshiro-analyzer-kuromoji google-auth-library
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();

const { translateGpt } = require('./src/scripts/translate.js');
const { chatGpt } = require('./src/scripts/chatbot.js');
const { initFurigana, toFurigana } = require('./src/scripts/furigana.js');
const { updateLastLogin, decreaseCredits, createUser, getUserByUsername, getMessages } = require('./src/scripts/db.js');

const { OAuth2Client } = require('google-auth-library');
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(googleClientId);

// 미들웨어
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Kuroshiro 초기화
initFurigana()
  .then(() => console.log("Kuroshiro initialized!"))
  .catch(err => console.error("Kuroshiro 초기화 실패:", err));

// 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 로그인
app.post('/login', async (req, res, next) => {
  try {
    const { userid, password } = req.body;
    if (!userid || !password) throw { status: 400, message: '아이디와 비밀번호를 입력하세요.' };

    const user = await getUserByUsername(userid);
    if (!user) throw { status: 404, message: '존재하지 않는 사용자입니다.' };

    const valid = password === user.password; // 평문 비교
    if (!valid) throw { status: 401, message: '비밀번호가 올바르지 않습니다.' };

    await updateLastLogin(user.user_id);
    res.json({ success: true, userId: user.user_id, username: user.username });
  } catch (err) {
    next(err);
  }
});

// 구글 로그인
app.post('/googleLogin', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw { status: 400, message: '토큰이 없습니다.' };

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: googleClientId
    });

    const payload = ticket.getPayload();
    const nickname = payload.email.split('@')[0];
    const username = payload.email;

    let user = await getUserByUsername(username);
    if (!user) { user = await createUser(nickname, username); }
    
    await updateLastLogin(user.user_id);
    res.json({ success: true, userId: user.user_id });
  } catch (err) {
    next({ status: 401, message: '구글 로그인 검증 실패', original: err });
  }
});

// 메시지 불러오기
app.get('/messages/:userId', async (req, res, next) => {
  try {
    const rows = await getMessages(req.params.userId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 번역 요청
app.post('/translate', async (req, res, next) => {
  try {
    const { userId, text, direction } = req.body;
    if (!text) throw { status: 400, message: '텍스트가 존재하지 않습니다.' };

    const translatedText = await translateGpt(userId, text, direction);
    const targetText = direction === "kr-to-jp" ? translatedText : text;
    const furiganaHtml = await toFurigana(targetText);

    res.json({ direction, original: text, translatedText, furiganaHtml });
  } catch (err) {
    next(err);
  }
});

// 채팅 요청
app.post('/chat', async (req, res, next) => {
  try {
    const { userId, userText } = req.body;
    if (!userText) throw { status: 400, message: '텍스트가 존재하지 않습니다.' };

    const recentMessages = await getMessages(userId);
    const messages = recentMessages.map(msg => ({
      role: msg.class_name === "sent" ? "user" : "assistant",
      content: msg.text
    }));

    const answer = await chatGpt(userId, userText, messages);
    res.json({ original: userText, answer });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err.original || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 오류가 발생했습니다.'
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});