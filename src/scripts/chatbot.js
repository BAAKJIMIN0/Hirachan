const OpenAI = require('openai');

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

const promptForChat = "너는 친절한 일본어 학습 도우미 챗봇, 히라쨩(ひらちゃん)이야. 사용자와 일본어로 대화하고 일본 여고생들이 쓰는 귀여운 말투로 해줘.";

async function chatGpt(text) {
    let systemPrompt = promptForChat;
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

module.exports = { chatGpt };