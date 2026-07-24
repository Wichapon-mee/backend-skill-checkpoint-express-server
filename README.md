# Quora-like Q&A API Server

REST API สำหรับระบบถาม-ตอบคำถามแบบ Quora ที่ให้ผู้ใช้สร้าง ค้นหา แก้ไข และลบคำถาม พร้อมจัดการคำตอบของแต่ละคำถามได้

---

## Project Description

โปรเจกต์นี้เป็น **Backend Skill Checkpoint** ที่พัฒนา RESTful API ด้วย Express.js เชื่อมต่อกับ PostgreSQL เพื่อจำลองฟังก์ชันหลักของแพลตฟอร์มถาม-ตอบ เช่น Quora

### ฟีเจอร์หลัก

- **Questions** — สร้าง ดู แก้ไข ลบ และค้นหาคำถาม (จากหัวข้อหรือหมวดหมู่)
- **Answers** — สร้าง ดู และลบคำตอบของแต่ละคำถาม (จำกัดความยาวไม่เกิน 300 ตัวอักษร)
- **Cascade Delete** — เมื่อลบคำถาม คำตอบที่เกี่ยวข้องจะถูกลบตามไปด้วย

### เทคโนโลยีที่ใช้

| Technology | รายละเอียด |
|------------|------------|
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [Express.js](https://expressjs.com/) | Web framework สำหรับสร้าง REST API |
| [PostgreSQL](https://www.postgresql.org/) | ฐานข้อมูล relational |
| [pg](https://node-postgres.com/) | PostgreSQL client สำหรับ Node.js |
| [Nodemon](https://nodemon.io/) | Auto-restart server ตอนพัฒนา |
| [Postman](https://www.postman.com/) | ทดสอบ API |

### ความท้าทายที่พบ

- การออกแบบ **Nested Routes** (`/questions/:questionId/answers`) ด้วย Express Router และ `mergeParams`
- การจัดลำดับ route ให้ `/search` ไม่ถูก match เป็น `:questionId`
- การ validate ข้อมูล request (เช่น คำตอบต้องไม่เกิน 300 ตัวอักษร)
- การจัดการลบข้อมูลแบบ cascade ระหว่าง `questions` และ `answers`

---

## Table of Contents

- [Project Description](#project-description)
- [Installation & Run](#installation--run)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Credits](#credits)
- [License](#license)

---

## Installation & Run

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 ขึ้นไปแนะนำ)
- [PostgreSQL](https://www.postgresql.org/download/) และ [pgAdmin](https://www.pgadmin.org/)
- [Git](https://git-scm.com/)
- [Postman](https://www.postman.com/downloads/) (สำหรับทดสอบ API)

### ขั้นตอนการติดตั้ง

**1. Clone repository**

```bash
git clone git@github.com:Wichapon-mee/backend-skill-checkpoint-express-server.git
cd backend-skill-checkpoint-express-server
```

**2. ติดตั้ง dependencies**

```bash
npm install
```

**3. ตั้งค่า Database Connection**

แก้ไข connection string ใน `utils/db.mjs` ให้ตรงกับ PostgreSQL ของคุณ:

```javascript
const connectionPool = new Pool({
  connectionString:
    "postgresql://<username>:<password>@localhost:5432/<database_name>",
});
```

**4. สร้างตารางใน pgAdmin**

ดู SQL ในหัวข้อ [Database Setup](#database-setup)

**5. รัน Server**

```bash
npm run start
```

Server จะทำงานที่ `http://localhost:4000`

**6. ทดสอบว่า Server ทำงาน**

```
GET http://localhost:4000/test
```

Response:

```json
"Server API is working 🚀"
```

---

## Database Setup

รัน SQL นี้ใน pgAdmin เพื่อสร้างตาราง:

```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  content VARCHAR(300) NOT NULL
);
```

**ตัวอย่างข้อมูลเริ่มต้น (optional):**

```sql
INSERT INTO questions (title, description, category) VALUES
  ('What is the capital of France?', 'This is a basic geography question asking about the capital city of France.', 'Geography'),
  ('What is the tallest mountain in the world?', 'This question asks about the tallest mountain on Earth.', 'Geography');
```

---

## API Endpoints

Base URL: `http://localhost:4000`

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/questions` | ดึงคำถามทั้งหมด |
| `GET` | `/questions/search?title=&category=` | ค้นหาคำถามจากหัวข้อหรือหมวดหมู่ |
| `GET` | `/questions/:questionId` | ดึงคำถามตาม ID |
| `POST` | `/questions` | สร้างคำถามใหม่ |
| `PUT` | `/questions/:questionId` | แก้ไขคำถาม |
| `DELETE` | `/questions/:questionId` | ลบคำถาม (ลบคำตอบที่เกี่ยวข้องด้วย) |

### Answers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/questions/:questionId/answers` | ดึงคำตอบของคำถาม |
| `POST` | `/questions/:questionId/answers` | สร้างคำตอบ (ไม่เกิน 300 ตัวอักษร) |
| `DELETE` | `/questions/:questionId/answers` | ลบคำตอบทั้งหมดของคำถาม |

---

## How to Use

ทดสอบ API ผ่าน **Postman** โดยตั้ง `Content-Type: application/json` สำหรับ request ที่มี body

### 1. สร้างคำถาม

```
POST http://localhost:4000/questions
```

```json
{
  "title": "What is the capital of France?",
  "description": "This is a basic geography question asking about the capital city of France.",
  "category": "Geography"
}
```

### 2. ดึงคำถามทั้งหมด

```
GET http://localhost:4000/questions
```

### 3. ค้นหาคำถาม

```
GET http://localhost:4000/questions/search?title=France
GET http://localhost:4000/questions/search?category=Geography
```

### 4. สร้างคำตอบ

```
POST http://localhost:4000/questions/1/answers
```

```json
{
  "content": "The capital of France is Paris."
}
```

### 5. ดูคำตอบของคำถาม

```
GET http://localhost:4000/questions/1/answers
```

### 6. แก้ไขคำถาม

```
PUT http://localhost:4000/questions/1
```

```json
{
  "title": "What is the capital of Germany?",
  "description": "Updated question asking about the capital city of Germany.",
  "category": "Geography"
}
```

### 7. ลบคำตอบทั้งหมดของคำถาม

```
DELETE http://localhost:4000/questions/1/answers
```

### 8. ลบคำถาม

```
DELETE http://localhost:4000/questions/1
```

> **หมายเหตุ:** เมื่อลบคำถาม คำตอบที่เชื่อมกับคำถามนั้นจะถูกลบออกจากฐานข้อมูลด้วย

### Screenshots

> แนบภาพหน้าจอจาก Postman ตรงนี้หลังทดสอบ API สำเร็จ เช่น:
>
> - GET `/questions` — แสดงรายการคำถามทั้งหมด
> - POST `/questions` — สร้างคำถามสำเร็จ (201)
> - GET `/questions/search?category=Geography` — ผลการค้นหา
> - POST `/questions/1/answers` — สร้างคำตอบสำเร็จ
> - GET `/questions/1/answers` — แสดงคำตอบของคำถาม

<!-- ตัวอย่างการใส่รูป:
![GET All Questions](./screenshots/get-questions.png)
![Create Answer](./screenshots/create-answer.png)
-->

---

## Project Structure

```
backend-skill-checkpoint-express-server/
├── app.mjs                 # Entry point, Express app setup
├── routes/
│   ├── questions.mjs       # Question routes (CRUD + search)
│   └── answers.mjs         # Answer routes (nested under questions)
├── utils/
│   └── db.mjs              # PostgreSQL connection pool
├── package.json
├── .gitignore
└── README.md
```

---

## Credits

- **Developer:** [Wichapon-mee](https://github.com/Wichapon-mee)
- **Repository:** [backend-skill-checkpoint-express-server](https://github.com/Wichapon-mee/backend-skill-checkpoint-express-server)
- **Course:** TechUp Backend Skill Checkpoint
- **References:**
  - [Express.js Documentation](https://expressjs.com/)
  - [node-postgres (pg) Documentation](https://node-postgres.com/)
  - [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## License

This project is licensed under the **ISC License**.

See [package.json](./package.json) for details.
