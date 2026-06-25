export default async function handler(req, res) {
  try {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST allowed" });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    // Call Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "تو پارسه هستی، یک دستیار هوشمند فارسی زبان. همیشه به فارسی جواب بده.",
            },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const data = await response.json();

    // Debug log (برای اطمینان)
    console.log("GROQ RAW RESPONSE:", data);

    // اگر خطا برگشت
    if (data.error) {
      return res.status(500).json({
        reply: "خطا از سمت مدل: " + data.error.message,
      });
    }

    // استخراج جواب از چند حالت مختلف
    const reply =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.delta?.content ||
      data.choices?.[0]?.text ||
      "پاسخی دریافت نشد";

    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({
      reply: "خطای سرور: " + err.message,
    });
  }
}
