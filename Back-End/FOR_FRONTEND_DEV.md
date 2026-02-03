# 🎨 دليل الفرونت إند - الربط مع الباك إند

## 📍 معلومات الاتصال

### Base URL
```
http://localhost:5000/api
```

عند الـ Production هتبقى:
```
https://your-domain.com/api
```

---

## 🔑 نظام Authentication

### 1. التسجيل والدخول

#### Register (تسجيل طالب جديد)
```javascript
POST /api/auth/register

// Request Body
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "phone": "01012345678",  // 11 رقم مصري إجباري
  "password": "123456"
}

// Response
{
  "success": true,
  "message": "تم التسجيل بنجاح! مرحباً بك 🎉",
  "data": {
    "id": "...",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR..."  // ⭐ احفظ ده!
  }
}
```

#### Login (تسجيل الدخول)
```javascript
POST /api/auth/login

// Request Body
{
  "email": "ahmed@example.com",
  "password": "123456"
}

// Response - نفس الـ Register
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR..."  // ⭐ احفظ ده!
  }
}
```

---

## 🔒 استخدام التوكن

### التوكن بيحتوي على:
```javascript
{
  id: "user_id",
  name: "أحمد محمد",    // 🛡️ مهم للعلامة المائية
  phone: "01012345678",  // 🛡️ مهم للعلامة المائية
  role: "student"        // or "admin"
}
```

### إزاي تستخدمه:

#### في Axios:
```javascript
import axios from 'axios';

// إعداد Axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Interceptor لإضافة التوكن تلقائياً
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// مثال استخدام
const response = await api.get('/courses');
```

#### في Fetch:
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/courses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

---

## 📚 أهم الـ Endpoints اللي هتستخدمها

### 1. الكورسات (Public)

#### عرض كل الكورسات
```javascript
GET /api/courses
// بدون Token - Public

// Response
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "كورس JavaScript كامل",
      "description": "...",
      "price": 250,
      "thumbnail": "https://...",
      "category": "programming",
      "level": "beginner",
      "enrolledStudents": 150,
      "rating": { "average": 4.5, "count": 100 }
    }
  ]
}
```

#### تفاصيل كورس
```javascript
GET /api/courses/:courseId
// بدون Token - لكن لو في token هيرجع isEnrolled

// Response
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "...",
    "price": 250,
    "videos": [  // 🔴 بدون bunnyVideoId للأمان
      {
        "_id": "...",
        "title": "مقدمة الكورس",
        "duration": 600,
        "order": 1,
        "isFreePreview": true  // لو true يقدر يشوفه
      }
    ],
    "isEnrolled": false  // 🟢 true لو الطالب مشترك
  }
}
```

---

### 2. نظام الشراء

#### إنشاء طلب شراء
```javascript
POST /api/orders
Headers: { Authorization: Bearer TOKEN }

// Request Body
{
  "courseId": "course_id_here",
  "paymentMethod": "vodafone_cash",  // or "instapay"
  "screenshotUrl": "https://cloudinary.com/screenshot.jpg"
}

// Response
{
  "success": true,
  "message": "تم إرسال طلبك بنجاح! سيتم مراجعته قريباً ✅",
  "data": {
    "status": "pending"
  }
}
```

#### طلباتي
```javascript
GET /api/orders/my-orders
Headers: { Authorization: Bearer TOKEN }

// Response
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "courseId": { "title": "...", "thumbnail": "..." },
      "status": "pending",  // or "approved" or "rejected"
      "price": 250,
      "createdAt": "..."
    }
  ]
}
```

---

### 3. مشاهدة الكورس (المسجلين فقط)

#### الحصول على الفيديوهات
```javascript
GET /api/videos/:courseId
Headers: { Authorization: Bearer TOKEN }

// ⚠️ الباك إند بيتحقق إن الطالب مشترك في الكورس

// Response
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "الدرس الأول",
      "bunnyVideoId": "12345-bunny-id",  // 🎥 استخدم ده في Player
      "duration": 600,
      "order": 1
    }
  ]
}
```

---

## 🛡️ نظام الحماية - العلامة المائية (مهم جداً!)

### الخطوات:

#### 1. فك التوكن (Decode JWT)
```javascript
import jwt_decode from 'jwt-decode';

const token = localStorage.getItem('token');
const decoded = jwt_decode(token);

console.log(decoded.name);   // "أحمد محمد"
console.log(decoded.phone);  // "01012345678"
```

#### 2. إضافة العلامة المائية فوق الفيديو
```jsx
// في مكون الفيديو
<div className="relative">
  {/* Bunny Video Player */}
  <iframe 
    src={`https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${bunnyVideoId}`}
    className="w-full h-full"
  />
  
  {/* 🛡️ العلامة المائية */}
  <div 
    id="watermark"
    className="absolute text-white/70 text-sm pointer-events-none"
    style={{
      top: watermarkPosition.top,
      left: watermarkPosition.left,
      zIndex: 9999
    }}
  >
    {decoded.name} - {decoded.phone}
  </div>
</div>
```

#### 3. تحريك العلامة المائية
```javascript
useEffect(() => {
  const moveWatermark = () => {
    const randomTop = Math.random() * 80;   // 0-80%
    const randomLeft = Math.random() * 80;  // 0-80%
    
    setWatermarkPosition({
      top: `${randomTop}%`,
      left: `${randomLeft}%`
    });
  };

  // تتحرك كل 5 ثواني
  const interval = setInterval(moveWatermark, 5000);
  
  return () => clearInterval(interval);
}, []);
```

