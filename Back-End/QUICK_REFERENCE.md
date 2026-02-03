# ⚡ Quick Reference - للفرونت إند

## 🔗 الـ API
```
http://localhost:5000/api
```

---

## 🔑 اللي محتاجه منك

### 1. بيانات الاتصال
```javascript
const API_URL = 'http://localhost:5000/api';
```

### 2. التوكن فيه المعلومات دي:
```javascript
{
  id: "user_id",
  name: "أحمد محمد",      // 🛡️ للعلامة المائية
  phone: "01012345678",    // 🛡️ للعلامة المائية
  role: "student"
}
```

### 3. أهم الـ Endpoints:

#### Authentication
- `POST /auth/register` - تسجيل
- `POST /auth/login` - دخول
- `GET /auth/me` - بياناتي (Protected)

#### Courses
- `GET /courses` - كل الكورسات (Public)
- `GET /courses/:id` - تفاصيل (Public)

#### Orders
- `POST /orders` - إنشاء طلب (Protected)
- `GET /orders/my-orders` - طلباتي (Protected)

#### Videos
- `GET /videos/:courseId` - فيديوهات الكورس (Protected + Enrolled)

### 4. الـ Response دايماً:
```javascript
{
  "success": true/false,
  "message": "رسالة",
  "data": { ... }
}
```

---

## 🛡️ العلامة المائية (مهم!)

### الكود:

```jsx
// فك التوكن
import jwt_decode from 'jwt-decode';
const decoded = jwt_decode(token);

// العلامة المائية
<div className="absolute text-white/70 pointer-events-none z-[9999]">
  {decoded.name} - {decoded.phone}
</div>

// حركها كل 5 ثواني
setInterval(() => {
  // random position
}, 5000);

// Anti-Tamper
const observer = new MutationObserver(() => {
  if (!document.getElementById('watermark')) {
    alert('ممنوع التلاعب!');
    // أوقف الفيديو
  }
});
```

---

## 📤 رفع الصور

```javascript
const formData = new FormData();
formData.append('image', file);

await axios.post('/upload/image', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

---

## 🔐 Admin للاختبار

```
Email: admin@elearning.com
Password: 123456
```

---

## 📚 المستندات الكاملة

- `FOR_FRONTEND_DEV.md` - الدليل الكامل
- `API_DOCS.md` - كل الـ endpoints
- `TESTING.md` - أمثلة

---

**كل حاجة جاهزة من ناحيتي! 🚀**
