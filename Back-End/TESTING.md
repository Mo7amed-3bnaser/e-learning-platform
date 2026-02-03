# 🧪 API Testing Guide

## الأدوات المطلوبة

- **Postman**: [تحميل](https://www.postman.com/downloads/)
- أو **Thunder Client** (Extension في VS Code)

## خطوات الاختبار

### 1️⃣ تجهيز البيئة

في Postman، اعمل Environment جديد:

```
BASE_URL = http://localhost:5000/api
TOKEN = (هيتحط بعد Login)
```

### 2️⃣ الترتيب الصحيح للاختبار

#### أ) إنشاء Admin (أول مرة فقط)

في Terminal:
```bash
npm run create-admin
```

#### ب) تسجيل الدخول كـ Admin

**POST** `{{BASE_URL}}/auth/login`

Body (JSON):
```json
{
  "email": "admin@elearning.com",
  "password": "123456"
}
```

⚠️ **مهم**: خد التوكن من الـ Response وحطه في Environment:
```
TOKEN = eyJhbGciOiJIUzI1NiIsInR...
```

#### ج) إنشاء كورس

**POST** `{{BASE_URL}}/courses`

Headers:
```
Authorization: Bearer {{TOKEN}}
```

Body (JSON):
```json
{
  "title": "كورس تعلم البرمجة من الصفر",
  "description": "كورس شامل لتعلم البرمجة من البداية للاحتراف",
  "price": 200,
  "thumbnail": "https://via.placeholder.com/400",
  "instructor": {
    "name": "مستر كود",
    "bio": "خبير في البرمجة"
  },
  "category": "programming",
  "level": "beginner",
  "whatYouWillLearn": [
    "أساسيات البرمجة",
    "حل المشاكل",
    "بناء مشاريع حقيقية"
  ],
  "requirements": [
    "لا يوجد متطلبات سابقة"
  ]
}
```

#### د) إضافة فيديو للكورس

**POST** `{{BASE_URL}}/videos`

Headers:
```
Authorization: Bearer {{TOKEN}}
```

Body (JSON):
```json
{
  "courseId": "COURSE_ID_FROM_PREVIOUS_STEP",
  "title": "مقدمة الكورس",
  "description": "شرح مقدمة الكورس",
  "bunnyVideoId": "12345-bunny-video-id",
  "duration": 600,
  "order": 1,
  "isFreePreview": true
}
```

#### هـ) نشر الكورس

**PATCH** `{{BASE_URL}}/courses/:courseId/publish`

Headers:
```
Authorization: Bearer {{TOKEN}}
```

#### و) تسجيل طالب جديد

**POST** `{{BASE_URL}}/auth/register`

Body (JSON):
```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "phone": "01012345678",
  "password": "123456"
}
```

خد التوكن الجديد وحطه في متغير تاني (مثلاً `STUDENT_TOKEN`).

#### ز) عرض الكورسات (كطالب)

**GET** `{{BASE_URL}}/courses`

(بدون Token - Public)

#### ح) تفاصيل كورس

**GET** `{{BASE_URL}}/courses/:courseId`

(بدون Token - Public)

#### ط) إنشاء طلب شراء

**POST** `{{BASE_URL}}/orders`

Headers:
```
Authorization: Bearer {{STUDENT_TOKEN}}
```

Body (JSON):
```json
{
  "courseId": "COURSE_ID",
  "paymentMethod": "vodafone_cash",
  "screenshotUrl": "https://via.placeholder.com/300"
}
```

#### ي) عرض الطلبات المعلقة (Admin)

**GET** `{{BASE_URL}}/orders/pending`

Headers:
```
Authorization: Bearer {{TOKEN}}
```

#### ك) الموافقة على الطلب (Admin)

**PATCH** `{{BASE_URL}}/orders/:orderId/approve`

Headers:
```
Authorization: Bearer {{TOKEN}}
```

#### ل) عرض الفيديوهات (Enrolled Student)

**GET** `{{BASE_URL}}/videos/:courseId`

Headers:
```
Authorization: Bearer {{STUDENT_TOKEN}}
```

---

## 🚨 حالات الأخطاء للاختبار

### 1. Unauthorized (401)
- دخول بدون Token
- Token غلط أو منتهي

### 2. Forbidden (403)
- طالب يحاول يدخل Admin endpoint
- حساب محظور

### 3. Not Found (404)
- Course/Video/Order غير موجود

### 4. Bad Request (400)
- بيانات ناقصة
- Validation فشل

---

## 📊 سيناريوهات كاملة

### سيناريو 1: Student Journey

1. التسجيل (`/auth/register`)
2. عرض الكورسات (`/courses`)
3. تفاصيل كورس (`/courses/:id`)
4. إنشاء طلب (`/orders`)
5. الانتظار للموافقة
6. بعد الموافقة: عرض الفيديوهات (`/videos/:courseId`)

### سيناريو 2: Admin Journey

1. Login (`/auth/login`)
2. عرض الإحصائيات (`/admin/stats`)
3. إنشاء كورس (`/courses`)
4. إضافة فيديوهات (`/videos`)
5. نشر الكورس (`/courses/:id/publish`)
6. مراجعة الطلبات (`/orders/pending`)
7. الموافقة/الرفض (`/orders/:id/approve`)

---

## 💡 Tips

- استخدم **Variables** في Postman لسهولة التعديل
- احفظ الـ Requests في Collection
- Export الـ Collection وشاركها مع الفريق
- اختبر كل الـ Edge Cases (بيانات غلط، Token منتهي، إلخ)
