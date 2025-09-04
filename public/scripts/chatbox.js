// 메시지 생성 함수
function createMessageElement(text, type = "sent") {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);

    const originalMessage = document.createElement("div");
    originalMessage.classList.add("originalMessage");

    const textElement = document.createElement("div");
    textElement.classList.add("text");
    textElement.innerText = text;

    const translateBtn = createTranslateBtn();

    originalMessage.appendChild(textElement);
    originalMessage.appendChild(translateBtn);
    messageElement.appendChild(originalMessage);

    return messageElement;
}

// 메시지 추가 및 스크롤 처리
function appendMessage(messageElement) {
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    saveChatToLocalStorage();
}

// 로컬스토리지 저장
function saveChatToLocalStorage() {
    const chatData = Array.from(chatContainer.children).map((message) => {
        const textElement = message.querySelector(".originalMessage .text");
        return {
            text: textElement ? textElement.innerText : "",
            className: message.classList.contains("sent") ? "sent" : "received"
        };
    });
    localStorage.setItem("chatData", JSON.stringify(chatData));
}

// 로컬스토리지 불러오기
function loadChatFromLocalStorage() {
    try {
        const savedChatData = JSON.parse(localStorage.getItem("chatData"));
        if (savedChatData) {
            savedChatData.forEach((msg) => {
                const messageElement = createMessageElement(msg.text, msg.className);
                appendMessage(messageElement);
            });
        }
    } catch (e) {
        console.error("로컬스토리지 데이터 오류:", e);
        localStorage.removeItem("chatData");
    }
}

// 로컬스토리지 초기화
logo.addEventListener("click", (event) => {
    event.preventDefault();
    chatContainer.innerHTML = "";
    localStorage.removeItem("chatData");
    location.reload();
});

// 타이핑 애니메이션
function simulateTyping(fullText, speed = 20, callback) {
    const botMessageElement = createMessageElement("", "received");
    const textElement = botMessageElement.querySelector(".text");

    appendMessage(botMessageElement);

    let index = 0;
    function typeNextChar() {
        if (index < fullText.length) {
            textElement.innerText += fullText.charAt(index);
            index++;
            chatContainer.scrollTop = chatContainer.scrollHeight;
            setTimeout(typeNextChar, speed);
        } else {
            saveChatToLocalStorage();
            if (callback) callback();
        }
    }
    typeNextChar();
}

// 번역 버튼 생성
function createTranslateBtn() {
    const btn = document.createElement("button");
    btn.classList.add("translate-btn");
    btn.innerText = "T";

    btn.addEventListener("click", async () => {
        const messageElement = btn.closest(".message");
        let translationBox = messageElement.querySelector(".translationBox");

        if (!translationBox) {
            translationBox = document.createElement("div");
            translationBox.classList.add("translationBox");
            translationBox.innerText = "번역 중입니다...";
            messageElement.appendChild(translationBox);

            try {
                const messageText = messageElement.querySelector(".text").innerText;
                const response = await fetch("/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: messageText, direction: "jp-to-kr" })
                });
                const data = await response.json();

                const translatedText = data.translation || "번역 실패";
                translationBox.innerHTML = `
                    <div class="original">원문: ${messageText}</div>
                    <div class="meaning">해석: ${translatedText}</div>
                    <div class="kanji">핵심 한자: 한자</div>
                `;
            } catch (err) {
                console.error(err);
                translationBox.innerText = "API 요청 오류: " + err.message;
            }
        } else {
            translationBox.style.display =
                translationBox.style.display === "none" ? "block" : "none";
        }
    });
    return btn;
}

function createTranslationBox(original, meaning, kanji) {
    const translationBox = document.createElement("div");
    translationBox.classList.add("translationBox");
    translationBox.innerHTML = `
        <div class="original">원문: ${original}</div>
        <div class="meaning">해석: ${meaning}</div>
        <div class="kanji">핵심 한자: ${kanji}</div>
    `;
    return translationBox;
}

// 메시지 전송
sendBtn.addEventListener("click", async () => {
    const message = userInput.value.trim();
    if (!message) return alert("메시지를 입력해주세요.");

    const userMessage = createMessageElement(message, "sent");
    appendMessage(userMessage);

    userInput.value = "";
    userInput.style.height = "40px";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message }),
        });
        const data = await response.json();
        simulateTyping(data.answer || "대화 실패");
    } catch (err) {
        console.error(err);
        simulateTyping("API 요청 오류: " + err.message);
    }
});

async function translate(message, direction) {
    if (!message) return alert("메시지를 입력해주세요.");

    translationPreviewContainer.innerHTML = "";

    const box = document.createElement("div");
    box.classList.add("translation-preview");
    box.innerText = `
        번역 중입니다...

    `;

    translationPreviewContainer.appendChild(box);

    try {
        const response = await fetch("/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message, direction }),
        });
        const data = await response.json();
        const translatedText = data.translation || "번역 실패";

        box.innerHTML = `
            <div class="original">원문: ${message}</div>
            <div class="meaning">해석: ${translatedText}</div>
            <div class="kanji">핵심 한자: 한자</div>
        `;
    } catch (err) {
        console.error(err);
        box.innerText = "API 요청 오류: " + err.message;
    }
}

// 번역 버튼 이벤트
translateKorToJpBtn.addEventListener("click", () => translate(userInput.value.trim(), "kr-to-jp"));
translateJpToKorBtn.addEventListener("click", () => translate(userInput.value.trim(), "jp-to-kr"));

// 초기 로드
loadChatFromLocalStorage();
