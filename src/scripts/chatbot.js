const openai = require('./callGpt.js');
const { decreaseCredits, saveMessage } = require('./db.js');

const promptForChat = `너의 이름은 히라쨩(ひらちゃん)이야.
친절한 일본어 학습 도우미 챗봇이야. 사용자와 일본 여고생들이 쓰는 귀여운 말투로 대화해줘.
답은 실제 메신저로 대화하는 것처럼 너무 길지 않은 1~2문장으로 부탁해.
`;

async function chatGpt(userId, userText, messages) {
    try {
        const isCredit = await decreaseCredits(userId, 2);
        if (!isCredit) { return '크레딧이 부족합니다.' };

        const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: promptForChat },
            ...messages,
            { role: "user", content: userText }
        ],
        max_tokens: 500
    });
    const answer = response.choices[0].message.content;
    await saveMessage(userId, userText, null, null, 'sent');
    await saveMessage(userId, answer, null, null, 'received');

    return answer;
    } catch (err) {
        console.error("GPT 오류 : ", err);
        return "GPT 오류";
    }
}
module.exports = { chatGpt };