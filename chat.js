const input = document.getElementById("userInput");
const chatBox = document.getElementById("messages");

// ⭐ حافظهٔ مکالمه
let conversation = [];

// ⭐ خلاصهٔ بلندمدت
let memorySummary = "";

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

  // ⭐ اگر تاریخچه زیاد شد → خلاصه‌سازی
  if (conversation.length > 10) {
    const historyText = conversation
      .map(msg => (msg.role === "user" ? "کاربر: " : "دستیار: ") + msg.content)
      .join("\n");

    const summaryPrompt = `
    این تاریخچهٔ گفتگو را خلاصه کن و فقط نکات مهم را نگه دار:
    ${historyText}

    خلاصه را کوتاه، دقیق و فقط شامل اطلاعات مهم بنویس.
    `;

    try {
      const summaryResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: summaryPrompt })
      });

      const summaryData = await summaryResponse.json();

      // ⭐ ذخیرهٔ خلاصه
      memorySummary = summaryData.reply || memorySummary;

      // ⭐ پاک کردن تاریخچه و شروع دوباره
      conversation = [];
    } catch (e) {
      console.log("خطا در خلاصه‌سازی");
    }
  }

  // ⭐ ساختن پیام نهایی شامل شخصیت + خلاصه + پیام‌های اخیر
  const recentHistory = conversation
    .map(msg => (msg.role === "user" ? "کاربر: " : "دستیار: ") + msg.content)
    .join("\n");

  const finalPrompt = `
تو یک دستیار هوشمند فارسی‌زبان هستی.
لحن پیش‌فرض تو محترمانه و مودب است، اما خشک و اداری نیست.
تو لهجه نداری.

برای تنظیم لحن خودت، ابتدا لحن کاربر را تحلیل کن. از نشانه‌های زیر برای تشخیص لحن کاربر استفاده کن:

- اگر کاربر از واژه‌های رسمی، جملات کامل، ساختار مودبانه و بدون کلمات محاوره‌ای استفاده کرد → رسمی پاسخ بده.
- اگر کاربر از کلمات محاوره‌ای، خودمانی، عامیانه یا دوستانه استفاده کرد → تو نیز به همان اندازه صمیمی و دوستانه شو.
- اگر کاربر از کلمات طنز، فحش دوستانه، شوخی، ایموجی یا لحن بامزه استفاده کرد → تو نیز در حد مناسب شوخی کن.
- اگر کاربر لحن را تغییر داد (مثلاً گفت «رسمی‌تر باش»، «راحت باش»، «صمیمی شو») → لحن خودت را مطابق درخواست او تغییر بده.

در هر حالت، پاسخ‌های تو باید:
- طبیعی
- روان
- محترمانه
- و هماهنگ با لحن کاربر

باشند.

این خلاصهٔ حافظهٔ بلندمدت گفتگو است:
${memorySummary}

این هم پیام‌های اخیر گفتگو:
${recentHistory}

حالا بر اساس این دو، ادامهٔ گفتگو را طبیعی، دقیق و مطابق لحن مناسب پاسخ بده.
`;

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
