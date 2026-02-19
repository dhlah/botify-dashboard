# Device Logs Dashboard - Panduan Fitur

## Ringkasan Perbaikan

Sistem dashboard telah diperbaiki dengan fitur-fitur berikut:

### 1. **Real-time Updates** 🔄
- Ketika device mengirim data baru via MQTT, tabel logs akan **otomatis terupdate** dalam real-time
- Menggunakan **Socket.IO** untuk komunikasi real-time antara server dan client
- Data baru akan muncul di posisi teratas tabel tanpa perlu refresh halaman

### 2. **Time-Range Filtering** ⏰
Pengguna dapat memfilter log data berdasarkan rentang waktu:
- **10 Menit** - Melihat log 10 menit terakhir
- **1 Jam** - Melihat log 1 jam terakhir (default)
- **1 Hari** - Melihat log 24 jam terakhir
- **1 Bulan** - Melihat log 30 hari terakhir
- **1 Tahun** - Melihat log 365 hari terakhir
- **Custom** - Memilih rentang waktu custom dengan input tanggal dan waktu

### 3. **Data Pagination** 📊
Pengguna dapat memilih jumlah records yang tampil:
- Opsi: 10, 25, 50, atau maksimal 100 records
- Dapat diubah kapan saja dengan dropdown selector

### 4. **Summary Tab** 📈
Tab khusus yang menampilkan statistik ringkas device:

**Informasi On (Menyala - Status 1):**
- Jumlah komunikasi dengan status ON
- Persentase ON dari total komunikasi
- Total durasi device menyala (dalam menit)

**Informasi Off (Mati - Status 0):**
- Jumlah komunikasi dengan status OFF
- Persentase OFF dari total komunikasi
- Total durasi device mati (dalam menit)

**Statistik Overall:**
- Total Records: Jumlah total data yang dianalisis
- Uptime %: Persentase device menyala
- Downtime %: Persentase device mati

### 5. **Peningkatan UI/UX** ✨
- Desain modern dengan Tailwind CSS
- Tab navigation untuk switching antara Logs dan Summary
- Responsive design (mobile-friendly)
- Loading indicator untuk feedback user
- Empty state message ketika tidak ada data
- Color-coded status (Hijau untuk ON, Merah untuk OFF)
- Number counter untuk setiap row log

## Cara Penggunaan

### Mengakses Halaman Logs
```
http://your-server:PORT/device/{deviceId}/logs
```

### Memfilter Log Data
1. Pilih button rentang waktu (10m, 1h, 1d, 1month, 1year)
2. Atau pilih "Custom" dan input tanggal awal dan akhir
3. Klik tombol "Terapkan" untuk custom range
4. Tabel akan otomatis terupdate

### Mengubah Jumlah Records
1. Gunakan dropdown "Jumlah Records"
2. Pilih: 10, 25, 50, atau 100
3. Data akan otomatis terupdate

### Melihat Summary/Statistik
1. Klik tab "📈 Summary"
2. Pilih rentang waktu (1 Jam, 1 Hari, 1 Bulan, 1 Tahun)
3. Lihat statistik lengkap device status

### Real-time Updates
- Dashboard akan otomatis menampilkan log baru ketika device mengirim pesan MQTT
- Tidak perlu manual refresh untuk melihat data terbaru

## Fitur Technical

### Backend Endpoints

#### Get Logs dengan Time Range Filter
```
GET /api/device/{deviceId}/logs?timeRange={range}&limit={limit}&startDate={start}&endDate={end}

Parameters:
- timeRange: '10m', '1h', '1d', '1month', '1year', 'custom'
- limit: 1-100 (opsional, default: 100)
- startDate: YYYY-MM-DD HH:MM:SS (untuk custom range)
- endDate: YYYY-MM-DD HH:MM:SS (untuk custom range)

Response:
{
  "success": true,
  "deviceId": "device-123",
  "timeRange": "1h",
  "limit": 100,
  "logs": [
    {
      "id": "uuid",
      "device_id": "device-123",
      "value": 1,
      "timestamp": "2024-02-17 10:30:00"
    },
    ...
  ]
}
```

