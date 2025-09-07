const KuroshiroModule = require("kuroshiro");
const Kuroshiro = KuroshiroModule.default || KuroshiroModule;
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");

let kuroshiro = null;

async function initFurigana() {
  kuroshiro = new Kuroshiro();
  await kuroshiro.init(new KuromojiAnalyzer());
}

// 후리가나 변환
async function toFurigana(text) {
  if (!kuroshiro) {
    throw new Error("Kuroshiro not initialized. Call initFurigana() first.");
  }
  const html = await kuroshiro.convert(text, { to: "hiragana", mode: "furigana" });
  return html;
}

module.exports = { initFurigana, toFurigana };
