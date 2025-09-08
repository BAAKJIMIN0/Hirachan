const openai = require('./callGpt.js');

const prompts = {
  "kr-to-jp": "일본어로 번역한 문장만 써주세요.",
  "jp-to-kr": "한국어로 번역한 문장만 써주세요."
};

async function translateGpt(text, direction) {
    const systemPrompt = prompts[direction];
    if (!systemPrompt) {
        throw new Error("오류 : 잘못된 번역 방향 설정");
    }
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
        ],
        max_tokens: 200
    });
    return response.choices[0].message.content;
}

module.exports = { translateGpt };