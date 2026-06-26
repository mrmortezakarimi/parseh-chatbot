const input = document.getElementById("userInput");
const chatBox = document.getElementById("messages");

// ⭐ حافظهٔ مکالمه
let conversation = [];

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // پیام کاربر
  addMessage(text, "user");
  input.value = "";

  // ⭐ ذخیره در حافظه
  conversation.push({ role: "user", content: text });

  // پیام "در حال تایپ..."
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot typing";
  typingDiv.id = "typing";
  typingDiv.innerText = "در حال تایپ...";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // ⭐ ساختن پیام کامل شامل تاریخچه
  const historyText = conversation
    .map(msg => (msg.role === "user" ? "کاربر: " : "پارسه: ") + msg.content)
    .join("\n");

  const finalPrompt = `این تاریخچهٔ گفتگو تا الان است:\n${historyText}\n\nحالا ادامهٔ گفتگو را بر اساس این تاریخچه جواب بده.`;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: finalPrompt })
    });

    const data = await response.json();
    document.getElementById("typing").remove();

    const reply = data.reply || "خطا در دریافت پاسخ";

    addMessage(reply, "bot");

    // ⭐ ذخیرهٔ جواب بات در حافظه
    conversation.push({ role: "assistant", content: reply });

  } catch (e) {
    document.getElementById("typing").remove();
    addMessage("خطایی رخ داد!", "bot");
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerText = text;
  chatBox.appendChild(div);
}
