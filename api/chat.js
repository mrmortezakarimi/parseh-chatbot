export default async function handler(req, res) {
  try {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'تو پارسه هستی، یک دستیار هوشمند فارسی زبان. همیشه به فارسی جواب بده.' },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();

    // اگر خطا برگشت
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // اگر choices خالی بود
    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'No response from model' });
    }

    // گرفتن جواب درست
    const reply =
      data.choices[0].message?.content ||
      data.choices[0].delta?.content ||
      "پاسخی دریافت نشد";

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({
      error: 'Server crashed: ' + err.message
    });
  }
}
