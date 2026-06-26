const input = document.getElementById("userInput");
const chatBox = document.getElementById("messages");

// حافظهٔ کوتاه
let conversation = [];
let memorySummary = "";
let greeted = false;

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  conversation.push({ role: "user", content: text });

  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot typing";
  typingDiv.id = "typing";
  typingDiv.innerText = "در حال تایپ...";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // خلاصه‌سازی ساده
  if (conversation.length > 10) {
    const historyText = conversation
      .map(m => (m.role === "user" ? "کاربر: " : "دستیار: ") + m.content)
      .join("\n");

    const summaryPrompt = `
    این گفتگو را خلاصه کن و فقط نکات مهم را نگه دار:
    ${historyText}
    خلاصه کوتاه و دقیق باشد.
    `;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: summaryPrompt })
      });

      const data = await res.json();
      memorySummary = data.reply || memorySummary;
      conversation = [];
    } catch {}
  }

  const recentHistory = conversation
    .map(m => (m.role === "user" ? "کاربر: " : "دستیار: ") + m.content)
    .join("\n");

  // ⭐ شخصیت‌نامهٔ جدید و پایدار
  const finalPrompt = `
تو یک دستیار فارسی‌زبان هستی.
لحن تو دوستانه و صمیمی معمولی است؛ نه خشک و رسمی، نه بیش از حد رفیقانه.

قوانین لحن:
- اگر کاربر رسمی حرف زد → رسمی جواب بده.
- اگر کاربر صمیمی حرف زد → صمیمی معمولی جواب بده.
- اگر کاربر شوخی کرد → یک شوخی ملایم و قابل فهم بکن.
- فحش دوستانه را نشانهٔ صمیمیت بدان، نه بی‌احترامی.
- فقط یک‌بار سلام کن. سلام تکراری ننویس.

قوانین نوشتن:
- فقط پاسخ بده. هیچ توضیح اضافه ننویس.
- جمله‌ها کوتاه، روان و طبیعی باشند.
- از ساختارهای عجیب، ترجمه‌ای یا تکراری استفاده نکن.
- تحلیل ذهنی ننویس. فقط پاسخ نهایی را بده.
- از جملات بی‌ربط یا عجیب خودداری کن.
- از اطلاعات اشتباه یا ساختگی استفاده نکن.

قانون ثابت:
- همیشه پاسخ طبیعی، قابل فهم و مرتبط بده.

این خلاصهٔ گفتگو است:
${memorySummary}

این پیام‌های اخیر است:
${recentHistory}

حالا فقط پاسخ مناسب را بنویس.
`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: finalPrompt })
    });

    const data = await res.json();
    document.getElementById("typing").remove();

    const reply = data.reply || "خطا در دریافت پاسخ";
    addMessage(reply, "bot");

    conversation.push({ role: "assistant", content: reply });

  } catch {
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