#### 4. منع التلاعب (Anti-Tamper)
```javascript
useEffect(() => {
  const observer = new MutationObserver((mutations) => {
    const watermark = document.getElementById('watermark');
    
    if (!watermark) {
      // لو الطالب مسح العلامة المائية
      alert('⚠️ ممنوع التلاعب بالعلامة المائية!');
      
      // أوقف الفيديو
      const iframe = document.querySelector('iframe');
      iframe.src = '';
      
      // أو ارجع للصفحة الرئيسية
      window.location.href = '/courses';
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return () => observer.disconnect();
}, []);
```

---

## 📤 رفع الصور

### رفع صورة واحدة
```javascript
POST /api/upload/image
Headers: { 
  Authorization: Bearer TOKEN,
  Content-Type: multipart/form-data
}

// في React
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/upload/image', formData);
  
  console.log(response.data.data.url);  // رابط الصورة
};
```

---

## 🎯 الـ Response Format الموحد

### Success Response
```javascript
{
  "success": true,
  "message": "رسالة النجاح",
  "data": { ... }  // البيانات هنا
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "رسالة الخطأ",
  "errorCode": "ERROR_CODE",  // اختياري
  "errors": [  // في حالة Validation
    {
      "field": "email",
      "message": "البريد الإلكتروني غير صالح"
    }
  ]
}
```

### معالجة الأخطاء في Axios
```javascript
try {
  const response = await api.post('/auth/login', data);
  
  if (response.data.success) {
    // نجح
    const token = response.data.data.token;
    localStorage.setItem('token', token);
  }
  
} catch (error) {
  if (error.response) {
    // عرض رسالة الخطأ
    toast.error(error.response.data.message);
    
    // لو في validation errors
    if (error.response.data.errors) {
      error.response.data.errors.forEach(err => {
        console.log(`${err.field}: ${err.message}`);
      });
    }
  }
}
```

---

## 🔐 معلومات الـ Admin (للتطوير)

للاختبار:
- **Email:** `admin@elearning.com`
- **Password:** `123456`

لإنشاء Admin جديد:
```bash
node scripts/createAdmin.js
```

---

## 📋 Checklist للفرونت إند

### صفحة التسجيل/الدخول
- [ ] فورم تسجيل (name, email, phone, password)
- [ ] فورم دخول (email, password)
- [ ] حفظ التوكن في localStorage
- [ ] Redirect بعد النجاح

### صفحة الكورسات
- [ ] عرض كل الكورسات (GET /api/courses)
- [ ] كارت لكل كورس (صورة، عنوان، سعر)
- [ ] زرار "التفاصيل"

### صفحة تفاصيل الكورس
- [ ] عرض التفاصيل (GET /api/courses/:id)
- [ ] قائمة الدروس (عناوين فقط)
- [ ] زرار "اشترك الآن" (لو مش مشترك)
- [ ] زرار "اذهب للكورس" (لو مشترك)

### صفحة الدفع
- [ ] عرض رقم فودافون كاش
- [ ] رفع صورة الاسكرين شوت
- [ ] إرسال الطلب (POST /api/orders)
- [ ] رسالة تأكيد

### صفحة مشاهدة الكورس
- [ ] قائمة الفيديوهات (GET /api/videos/:courseId)
- [ ] مشغل الفيديو (Bunny Player)
- [ ] العلامة المائية (name + phone)
- [ ] تحريك العلامة كل 5 ثواني
- [ ] Anti-Tamper Protection

### صفحة طلباتي
- [ ] عرض الطلبات (GET /api/orders/my-orders)
- [ ] حالة كل طلب (pending/approved/rejected)

---

## 🚨 ملاحظات مهمة

### 1. التوكن
- احفظه في `localStorage` أو `sessionStorage`
- أضفه في كل request محمي
- لو انتهى (401) ارجع للـ Login

### 2. الفيديوهات
- **لا ترفع الفيديوهات على السيرفر**
- استخدم Bunny.net Stream
- الباك إند يرجع `bunnyVideoId` فقط

### 3. الصور
- رفعها على Cloudinary عبر `/api/upload/image`
- استخدم الـ URL اللي راجع

### 4. الحماية
- العلامة المائية **إجبارية** على كل فيديو
- استخدم `name` و `phone` من التوكن
- ضيف Anti-Tamper Code

### 5. الـ Response
- تحقق دايماً من `response.data.success`
- اعرض `response.data.message` في Toast

---

## 📞 لو محتاج مساعدة

اقرأ:
- `API_DOCS.md` - توثيق كامل للـ APIs
- `TESTING.md` - أمثلة على الاختبار
- `README.md` - معلومات عامة

---

## 🎁 Bonus: State Management (Zustand مثلاً)

```javascript
// stores/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import jwt_decode from 'jwt-decode';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      
      login: (token) => {
        const decoded = jwt_decode(token);
        set({ 
          token, 
          user: {
            id: decoded.id,
            name: decoded.name,
            phone: decoded.phone,
            role: decoded.role
          }
        });
      },
      
      logout: () => {
        set({ token: null, user: null });
      },
      
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin'
    }),
    {
      name: 'auth-storage'
    }
  )
);

export default useAuthStore;
```

---

**بالتوفيق في الفرونت إند! 🚀**
