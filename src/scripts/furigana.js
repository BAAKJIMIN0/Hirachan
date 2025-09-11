const { pool, saveFurigana } = require('./db.js');

const KuroshiroModule = require("kuroshiro");
const Kuroshiro = KuroshiroModule.default || KuroshiroModule;
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");

let kuroshiro = null;

async function initFurigana() {
  kuroshiro = new Kuroshiro();
  await kuroshiro.init(new KuromojiAnalyzer());
}

// 후리가나 변환
async function toFurigana(originalText) {
  if (!kuroshiro) {
    throw new Error("Kuroshiro not initialized. Call initFurigana() first.");
  }
  const furiganaHtml = await kuroshiro.convert(originalText, { to: "hiragana", mode: "furigana" });

  const [rows] = await pool.execute(
        'SELECT message_id FROM messages WHERE user_id = ? AND original = ? ORDER BY created_at DESC LIMIT 1',
        [1, originalText]
    );

  if (rows.length === 0) {
        throw new Error("해당 메시지를 DB에서 찾을 수 없습니다.");
    }
  const messageId = rows[0].message_id;

  await saveFurigana(messageId, furiganaHtml);
  return furiganaHtml;
}

module.exports = { initFurigana, toFurigana };
