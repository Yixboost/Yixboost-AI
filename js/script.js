const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const newChatBtn = document.querySelector("#new-chat-btn");

let userMessage = null;
const API_KEY = "your-openai-key"; //Your OpenAI API Key
const inputInitHeight = chatInput.scrollHeight;

let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
};

const createChatLi = (message, className, source = null) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    const messageElement = chatLi.querySelector("p");
    messageElement.textContent = message;

    if (source) {
        const sourceElement = document.createElement("small");
        sourceElement.textContent = `Source: ${source}`;
        chatLi.appendChild(sourceElement);
    }

    return chatLi;
};

const generateResponse = (chatElement) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");

    messageElement.textContent = "";

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
        })
    };

    fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            const typingSpeed = 20;
            const scrollSpeed = 2; 
            let typingInterval = setInterval(() => {
                if (messageElement.textContent.length < data.choices[0].message.content.trim().length) {
                    messageElement.textContent += data.choices[0].message.content.trim()[messageElement.textContent.length];
                    chatbox.scrollTo(0, chatbox.scrollHeight);
                } else {
                    clearInterval(typingInterval);

                    const emojiList = ['😀', '😂', '😍', '😎', '🚀', '💡', '👍', '🤖', '🎉', '😜'];
                    const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];

                    messageElement.textContent += ` ${randomEmoji}`;
                    chatHistory.push({ role: "bot", content: messageElement.textContent });
                    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
                    chatbox.scrollTo(0, chatbox.scrollHeight);

                    const copyIcon = document.createElement("i");
                    copyIcon.classList.add("fa-solid", "fa-copy");
                    copyIcon.style.cursor = "pointer";
                    copyIcon.addEventListener("click", () => {
                        copyToClipboard(messageElement.textContent);
                        changeCopyIcon(copyIcon);
                    });

                    chatElement.appendChild(copyIcon);
                }
            }, typingSpeed);
        })
        .catch(() => {
            messageElement.classList.add("error");
            messageElement.textContent = "Oops! Something went wrong. Please try again.";
            chatHistory.push({ role: "bot", content: messageElement.textContent });
            localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
            chatbox.scrollTo(0, chatbox.scrollHeight);
        });
};

const changeCopyIcon = (copyIcon) => {
    const checkIcon = document.createElement("i");
    checkIcon.classList.add("fa-solid", "fa-check");
    copyIcon.replaceWith(checkIcon);

    setTimeout(() => {
        checkIcon.replaceWith(copyIcon);
    }, 3000);
};





const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    chatHistory.push({ role: "user", content: userMessage });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
};

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);

window.addEventListener("load", () => {
    chatHistory.forEach(message => {
        const chatLi = createChatLi(message.content, message.role === "user" ? "outgoing" : "incoming");
        chatbox.appendChild(chatLi);
    });
    chatbox.scrollTo(0, chatbox.scrollHeight);
});

const clearChatHistory = () => {
    chatHistory = [];
    localStorage.removeItem("chatHistory");
    chatbox.innerHTML = "";
    
    const greetingMessage = "Hi there 👋\nHow can I help you today?";
    const greetingChatLi = createChatLi(greetingMessage, "incoming");
    chatbox.appendChild(greetingChatLi);
};

newChatBtn.addEventListener("click", clearChatHistory);
