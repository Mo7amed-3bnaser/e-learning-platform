# 📋 دليل الـ APIs المطلوبة للمنصة

## ✅ الـ APIs الجاهزة (موجودة بالفعل):

### 1. **Authentication APIs** ✅
```typescript
POST /api/auth/register      // تسجيل مستخدم جديد
POST /api/auth/login         // تسجيل الدخول
GET  /api/auth/me            // معلومات المستخدم الحالي
PUT  /api/auth/profile       // تحديث الملف الشخصي
```

### 2. **Courses APIs** ✅
```typescript
GET    /api/courses                    // جلب كل الكورسات المنشورة
GET    /api/courses/:id                // تفاصيل كورس معين (مع أسماء الدروس)
POST   /api/courses                    // إنشاء كورس (Admin)
PUT    /api/courses/:id                // تعديل كورس (Admin)
DELETE /api/courses/:id                // حذف كورس (Admin)
PATCH  /api/courses/:id/publish        // نشر/إخفاء كورس (Admin)
```

### 3. **Videos APIs** ✅
```typescript
GET    /api/videos/course/:courseId    // جلب فيديوهات الكورس (للمسجلين فقط)
GET    /api/videos/:videoId            // تفاصيل فيديو محدد
POST   /api/videos                     // إضافة فيديو (Admin)
PUT    /api/videos/:id                 // تعديل فيديو (Admin)
DELETE /api/videos/:id                 // حذف فيديو (Admin)
```

### 4. **Orders APIs** ✅
```typescript
POST   /api/orders                     // إنشاء طلب شراء عادي (مع screenshot)
GET    /api/orders/my-orders           // طلبات المستخدم
GET    /api/orders/pending             // الطلبات المعلقة (Admin)
PATCH  /api/orders/:id/approve         // قبول طلب (Admin)
PATCH  /api/orders/:id/reject          // رفض طلب (Admin)

// 🆕 Sandbox APIs (للتجربة)
POST   /api/orders/sandbox/pay         // دفع تجريبي فوري ✅
GET    /api/orders/enrollment/:courseId // التحقق من التسجيل ✅
```

---

## 🎯 الـ APIs اللي هتحتاجها (جاهزة):

### **للطالب:**

#### 1. جلب الكورسات:
```javascript
GET /api/courses

// Response:
{
  "success": true,
  "data": [
    {
      "_id": "6983ba6e040ca22b29d42e42",
      "title": "Fundamentals Of Programming With C++",
      "description": "...",
      "price": 20,
      "thumbnail": "https://...",
      "instructor": { "name": "Elzero Web School" },
      "enrolledStudents": 0
    }
  ]
}
```

#### 2. تفاصيل الكورس (أسماء الدروس):
```javascript
GET /api/courses/:id

// Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Fundamentals Of Programming With C++",
    "price": 20,
    "videos": [
      {
        "_id": "...",
        "title": "#001 - Important Introduction",
        "duration": 630,
        "order": 1,
        "isFreePreview": true
      },
      // باقي الفيديوهات...
    ],
    "whatYouWillLearn": [...],
    "requirements": [...],
    "isEnrolled": false  // ✅ مهم: هل الطالب مسجل؟
  }
}
```

#### 3. الشراء (Sandbox):
```javascript
POST /api/orders/sandbox/pay
Authorization: Bearer YOUR_TOKEN

Body:
{
  "courseId": "6983ba6e040ca22b29d42e42"
}

// Response:
{
  "success": true,
  "message": "✅ تم التسجيل في الكورس بنجاح (Sandbox Mode)",
  "data": {
    "order": { ... },
    "isEnrolled": true,
    "sandboxMode": true
  }
}
```

#### 4. التحقق من التسجيل:
```javascript
GET /api/orders/enrollment/:courseId
Authorization: Bearer YOUR_TOKEN

// Response:
{
  "success": true,
  "data": {
    "isEnrolled": true,
    "courseId": "..."
  }
}
```

