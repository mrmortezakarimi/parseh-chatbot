const input = document.getElementById("message");
const chatBox = document.getElementById("chat");

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await response.json();
  const reply = data.reply || "خطا در دریافت پاسخ";

  addMessage(reply, "bot");
}

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = sender;
  div.innerText = text;
  chatBox.appendChild(div);
}
