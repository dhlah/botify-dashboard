# Panduan Instalasi - Botify Dashboard MySQL

## Langkah 1: Install Dependencies

```bash
npm install
```

Dependencies yang akan diinstall:
- **express** - Web server framework
- **aedes** - MQTT broker
- **mqtt** - MQTT client library
- **axios** - HTTP client (untuk Telegram API)
- **dotenv** - Environment variables manager
- **body-parser** - Request body parser
- **mysql2** - MySQL driver dengan promise support
- **uuid** - Unique ID generator
- **nodemon** - Development auto-restart (dev dependency)

## Langkah 2: Setup Database

### Option A: Gunakan MySQL CLI (Windows PowerShell)

**Method 1 - Menggunakan file input:**
```powershell
Get-Content db/schema.sql | mysql -h database.alstore.space -u u6527_zVkySMZPhN -p s6527_tetew
# Ketik password: fWOZT^nKKcFZTPg@hB=XdIdv
```

**Method 2 - Manual di MySQL client:**
```powershell
# Buka MySQL client
mysql -h database.alstore.space -u u6527_zVkySMZPhN -p s6527_tetew

# Di MySQL prompt, jalankan:
SOURCE db/schema.sql;
```

**Method 3 - Copy-paste script (paling mudah):**
1. Buka file `db/schema.sql` dengan text editor
2. Copy seluruh isi file
3. Buka MySQL client: `mysql -h database.alstore.space -u u6527_zVkySMZPhN -p s6527_tetew`
4. Paste seluruh script di MySQL prompt
5. Tekan Enter

### Option B: Gunakan Database GUI (MySQL Workbench, DBeaver, etc)
1. Buat connection ke `database.alstore.space:3306`
2. Login dengan user `u6527_zVkySMZPhN`
3. Pilih database `s6527_tetew`
4. Buka file `db/schema.sql` di GUI
5. Execute semua query

## Langkah 3: Konfigurasi Environment (.env)

File `.env` sudah ada, tapi verifikasi konfigurasinya:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MQTT Aedes Configuration
MQTT_PORT=1883
MQTT_HOST=0.0.0.0

# MySQL Database Configuration
DB_HOST=database.alstore.space
DB_USER=u6527_zVkySMZPhN
DB_PASSWORD=fWOZT^nKKcFZTPg@hB=XdIdv
DB_NAME=s6527_tetew
DB_PORT=3306

# Telegram Configuration
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE

# Voltage Configuration (in volts)
VOLTAGE_THRESHOLD=5.0
CHECK_INTERVAL=5000
```

**PENTING**: Ganti `YOUR_BOT_TOKEN_HERE` dan `YOUR_CHAT_ID_HERE` dengan token Telegram bot Anda.

### Cara Mendapatkan Telegram Bot Token:
1. Chat dengan [@BotFather](https://t.me/botfather) di Telegram
2. Kirim `/newbot`
3. Ikuti instruksi untuk membuat bot
4. Copy token yang diberikan ke `.env`

### Cara Mendapatkan Telegram Chat ID:
1. Chat bot Anda dan kirim `/start`
2. Kunjungi `https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates`
3. Ganti `{YOUR_TOKEN}` dengan token bot Anda
4. Cari nilai `"id"` di field `"chat"`
5. Copy ke `.env`

## Langkah 4: Jalankan Aplikasi

### Development Mode (dengan auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

## Langkah 5: Verifikasi Setup

1. Buka browser: `http://localhost:3000`
2. Anda seharusnya melihat dashboard
3. Cek console untuk messages:
   - "MySQL Database connected successfully"
   - "MQTT Broker listening on 0.0.0.0:1883"
   - "Express server running on http://localhost:3000"

## Test MQTT Connection

Gunakan MQTT client (contoh: MQTT.fx, Mosquitto) untuk test:

```
Broker: localhost
Port: 1883
Topic: esp32/voltage/test-device
Payload: {"voltage": 4.85}
```

Jika voltage > threshold, Anda akan menerima notifikasi Telegram.

### Contoh test dengan PowerShell:

Jika sudah install mosquitto-clients, gunakan:
```powershell
# Test subscribe
mosquitto_sub -h localhost -p 1883 -t "device/+/voltage"

# Di terminal lain, publish
mosquitto_pub -h localhost -p 1883 -t "esp32/voltage/test-device" -m '{"voltage": 5.5}'
```

## Struktur File Penting

```
src/
├── server.js              # Entry point
├── utils/
│   ├── db.js             # MySQL connection pool
│   └── database.js       # Database operations (CRUD)
├── mqtt/
│   └── handler.js        # MQTT message handler
├── routes/
│   └── api.js            # API endpoints
└── services/
    └── telegram.js       # Telegram bot integration

db/
└── schema.sql            # Database schema

public/
├── index.html            # Dashboard UI
├── app.js                # Frontend JavaScript
└── styles.css            # Styling
```

## Troubleshooting

### Error: "connect ECONNREFUSED"
**Solusi:** Database tidak terhubung
- Pastikan MySQL server running
- Verifikasi konfigurasi `.env`
- Test koneksi dengan tool seperti MySQL Workbench

### Error: "PROTOCOL_SEQUENCE_TIMEOUT"
**Solusi:** Connection pool timeout
- Pastikan database tidak penuh (cek max connections)
- Restart aplikasi

### Error: "Socket hang up"
**Solusi:** Koneksi MQTT bermasalah
- Pastikan port 1883 tidak diblokir firewall
- Restart MQTT broker

### Telegram notification tidak terkirim
**Solusi:** 
- Verifikasi `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID`
- Pastikan bot sudah di-add ke chat
- Cek API Telegram di browser

## Production Deployment

Untuk production, gunakan process manager seperti PM2:

```bash
# Install PM2
npm install -g pm2

# Start aplikasi
pm2 start src/server.js --name "botify-dashboard"

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

## Next Steps

1. ✅ Setup database dengan `db/schema.sql`
2. ✅ Konfigurasi `.env`
3. ✅ Install dependencies
4. ✅ Jalankan aplikasi
5. Test dashboard di `http://localhost:3000`
6. Setup ESP32 untuk publish MQTT messages
7. Monitor voltage dari web interface
8. Receive Telegram alerts saat threshold terlampaui
