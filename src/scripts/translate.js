const OpenAI = require('openai');

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

const promptForKor = "한국어로 번역한 문장만 써주세요.";
const promptForJp = "일본어로 번역한 문장만 써주세요.";

async function translateGpt(text, direction) {
    let systemPrompt;
    if (direction === "kr-to-jp") {
        systemPrompt = promptForJp;
    }
    else if (direction === "jp-to-kr") {
        systemPrompt = promptForKor;
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