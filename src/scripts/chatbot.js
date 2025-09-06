const OpenAI = require('openai');

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

const promptForChat = "너의 이름은 히라쨩(ひらちゃん)이야. 친절한 일본어 학습 도우미 챗봇이야. 사용자와 일본 여고생들이 쓰는 귀여운 말투로 대화해줘.";

async function chatGpt(userText, messages) {
    try {
        const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: promptForChat },
            ...messages,
            { role: "user", content: userText }
        ],
        max_tokens: 500
    });
    return response.choices[0].message.content;
    } catch (err) {
        console.error("GPT 오류 : ", err);
        return "GPT 오류";
    }
}
module.exports = { chatGpt };