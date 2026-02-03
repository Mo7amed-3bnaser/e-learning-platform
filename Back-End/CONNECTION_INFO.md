# 📡 بيانات الاتصال بالـ API

## 🔗 الروابط

### Development (Local)
```
http://localhost:5000
```

### API Base URL
```
http://localhost:5000/api
```

---

## 🔑 حساب Admin للاختبار

```
Email: admin@elearning.com
Password: 123456
```

⚠️ **مهم:** غير الباسورد بعد أول دخول!

---

## 📋 Postman Collection

### Environment Variables
```
BASE_URL = http://localhost:5000/api
TOKEN = (سيتم ملؤه بعد Login)
```

### Quick Test

#### 1. Login
```
POST {{BASE_URL}}/auth/login
Body: {
  "email": "admin@elearning.com",
  "password": "123456"
}
```

#### 2. Get Courses
```
GET {{BASE_URL}}/courses
```

---

## 🗄️ Database

```
MongoDB Atlas (Cloud)
```

الاتصال شغال ✅

---

## 📞 Support

لو في مشكلة:
1. تأكد إن السيرفر شغال (`npm run dev`)
2. تأكد إن المنفذ 5000 مش مستخدم
3. شوف الـ errors في Console

---

## 📚 Documentation Files

- `FOR_FRONTEND_DEV.md` - **ابدأ من هنا!** 🎯
- `QUICK_REFERENCE.md` - مرجع سريع
- `API_DOCS.md` - توثيق كامل
- `TESTING.md` - دليل الاختبار
- `README.md` - معلومات عامة

---

**كل حاجة جاهزة! ابدأ الفرونت إند 🚀**
