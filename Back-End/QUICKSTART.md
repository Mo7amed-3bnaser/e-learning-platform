# 🎯 دليل البداية السريعة

## ✅ تم إنشاء البنية الأساسية بنجاح!

### 📋 ما تم إنجازه:

1. ✅ **إعداد السيرفر الأساسي**
   - Express.js مع Helmet & CORS
   - Error Handling Middleware
   - Database Connection Setup

2. ✅ **Database Models (Mongoose)**
   - User Model (مع تشفير الباسورد)
   - Course Model
   - Video Model
   - Order Model

3. ✅ **نظام Authentication كامل**
   - Register & Login
   - JWT Token (يحتوي على: id, name, phone, role)
   - Protected Routes
   - Admin Middleware

4. ✅ **Course Management APIs**
   - CRUD للكورسات
   - Publish/Unpublish
   - تفاصيل الكورس مع التحقق من enrollment

5. ✅ **Video Management APIs**
   - إضافة وإدارة الفيديوهات
   - حماية الفيديوهات (Enrolled Students فقط)
   - Free Preview Support

6. ✅ **Order System (الدفع اليدوي)**
   - إنشاء طلب شراء
   - الموافقة/الرفض (Admin)
   - إضافة الكورس أوتوماتيكياً عند الموافقة

7. ✅ **Admin Dashboard APIs**
   - إحصائيات شاملة
   - إدارة الطلاب (Block/Unblock)
   - البحث عن طلاب

8. ✅ **Upload System**
   - رفع الصور على Cloudinary
   - دعم Single & Multiple Images

9. ✅ **Validation Middleware**
   - Express Validator لجميع الـ inputs
   - رسائل خطأ عربية واضحة

---

## 🚀 الخطوات التالية

### 1. تشغيل MongoDB

#### لو Local:
```bash
mongod
```

#### لو MongoDB Atlas (Cloud):
1. سجل على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. اعمل Cluster مجاني
3. خد Connection String وحطه في `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elearning
```

### 2. إنشاء أول Admin

```bash
npm run create-admin
```

📧 **Email:** admin@elearning.com  
🔑 **Password:** 123456

⚠️ غير كلمة المرور بعد أول تسجيل دخول!

### 3. إعداد Cloudinary

1. سجل على [Cloudinary](https://cloudinary.com/)
2. خد البيانات من Dashboard وحطها في `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. إعداد Bunny.net (للفيديوهات)

1. سجل على [Bunny.net Stream](https://bunny.net/stream/)
2. اعمل Library جديدة
3. خد البيانات وحطها في `.env`:
```
BUNNY_API_KEY=your_api_key
BUNNY_LIBRARY_ID=your_library_id
BUNNY_STREAM_URL=https://your-url.b-cdn.net
```

---

## 🧪 اختبار الـ API

استخدم Postman أو Thunder Client:

### 1. تسجيل الدخول (Admin)

**POST** `http://localhost:5000/api/auth/login`

```json
{
  "email": "admin@elearning.com",
  "password": "123456"
}
```

### 2. إنشاء كورس

**POST** `http://localhost:5000/api/courses`

Headers:
```
Authorization: Bearer YOUR_TOKEN
```

Body:
```json
{
  "title": "كورس JavaScript كامل",
  "description": "تعلم JavaScript من الصفر للاحتراف",
  "price": 250,
  "thumbnail": "https://via.placeholder.com/400",
  "instructor": {
    "name": "مستر كود"
  },
  "category": "programming",
  "level": "beginner"
}
```

**اقرأ ملف `TESTING.md` لسيناريوهات اختبار كاملة!**

---

## 📁 هيكل المشروع

```
Back-End/
├── config/              # إعدادات (Database, Cloudinary)
├── controllers/         # منطق الـ APIs
├── middleware/          # Authentication, Validation, Errors
├── models/             # Mongoose Schemas
├── routes/             # API Routes
├── scripts/            # Scripts مساعدة (createAdmin)
├── utils/              # Helper Functions
├── .env                # المتغيرات السرية
├── server.js           # نقطة البداية
└── package.json
```

---

## 🔗 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - تسجيل
- `POST /api/auth/login` - دخول
- `GET /api/auth/me` - بياناتي
- `PUT /api/auth/profile` - تحديث البيانات

### Courses
- `GET /api/courses` - كل الكورسات
- `GET /api/courses/:id` - تفاصيل كورس
- `POST /api/courses` - إنشاء كورس (Admin)
- `PUT /api/courses/:id` - تحديث (Admin)
- `DELETE /api/courses/:id` - حذف (Admin)

### Videos
- `GET /api/videos/:courseId` - فيديوهات كورس
- `POST /api/videos` - إضافة فيديو (Admin)
- `DELETE /api/videos/:id` - حذف (Admin)

### Orders
- `POST /api/orders` - إنشاء طلب
- `GET /api/orders/my-orders` - طلباتي
- `GET /api/orders/pending` - المعلقة (Admin)
- `PATCH /api/orders/:id/approve` - موافقة (Admin)
- `PATCH /api/orders/:id/reject` - رفض (Admin)

### Admin
- `GET /api/admin/stats` - إحصائيات
- `GET /api/admin/students` - الطلاب
- `PATCH /api/admin/students/:id/block` - حظر

### Upload
- `POST /api/upload/image` - رفع صورة

---

## 🤝 التنسيق مع الفرونت إند

### الـ Token في JWT يحتوي على:
```javascript
{
  id: "user_id",
  name: "اسم الطالب",    // للعلامة المائية
  phone: "01012345678",    // للعلامة المائية
  role: "student" // or "admin"
}
```

### كل Response بالشكل ده:

**Success:**
```json
{
  "success": true,
  "message": "نجح",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "فشل",
  "errorCode": "CODE"
}
```

---

## 🛡️ نقاط الحماية

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Role-based Access (Student/Admin)
- ✅ Enrollment Verification
- ✅ Helmet Security Headers
- ✅ CORS Protection
- ✅ Input Validation
- ✅ User Blocking System

---

## 🚨 مهم للإنتاج (Production)

قبل ما ترفع المشروع على السيرفر:

1. ✅ غير `JWT_SECRET` في `.env`
2. ✅ غير بيانات الأدمن الافتراضي
3. ✅ استخدم HTTPS
4. ✅ فعل Rate Limiting
5. ✅ ضبط CORS للدومين الحقيقي
6. ✅ غير `NODE_ENV=production`

---

## 📞 الدعم والمساعدة

لو عندك مشكلة:

1. تأكد إن MongoDB شغال
2. تأكد إن المتغيرات في `.env` صح
3. شوف الـ errors في Console
4. اقرأ ملف `README.md` و `TESTING.md`

---

**✨ المشروع جاهز للتشغيل! بالتوفيق يا معلم! 🚀**
