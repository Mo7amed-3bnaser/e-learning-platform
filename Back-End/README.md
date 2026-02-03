# 🚀 E-Learning Platform - Backend API

Backend API لمنصة الكورسات التعليمية المحمية

## 📚 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, Bcrypt
- **File Upload:** Cloudinary (Images)
- **Video Hosting:** Bunny.net Stream

## 🛠️ Installation

### 1. تثبيت Dependencies

```bash
npm install
```

### 2. إعداد Environment Variables

انسخ ملف `.env.example` وسميه `.env` وعدل القيم:

```bash
cp .env.example .env
```

أهم المتغيرات:
- `MONGODB_URI`: رابط قاعدة البيانات
- `JWT_SECRET`: مفتاح التشفير (غيره للأمان!)
- `CLOUDINARY_*`: بيانات Cloudinary للصور
- `CLIENT_URL`: رابط الفرونت إند

### 3. تشغيل MongoDB

تأكد إن MongoDB شغال:

```bash
# لو Local
mongod

# أو استخدم MongoDB Atlas (Cloud)
```

### 4. تشغيل السيرفر

```bash
# Development mode (مع Auto-restart)
npm run dev

# Production mode
npm start
```

السيرفر هيشتغل على: `http://localhost:5000`

## 📂 Project Structure

```
Back-End/
├── config/           # الإعدادات (Database, Cloudinary)
├── controllers/      # المنطق الرئيسي لكل API
├── middleware/       # Authentication & Error Handling
├── models/          # Mongoose Schemas (User, Course, Video, Order)
├── routes/          # API Routes
├── utils/           # Helper Functions
├── .env             # المتغيرات السرية
├── server.js        # نقطة البداية
└── package.json
```

## 🔗 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | الوصف | Access |
|--------|----------|-------|--------|
| POST | `/register` | تسجيل مستخدم جديد | Public |
| POST | `/login` | تسجيل الدخول | Public |
| GET | `/me` | بيانات المستخدم الحالي | Private |
| PUT | `/profile` | تحديث البيانات | Private |

### 📚 Courses (`/api/courses`)

| Method | Endpoint | الوصف | Access |
|--------|----------|-------|--------|
| GET | `/` | كل الكورسات المنشورة | Public |
| GET | `/:id` | تفاصيل كورس | Public |
| POST | `/` | إنشاء كورس جديد | Admin |
| PUT | `/:id` | تحديث كورس | Admin |
| DELETE | `/:id` | حذف كورس | Admin |
| PATCH | `/:id/publish` | نشر/إخفاء كورس | Admin |

### 🎥 Videos (`/api/videos`)

| Method | Endpoint | الوصف | Access |
|--------|----------|-------|--------|
| GET | `/:courseId` | فيديوهات كورس | Private (Enrolled) |
| GET | `/watch/:videoId` | فيديو واحد | Private (Enrolled) |
| POST | `/` | إضافة فيديو | Admin |
| PUT | `/:id` | تحديث فيديو | Admin |
| DELETE | `/:id` | حذف فيديو | Admin |

### 💳 Orders (`/api/orders`)

| Method | Endpoint | الوصف | Access |
|--------|----------|-------|--------|
| POST | `/` | إنشاء طلب شراء | Private |
| GET | `/my-orders` | طلباتي | Private |
| GET | `/` | كل الطلبات | Admin |
| GET | `/pending` | الطلبات المعلقة | Admin |
| PATCH | `/:id/approve` | الموافقة على طلب | Admin |
| PATCH | `/:id/reject` | رفض طلب | Admin |
| DELETE | `/:id` | حذف طلب | Admin |

### 👨‍💼 Admin (`/api/admin`)

| Method | Endpoint | الوصف | Access |
|--------|----------|-------|--------|
| GET | `/stats` | إحصائيات الداشبورد | Admin |
| GET | `/students` | كل الطلاب | Admin |
| GET | `/students/search?q=` | البحث عن طالب | Admin |
| PATCH | `/students/:id/block` | حظر/إلغاء حظر | Admin |
| DELETE | `/students/:id` | حذف طالب | Admin |

### 📤 Upload (`/api/upload`)

| Method | Endpoint | الوصف | Access |
|--------|----------|-------|--------|
| POST | `/image` | رفع صورة واحدة | Private |
| POST | `/images` | رفع عدة صور | Private |

## 🔒 Authentication Flow

1. المستخدم يسجل/يدخل
2. الباك إند يرجع JWT Token فيه: `id, name, phone, role`
3. الفرونت يحفظ التوكن في localStorage
4. كل طلب محمي يبعت التوكن في الـ Header:
   ```
   Authorization: Bearer <token>
   ```

## 📋 Response Format (الدستور)

### ✅ Success Response
```json
{
  "success": true,
  "message": "تم بنجاح",
  "data": { ... }
}
```

### ❌ Error Response
```json
{
  "success": false,
  "message": "رسالة الخطأ",
  "errorCode": "ERROR_CODE"
}
```

## 🛡️ Security Features

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Helmet (HTTP Security Headers)
- ✅ CORS Protection
- ✅ Role-based Access Control (Student/Admin)
- ✅ User Blocking System
- ✅ Enrollment Verification للفيديوهات

## 🧪 Testing APIs

استخدم **Postman** أو **Thunder Client** في VS Code:

1. سجل مستخدم جديد: `POST /api/auth/register`
2. خد التوكن من الـ Response
3. حطه في Headers لباقي الطلبات

## 📝 Database Models

### User
- name, email, phone, password
- role: student/admin
- enrolledCourses: [CourseId]
- isBlocked: Boolean

### Course
- title, description, price, thumbnail
- instructor: {name, bio, avatar}
- category, level, isPublished
- enrolledStudents, rating

### Video
- courseId, title, description
- bunnyVideoId (مهم!)
- duration, order
- isFreePreview

### Order
- userId, courseId
- paymentMethod, screenshotUrl
- status: pending/approved/rejected
- price, rejectionReason

