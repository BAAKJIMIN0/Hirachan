const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '0679',
  database: 'hirachan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

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

module.exports = { pool, saveMessage, saveTranslation, saveFurigana };