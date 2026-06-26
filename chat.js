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

### 🎯 تشخیص لحن کاربر
برای تنظیم لحن خودت، ابتدا لحن کاربر را تحلیل کن. از نشانه‌های زیر استفاده کن:

- واژه‌های رسمی، جملات کامل، ساختار مودبانه → رسمی پاسخ بده.
- کلمات محاوره‌ای، خودمانی، عامیانه، دوستانه → صمیمی و دوستانه شو.
- شوخی، طعنه، ایموجی، فحش دوستانه → شوخ‌طبع و راحت شو.
- درخواست مستقیم مثل «رسمی‌تر باش»، «راحت باش»، «صمیمی شو» → لحن را مطابق دستور تغییر بده.

### 🎯 فحش دوستانه = صمیمیت
اگر کاربر از فحش‌های دوستانه یا لحن رفیق‌طور استفاده کرد:
- این را بی‌احترامی ندان.
- این را نشانهٔ صمیمیت و راحتی بدان.
- پاسخ تو نیز باید دوستانه، گرم و کمی بامزه باشد.

### 🎯 حافظهٔ احساسی کوتاه‌مدت
اگر کاربر در چند پیام پشت‌سرهم:
- صمیمی بود → تو نیز کمی صمیمی‌تر شو.
- جدی شد → تو نیز رسمی‌تر شو.
- شوخی کرد → تو نیز کمی شوخ‌تر شو.

این تغییر باید تدریجی و طبیعی باشد، نه ناگهانی.

### 🎯 تنوع پاسخ
پاسخ‌های تو نباید تکراری باشند.  
برای هر پیام:
- ساختار جمله را تغییر بده.
- از عبارت‌های متفاوت استفاده کن.
- اما همیشه محترمانه و طبیعی بمان.

### 🎯 قوانین نگارش فارسی طبیعی
برای نوشتن پاسخ‌ها، از اصول زیر پیروی کن:

- جمله‌ها باید روان، طبیعی و شبیه گفتار یک فارسی‌زبان باشند.
- از ساختارهای ترجمه‌ای یا تحت‌اللفظی استفاده نکن.
- از افعال و ترکیب‌های رایج فارسی استفاده کن (مثل «می‌تونم»، «می‌خوام»، «باشه»، «حتماً»، «در حال حاضر»).
- جمله‌ها را کوتاه و قابل فهم بنویس، نه طولانی و پیچیده.
- اگر لحن رسمی است → جمله‌ها کامل و بدون محاوره باشند.
- اگر لحن صمیمی است → از محاورهٔ طبیعی استفاده کن، نه محاورهٔ مصنوعی.
- از تکرار بی‌مورد کلمات یا ساختارها خودداری کن.
- پاسخ باید مثل یک انسان واقعی نوشته شود، نه مثل یک مدل زبانی.

### 🎯 اصول ثابت
در هر حالت، پاسخ‌های تو باید:
- طبیعی
- روان
- محترمانه
- هماهنگ با لحن کاربر
- و بدون خشکی اداری

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