#### Get Summary Statistics
```
GET /api/device/{deviceId}/summary?timeRange={range}&startDate={start}&endDate={end}

Parameters:
- timeRange: '10m', '1h', '1d', '1month', '1year', 'custom'
- startDate: YYYY-MM-DD HH:MM:SS (optional)
- endDate: YYYY-MM-DD HH:MM:SS (optional)

Response:
{
  "success": true,
  "deviceId": "device-123",
  "timeRange": "1h",
  "summary": {
    "totalRecords": 150,
    "onCount": 90,
    "offCount": 60,
    "onPercentage": 60.00,
    "offPercentage": 40.00,
    "totalOnDuration": 3600,        // dalam detik
    "totalOffDuration": 2400,       // dalam detik
    "totalOnDurationMinutes": "60.00",
    "totalOffDurationMinutes": "40.00"
  }
}
```

### Socket.IO Events

#### Join Device Logs Room
```javascript
socket.emit('join-device-logs', deviceId);
```

#### New Log Received (Real-time)
```javascript
socket.on(`${deviceId}/new-log`, function(data) {
  console.log('New log:', data);
  // data.value: 0 atau 1
  // data.timestamp: ISO timestamp
});
```

#### Leave Device Logs Room
```javascript
socket.emit('leave-device-logs', deviceId);
```

## Data Values Explanation

Sistem hanya menggunakan 2 nilai untuk status device:
- **1** = Device ON/Menyala
- **0** = Device OFF/Mati

Setiap kali device mengirim MQTT message dengan format JSON:
```json
{
  "switch": 1
}
```

Data akan disimpan ke database dan langsung terupdate di dashboard secara real-time.

## Database Schema

```sql
-- Table: device_values
CREATE TABLE device_values (
  id CHAR(36) PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  value TINYINT NOT NULL,        -- 0 atau 1
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id)
);
```

## Perubahan File

### File yang Dibuat:
1. **src/functions/get-log-value-device-by-range.js**
   - Fungsi untuk query logs dengan time range
   - Fungsi untuk menghitung summary statistics

### File yang Diupdate:
1. **src/server.js**
   - Tambah middleware: bodyParser, express.static
   - Tambah Socket.IO room support untuk logs
   
2. **src/routes/deviceRoutes.js**
   - Tambah endpoint `/api/device/:id/logs` (JSON API)
   - Tambah endpoint `/api/device/:id/summary` (JSON API)
   - Update route `/device/:id/logs` dengan time range support

3. **src/broker.js**
   - Tambah emit untuk Socket.IO logs room
   - Kirim event `${deviceId}/new-log` ke semua clients yang join logs room

4. **src/views/device-logs.ejs**
   - Complete redesign dengan tab navigation
   - Tambah time-range filter UI
   - Tambah summary tab dengan statistik
   - Tambah real-time update handling
   - Improved responsive design

## Troubleshooting

### Data tidak terupdate real-time
- Pastikan client terhubung ke Socket.IO room dengan benar
- Check browser console untuk error messages
- Pastikan device mengirim MQTT message ke topic yang benar

### Summary tidak menampilkan data
- Pastikan database memiliki cukup data untuk periode yang dipilih
- Check network request di browser DevTools
- Pastikan database connection berfungsi normal

### Logs table kosong
- Pilih rentang waktu yang lebih panjang
- Pastikan device sudah mengirim data dalam rentang waktu tersebut
- Click tombol "Refresh" untuk reload data

## Future Improvements

Fitur yang bisa ditambahkan di masa depan:
- Export log data ke CSV/Excel
- Chart visualization untuk trend analysis
- Alert notifications ketika device status berubah
- Data retention policy untuk old logs
- Advanced filtering dan sorting
- User authentication dan authorization
