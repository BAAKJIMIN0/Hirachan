require('dotenv').config();
const OpenAI = require('openai');

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

async function translateGpt(text) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "한국어로 번역한 문장만 써주세요." },
            { role: "user", content: text }
        ]
    });
    return response.choices[0].message.content;
}

module.exports = { translateGpt };