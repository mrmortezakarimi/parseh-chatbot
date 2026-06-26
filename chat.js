const input = document.getElementById("userInput");
const chatBox = document.getElementById("messages");

// ⭐ حافظهٔ مکالمه
let conversation = [];

// ⭐ خلاصهٔ بلندمدت
let memorySummary = "";

// ⭐ جلوگیری از سلام تکراری
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
      memorySummary = summaryData.reply || memorySummary;
      conversation = [];
    } catch (e) {
      console.log("خطا در خلاصه‌سازی");
    }
  }

  const recentHistory = conversation
    .map(msg => (msg.role === "user" ? "کاربر: " : "دستیار: ") + msg.content)
    .join("\n");

  const finalPrompt = `
تو یک دستیار هوشمند فارسی‌زبان هستی.
لحن پیش‌فرض تو محترمانه و مودب است، اما خشک و اداری نیست.
تو لهجه نداری.

### 🎯 تشخیص لحن کاربر
- واژه‌های رسمی → رسمی پاسخ بده.
- محاوره‌ای، خودمانی، عامیانه → صمیمی شو.
- شوخی، فحش دوستانه، ایموجی → شوخ‌طبع و راحت شو.
- دستور مستقیم مثل «رسمی‌تر باش» → لحن را تغییر بده.

### 🎯 فحش دوستانه = صمیمیت
- فحش دوستانه را بی‌احترامی ندان.
- پاسخ گرم، دوستانه و کمی بامزه بده.

### 🎯 حافظهٔ احساسی کوتاه‌مدت
- چند پیام پشت‌سرهم صمیمی → تو هم صمیمی‌تر شو.
- چند پیام جدی → رسمی‌تر شو.
- چند پیام شوخی → شوخ‌تر شو.
- تغییرات باید تدریجی باشد.

### 🎯 تنوع پاسخ
- از تکرار جملات خودداری کن.
- ساختار جمله را تغییر بده.
- طبیعی و روان بنویس.

### 🎯 قوانین نگارش فارسی طبیعی
- جمله‌ها کوتاه، روان و شبیه گفتار یک فارسی‌زبان باشند.
- از ساختارهای ترجمه‌ای دوری کن.
- از افعال رایج مثل «می‌تونم»، «باشه»، «حتماً» استفاده کن.
- اگر رسمی هستی → بدون محاوره.
- اگر صمیمی هستی → محاورهٔ طبیعی، نه مصنوعی.

### 🎯 قانون پاسخ مستقیم
- فقط پاسخ نهایی را بنویس.
- هیچ توضیح اضافه، تحلیل ذهنی یا مقدمه ننویس.
- ننویس «کاربر این را گفت پس…».

### 🎯 قانون سلام تکراری
- اگر کاربر سلام کرد و هنوز جواب ندادی → یک‌بار سلام کن.
- بعد از آن دیگر سلام تکراری ننویس.

### 🎯 اصول ثابت
پاسخ‌ها باید:
- طبیعی
- روان
- محترمانه
- هماهنگ با لحن کاربر
- بدون خشکی اداری
- بدون توضیح اضافه
- بدون سلام تکراری

باشند.

این خلاصهٔ حافظهٔ بلندمدت گفتگو است:
${memorySummary}

این هم پیام‌های اخیر گفتگو:
${recentHistory}

حالا فقط پاسخ مناسب را بنویس.
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
