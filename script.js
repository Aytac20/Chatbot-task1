const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const chatbotToggler = document.querySelector("#chatbot-toggler ");
const chatbotCloser = document.querySelector("#close-chatbot ");
const API_KEY = "AIzaSyCAOYcFlS_J7gDt75wB62JtmLc73NAaXek";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const userData = {
  message: null,
};
let messages = JSON.parse(localStorage.getItem("chat_messages")) || [];

const saveMessageToLocaleStorage = (sender, text) => {
  messages.push({ sender, text, time: getCurrentTime() });
  localStorage.setItem("chat_messages", JSON.stringify(messages));
};
const loadMessageFromLocaleStorage = () => {
  messages.forEach((msg) => {
    const messageContent = `
      <div class="message-text">${msg.text}</div>
      <span class="message-time">${msg.time}</span>
    `;

    const div = createMessageElement(
      messageContent,
      msg.sender === "user" ? "user-message" : "bot-message"
    );

    chatBody.appendChild(div);
  });

  chatBody.scrollTo({ top: chatBody.scrollHeight });
};

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: userData.message }],
        },
      ],
    }),
  };
  try {
    const res = await fetch(API_URL, requestOptions);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error.message);
    const apiResponseText = data.candidates[0].content.parts[0].text.trim();

    messageElement.innerText = apiResponseText;
    saveMessageToLocaleStorage("bot", apiResponseText);
  } catch (error) {
    messageElement.innerText = error.message;
    messageElement.style.color = "#df0000ff";
  } finally {
    messageElement.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  messageInput.value = "";
  const messageContent = `
  <div class="message-text"></div>
  <span class="message-time">${getCurrentTime()}</span>
`;

  const outgoingMessageDiv = createMessageElement(
    messageContent,
    "user-message"
  );
  outgoingMessageDiv.querySelector(".message-text").textContent =
    userData.message;
  saveMessageToLocaleStorage("user", userData.message);

  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  setTimeout(() => {
    const messageContent = `  <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            width="50"
            height="50"
            class="bot-avatar"
          >
            <path
              d="M352 64C352 46.3 337.7 32 320 32C302.3 32 288 46.3 288 64L288 128L192 128C139 128 96 171 96 224L96 448C96 501 139 544 192 544L448 544C501 544 544 501 544 448L544 224C544 171 501 128 448 128L352 128L352 64zM160 432C160 418.7 170.7 408 184 408L216 408C229.3 408 240 418.7 240 432C240 445.3 229.3 456 216 456L184 456C170.7 456 160 445.3 160 432zM280 432C280 418.7 290.7 408 304 408L336 408C349.3 408 360 418.7 360 432C360 445.3 349.3 456 336 456L304 456C290.7 456 280 445.3 280 432zM400 432C400 418.7 410.7 408 424 408L456 408C469.3 408 480 418.7 480 432C480 445.3 469.3 456 456 456L424 456C410.7 456 400 445.3 400 432zM224 240C250.5 240 272 261.5 272 288C272 314.5 250.5 336 224 336C197.5 336 176 314.5 176 288C176 261.5 197.5 240 224 240zM368 288C368 261.5 389.5 240 416 240C442.5 240 464 261.5 464 288C464 314.5 442.5 336 416 336C389.5 336 368 314.5 368 288zM64 288C64 270.3 49.7 256 32 256C14.3 256 0 270.3 0 288L0 384C0 401.7 14.3 416 32 416C49.7 416 64 401.7 64 384L64 288zM608 256C590.3 256 576 270.3 576 288L576 384C576 401.7 590.3 416 608 416C625.7 416 640 401.7 640 384L640 288C640 270.3 625.7 256 608 256z"
            />
          </svg>
          <div class="message-text">
            <div class="thinking-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>`;
    const incomingMessageDiv = createMessageElement(
      messageContent,
      "bot-message",
      "thinking"
    );
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage) {
    handleOutgoingMessage(e);
  }
});
sendMessageButton.addEventListener("click", (e) => {
  handleOutgoingMessage(e);
});
chatbotToggler.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);
chatbotCloser.addEventListener("click", () =>
  document.body.classList.remove("show-chatbot")
);
// Emoji picker
const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    messageInput.value += emoji.native;
    messageInput.focus();
  },
});

picker.id = "emoji-picker";
document.body.appendChild(picker);

const showEmojiButton = document.querySelector("#show-emoji");

showEmojiButton.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  document.body.classList.toggle("show-emoji-picker");
});

document.addEventListener("click", (e) => {
  if (!picker.contains(e.target) && e.target.id !== "show-emoji") {
    document.body.classList.remove("show-emoji-picker");
  }
});

loadMessageFromLocaleStorage();
