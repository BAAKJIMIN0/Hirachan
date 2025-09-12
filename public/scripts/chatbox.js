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
    //saveChatToLocalStorage();
}

// 데이터베이스 불러오기
async function loadChatFromDB(userId) {
    try {
        const res = await fetch(`http://localhost:3000/messages/${userId}`);
        const data = await res.json();

        data.forEach(msg => {
            const messageElement = createMessageElement(msg.text, msg.class_name);
            appendMessage(messageElement);
        });
    } catch (err) {
        console.error("메시지 불러오기 실패:", err);
    }
}

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
            setTimeout(typeNextChar, speed);
        } else {
            //saveChatToLocalStorage();
            if (callback) callback();
        }
    }
    typeNextChar();
}

// 번역 API 호출 함수
async function fetchTranslation(userId, text, direction) {
    try {
        const response = await fetch("/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, text, direction })
        });
        const data = await response.json();
        return {
        translatedText: data.translatedText || "번역 실패",
        furiganaHtml: data.furiganaHtml || "분석 실패"
        };
    } catch (err) {
        console.error(err);
        return "API 요청 오류: " + err.message;
    }
}

// 메시지 전송
sendBtn.addEventListener("click", async () => {
    if (userInput.dataset.sending === "true") return;
    userInput.dataset.sending = "true";

    const message = userInput.value.trim();
    if (!message) {
        userInput.dataset.sending = "false";
        return alert("메시지를 입력해주세요.");
    }

    const userMessage = createMessageElement(message, "sent");
    appendMessage(userMessage);
    userInput.value = "";
    userInput.style.height = "40px";
    translationPreviewContainer.style.display = "none";

    const userId = parseInt(localStorage.getItem("userId") || "0");
    try {
        const payload = {
            userId: userId,
            userText: message,
        };
        console.log("서버로 보낼 JSON:", payload);

        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        simulateTyping(data.answer || "대화 실패");
    } catch (err) {
        console.error(err);
        simulateTyping("API 요청 오류: " + err.message);
    } finally {
        userInput.dataset.sending = "false";
    }
});

// 번역 버튼 생성
function createTranslateBtn() {
    const btn = document.createElement("button");
    btn.classList.add("translate-btn");
    btn.innerText = "T";

    btn.addEventListener("click", async () => {
        const messageElement = btn.closest(".message");
        if (messageElement.dataset.translating === "true") return;
        let translationBox = messageElement.querySelector(".translationBox");

        if (!translationBox) {
            messageElement.dataset.translating = "true";
            const messageText = messageElement.querySelector(".text").innerText;
            
            try {
                const { translatedText, furiganaHtml } = await fetchTranslation(storedUserId, messageText, "jp-to-kr");

                translationBox = document.createElement("div");
                translationBox.classList.add("translationBox");
                translationBox.innerHTML = `
                <div class="furigana">원문: ${furiganaHtml}</div>
                <div class="meaning">해석: ${translatedText}</div>
            `;
            messageElement.appendChild(translationBox);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            } catch(err) {
                console.error(err);
            } finally {
                messageElement.dataset.translating = "false";
            }
        } else {
            translationBox.style.display = translationBox.style.display === "none" ? "" : "none";
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    });

    return btn;
}

async function translate(message, direction) {
    if (!message) return alert("메시지를 입력해주세요.");
    translationPreviewContainer.innerHTML = "";
    let box;
    
    try {
        const { translatedText, furiganaHtml } = await fetchTranslation(storedUserId, message, direction);
        box = document.createElement("div");
        box.classList.add("translation-preview");
        translationPreviewContainer.appendChild(box);
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
        if (direction === "kr-to-jp") {
            box.innerHTML = `
            <div class="furigana">원문: ${furiganaHtml}</div>
            <div class="meaning">해석: ${message}</div>
        `;
        }
        else if (direction === "jp-to-kr") {
            box.innerHTML = `
                <div class="furigana">원문: ${furiganaHtml}</div>
                <div class="meaning">해석: ${translatedText}</div>
            `;
        }
        translationPreviewContainer.style.display = "block";
        if (direction === "kr-to-jp") {
            userInput.value = translatedText;
        }

    } catch (err) {
        console.error(err);
        box.innerText = "API 요청 오류: " + err.message;
        translationPreviewContainer.style.display = "block";
    } finally {
        userInput.dataset.translating = "false"
    }
}

// 번역 버튼 이벤트
translateKrToJpBtn.addEventListener("click", () => {
    if (userInput.dataset.translating === "true") return;
    userInput.dataset.translating = "true";
    translate(userInput.value.trim(), "kr-to-jp")
        .finally(() => { userInput.dataset.translating = "false"; });
});

translateJpToKrBtn.addEventListener("click", () => {
    if (userInput.dataset.translating === "true") return;
    userInput.dataset.translating = "true";
    translate(userInput.value.trim(), "jp-to-kr")
        .finally(() => { userInput.dataset.translating = "false"; });
});

// 초기 로드
const storedUserId = parseInt(localStorage.getItem("userId") || "0", 10);
if (storedUserId > 0) {
    loadChatFromDB(parseInt(storedUserId));
}

/* 로컬스토리지 관련
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
*/