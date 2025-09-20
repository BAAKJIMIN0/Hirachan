const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'hirachan',
  user: 'root',
  password: 'Qwe067901!',
  database: 'hirachan',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function updateLastLogin(userId) {
  const [result] = await pool.execute(
    `UPDATE users SET last_login = NOW() WHERE user_id = ?`,
    [userId]
  );
  return result;
}

async function decreaseCredits(userId, amount) {
  const [result] = await pool.execute(
    `UPDATE users SET credits = credits - ? WHERE user_id = ? AND credits >= ?`,
    [amount, userId, amount]
  );
  return result.affectedRows > 0;
}

async function createUser(nickname, userName) {
  const [result] = await pool.execute(
    `INSERT INTO users (username, nickname, email) VALUES (?, ?, ?)`,
    [userName, nickname, userName]
  );

  const userId = result.insertId;
  return { user_id: userId, username: userName, email: userName };
}

// 메시지 가져오기
async function getMessages(userId) {
  const [rows] = await pool.execute(
    `SELECT original AS text, state AS class_name, created_at
     FROM messages
     WHERE user_id = ?
     ORDER BY created_at ASC
     LIMIT 20`,
    [userId]
  );
  return rows;
}

// 메시지 저장 함수
async function saveMessage(userId, original, translated = null, furigana = null, state) {
  const sql = `
    INSERT INTO messages (user_id, original, translated, furigana, state)
    VALUES (?, ?, ?, ?, ?)
  `;
  await pool.execute(sql, [userId, original, translated, furigana, state]);
}

async function saveTranslation(messageId, translatedText) {
  const sql = `
    UPDATE messages
    SET translated = ?
    WHERE message_id = ?
  `;
  await pool.execute(sql, [translatedText, messageId]);
}

async function saveFurigana(messageId, furignanaHtml) {
  const sql = `
    UPDATE messages
    SET furigana = ?
    WHERE message_id = ?
  `;
  await pool.execute(sql, [furignanaHtml, messageId]);
}

async function getUserByUsername(username) {
  const [rows] = await pool.execute(
    `SELECT * FROM users WHERE username = ? LIMIT 1`,
    [username]
  );
  return rows[0];
}

module.exports = { 
  pool, updateLastLogin, decreaseCredits, createUser, getMessages, saveMessage,
  saveTranslation, saveFurigana, getUserByUsername
};