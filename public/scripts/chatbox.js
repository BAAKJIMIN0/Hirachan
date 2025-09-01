// 로컬스토리지 저장
function saveChatToLocalStorage() {
    const chatData = Array.from(chatContainer.children).map((message) => ({
        text: message.querySelector('div')?.innerText || "",
        className: message.className,
    }));
    localStorage.setItem("chatData", JSON.stringify(chatData));
}

// 로컬스토리지에서 채팅 불러오기
function loadChatFromLocalStorage() {
    try {
        const savedChatData = JSON.parse(localStorage.getItem("chatData"));
        if (savedChatData) {
            savedChatData.forEach((message) => {
                const messageElement = document.createElement("div");
                messageElement.className = message.className;

                const textElement = document.createElement("div");
                if (message.className.includes("received")) {
                    textElement.classList.add("receivedText");
                } else {
                    textElement.classList.add("text");
                }

                textElement.innerText = message.text;
                messageElement.appendChild(textElement);
                chatContainer.appendChild(messageElement);
            });
        }
    } catch (e) {
        console.error("로컬스토리지 데이터 오류:", e);
        localStorage.removeItem("chatData");
    }
}

// 로컬 스토리지 삭제 및 채팅 내역 초기화
logo.addEventListener("click", (event) => {
    event.preventDefault();

    const chatContainer = document.getElementById("chat-container");
    chatContainer.innerHTML = "";

    localStorage.removeItem("chatData");

    location.reload();
});

// 타이핑 애니메이션
function simulateTyping(fullText, speed = 20, callback) {
    const botMessageElement = document.createElement("div");
    botMessageElement.classList.add("message", "received");

    const textElement = document.createElement("div");
    textElement.classList.add("receivedText");
    botMessageElement.appendChild(textElement);
    chatContainer.appendChild(botMessageElement);

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

// 사용자 메시지 전송
sendBtn.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (message === "") {
        alert("메시지를 입력해주세요.");
        return;
    }

    // 사용자 메시지 생성
    const userMessageElement = document.createElement("div");
    userMessageElement.classList.add("message", "sent");

    const textElement = document.createElement("div");
    textElement.classList.add("text");
    textElement.innerText = message;

    userMessageElement.appendChild(textElement);
    chatContainer.appendChild(userMessageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    userInput.value = "";
    userInput.style.height = "40px";

    saveChatToLocalStorage();

    // 봇 응답 (typing)
    simulateTyping(`TEST: ${message}`);
});

// 초기 로드
loadChatFromLocalStorage();
