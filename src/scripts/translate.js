const openai = require('./callGpt.js');
const { pool, saveTranslation } = require('./db.js');

const prompts = {
  "kr-to-jp": "일본어로 번역한 문장만 써주세요.",
  "jp-to-kr": "한국어로 번역한 문장만 써주세요."
};

async function translateGpt(originalText, direction) {
    const systemPrompt = prompts[direction];
    if (!systemPrompt) {
        throw new Error("오류 : 잘못된 번역 방향 설정");
    }

    const [rows] = await pool.execute(
        'SELECT message_id FROM messages WHERE user_id = ? AND original = ? ORDER BY created_at DESC LIMIT 1',
        [1, originalText]
    );

    if (rows.length === 0) {
        throw new Error("해당 메시지를 DB에서 찾을 수 없습니다.");
    }
    const messageId = rows[0].message_id;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: originalText }
        ],
        max_tokens: 200
    });
    const translated = response.choices[0].message.content;
    await saveTranslation(messageId, translated);
    return translated;
}

module.exports = { translateGpt };