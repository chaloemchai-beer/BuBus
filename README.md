# Bangkok University Campus Transport Map

แผนที่ระบบขนส่งภายในมหาวิทยาลัยกรุงเทพ (Bangkok University) ที่แสดงเส้นทางรถบัสภายใน campus สถานที่สำคัญ และตารางเวลารถ พร้อมสถานะบริการแบบเรียลไทม์

---

## 🚌 Features

- แสดง **แผนที่มหาวิทยาลัย** พร้อม marker ของสถานที่ต่าง ๆ
  - อาคารเรียน, ร้านค้า, สิ่งอำนวยความสะดวก
- ระบบ **Bus Tracker** แบบเรียลไทม์
  - รถบัสวนรอบ campus ตามเส้นทางที่กำหนด
  - ความถี่เดินรถ 15 นาที, เวลาเดินทางเฉลี่ย 3 นาที/ป้าย
- แสดง **สถานะบริการ**
  - กำลังเดินทาง (Operating)
  - ปิดบริการ (Outside operating hours)
  - กำลังปรับปรุง (Maintenance)
- รองรับ **Geolocation**
  - แสดงตำแหน่งผู้ใช้งานบนแผนที่
- **Route Planner**
  - วางแผนเส้นทางจากจุดเริ่มต้นไปจุดหมาย
  - แสดงเวลารถคันต่อไป, เวลาเดินทาง, และเวลาถึงจุดหมาย
- **Bus Schedule**
  - ตารางเวลารถบัสแบบเรียลไทม์
  - ไฮไลต์คันต่อไปและสถานะ

---

## 📦 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons
- **Mapping:** Leaflet
- **State Management:** React Hooks
- **Animation & Styling:** CSS, Tailwind, DivIcon สำหรับ marker
- **Browser APIs:** Geolocation

---

## ⚡ Installation

1. Clone repository

```bash
git clone https://github.com/chaloemchai-beer/BuBus.git
cd BuBus
```

1. ติดตั้ง dependencies

```bash
npm install
```

3. รันโปรเจกต์

```bash
npm run start
```

เปิดเว็บที่ http://localhost:3000 (ค่า default ของ react)

## Configuration

- เวลาทำงานรถบัส: 08:00 - 18:00

- เวลาปรับปรุง: ตั้งค่าในโค้ด

```bash
const maintenanceStart = new Date();
maintenanceStart.setHours(20, 48, 0, 0); // เวลาเริ่ม
const maintenanceEnd = new Date(maintenanceStart.getTime() + 60*60000); // +1 ชั่วโมง
```

## 📝 Usage

- เลือก จุดเริ่มต้น และ จุดหมาย เพื่อวางแผนเส้นทาง

- กด ตำแหน่งปัจจุบัน เพื่อให้แผนที่โฟกัสไปยังผู้ใช้งาน

- ดู Bus Status และ Bus Schedule แบบเรียลไทม์

- คลิก สถานที่บนแผนที่ เพื่อดูรายละเอียด