#### 5. مشاهدة الفيديوهات (بعد الشراء):
```javascript
GET /api/videos/course/:courseId
Authorization: Bearer YOUR_TOKEN

// Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "#001 - Important Introduction",
      "youtubeVideoId": "XDuWyYxksXU",  // ✅ استخدمه في YouTube Player
      "duration": 630,
      "order": 1
    }
  ]
}
```

---

## 📊 Flow الكامل للطالب:

### **1. تصفح الكورسات:**
```
الطالب يفتح /courses
→ GET /api/courses
→ يشوف كل الكورسات المتاحة
```

### **2. عرض تفاصيل الكورس:**
```
الطالب يضغط "التفاصيل"
→ GET /api/courses/:id
→ يشوف معلومات الكورس + أسماء الدروس
```

### **3. الشراء:**
```
الطالب يضغط "اشتر الآن"
→ يتحول لـ /checkout/:id
→ يضغط "تأكيد الشراء"
→ POST /api/orders/sandbox/pay
→ يتسجل تلقائياً في الكورس ✅
```

### **4. مشاهدة الفيديوهات:**
```
الطالب يفتح الكورس مرة تانية
→ GET /api/courses/:id (isEnrolled = true)
→ يضغط على فيديو
→ GET /api/videos/:courseId
→ يشاهد الفيديو على YouTube Player
```

---

## 🔧 التنفيذ في الفرونت اند:

### **استخدام الـ APIs:**

```typescript
import { coursesAPI, ordersAPI, videosAPI } from '@/lib/api';

// 1. جلب الكورسات
const courses = await coursesAPI.getAllCourses();

// 2. تفاصيل كورس
const course = await coursesAPI.getCourseById(courseId);

// 3. شراء كورس (Sandbox)
const result = await ordersAPI.sandboxPayment(courseId);

// 4. التحقق من التسجيل
const enrolled = await ordersAPI.checkEnrollment(courseId);

// 5. جلب الفيديوهات
const videos = await videosAPI.getCourseVideos(courseId);
```

---

## 🎬 Component اليوتيوب:

```tsx
import YouTubePlayer from '@/components/YouTubePlayer';

<YouTubePlayer 
  videoId="XDuWyYxksXU"
  title="الدرس الأول"
  autoplay={false}
/>
```

---

## ✅ الملفات الجاهزة:

1. **CourseCard** → [CourseCard.tsx](d:\my projects\e-learning-platform\Front-End\src\components\CourseCard.tsx)
   - زر "التفاصيل"
   - زر "اشتر الآن"

2. **Course Details** → [courses/[id]/page.tsx](d:\my projects\e-learning-platform\Front-End\src\app\courses\[id]\page.tsx)
   - تفاصيل الكورس
   - أسماء الدروس
   - معلومات المدرب

3. **Checkout Page** → [checkout/[id]/page.tsx](d:\my projects\e-learning-platform\Front-End\src\app\checkout\[id]\page.tsx)
   - صفحة الدفع
   - Sandbox payment
   - تسجيل تلقائي

4. **API Library** → [lib/api.ts](d:\my projects\e-learning-platform\Front-End\src\lib\api.ts)
   - كل الـ API functions جاهزة
   - Authentication تلقائي

5. **YouTube Player** → [YouTubePlayer.tsx](d:\my projects\e-learning-platform\Front-End\src\components\YouTubePlayer.tsx)
   - Player جاهز للاستخدام

---

## 🚀 خطوات التجربة:

```bash
# 1. حدث الكورس بـ $20
cd Back-End
node scripts/importYouTubePlaylist.js

# 2. شغل الـ Backend
npm start

# 3. شغل الـ Frontend
cd ../Front-End
npm run dev

# 4. جرب:
# - افتح http://localhost:3000/courses
# - اضغط "التفاصيل" → تشوف أسماء الدروس
# - اضغط "اشتر الآن" → صفحة الدفع
# - اضغط "تأكيد الشراء" → تتسجل في الكورس تلقائياً
```

---

**كل حاجة جاهزة! محتاج أي تعديل؟** 🎉
