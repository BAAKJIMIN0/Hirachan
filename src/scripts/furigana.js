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

  const [rows] = await pool.execute(
    'SELECT message_id, furigana FROM messages WHERE original = ? ORDER BY created_at DESC LIMIT 1',
    [originalText]
  );

  if (rows.length > 0 && rows[0].furigana) {
    return rows[0].furigana;
  }

  const furiganaHtml = await kuroshiro.convert(originalText, { to: "hiragana", mode: "furigana" });
  if (rows.length > 0) {
    const messageId = rows[0].message_id;
    await saveFurigana(messageId, furiganaHtml);
  }

  return furiganaHtml;
}

module.exports = { initFurigana, toFurigana };
