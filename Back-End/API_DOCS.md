# 📋 API Endpoints Documentation

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Endpoints

### 1. Register (تسجيل مستخدم جديد)

**Endpoint:** `POST /auth/register`  
**Access:** Public

**Request Body:**
```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "phone": "01012345678",
  "password": "123456"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "تم التسجيل بنجاح! مرحباً بك 🎉",
  "data": {
    "id": "...",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

---

### 2. Login (تسجيل الدخول)

**Endpoint:** `POST /auth/login`  
**Access:** Public

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "id": "...",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

---

### 3. Get My Profile (بياناتي)

**Endpoint:** `GET /auth/me`  
**Access:** Private (Token Required)

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم جلب بيانات المستخدم بنجاح",
  "data": {
    "id": "...",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "role": "student",
    "enrolledCourses": [
      {
        "_id": "...",
        "title": "كورس JavaScript",
        "thumbnail": "https://..."
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 📚 Course Endpoints

### 4. Get All Courses (كل الكورسات المنشورة)

**Endpoint:** `GET /courses`  
**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم جلب الكورسات بنجاح",
  "data": [
    {
      "_id": "...",
      "title": "كورس JavaScript كامل",
      "description": "...",
      "price": 250,
      "thumbnail": "https://...",
      "category": "programming",
      "level": "beginner",
      "rating": {
        "average": 4.5,
        "count": 100
      },
      "enrolledStudents": 150,
      "instructor": {
        "name": "مستر كود"
      }
    }
  ],
  "pagination": {
    "total": 10
  }
}
```

---

### 5. Get Course By ID (تفاصيل كورس)

**Endpoint:** `GET /courses/:id`  
**Access:** Public (مع optional auth للتحقق من enrollment)

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم جلب بيانات الكورس بنجاح",
  "data": {
    "_id": "...",
    "title": "كورس JavaScript كامل",
    "description": "...",
    "price": 250,
    "thumbnail": "https://...",
    "instructor": {
      "name": "مستر كود",
      "bio": "...",
      "avatar": "https://..."
    },
    "category": "programming",
    "level": "beginner",
    "isPublished": true,
    "videos": [
      {
        "_id": "...",
        "title": "مقدمة الكورس",
        "description": "...",
        "duration": 600,
        "order": 1,
        "isFreePreview": true
      }
    ],
    "isEnrolled": false,
    "whatYouWillLearn": ["..."],
    "requirements": ["..."]
  }
}
```

---

### 6. Create Course (إنشاء كورس - Admin)

**Endpoint:** `POST /courses`  
**Access:** Private/Admin

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Request Body:**
```json
{
  "title": "كورس JavaScript كامل",
  "description": "تعلم JavaScript من الصفر",
  "price": 250,
  "thumbnail": "https://...",
  "instructor": {
    "name": "مستر كود",
    "bio": "مدرب برمجة"
  },
  "category": "programming",
  "level": "beginner",
  "whatYouWillLearn": [
    "أساسيات JavaScript",
    "DOM Manipulation"
  ],
  "requirements": [
    "معرفة HTML & CSS"
  ]
}
```

---

## 🎥 Video Endpoints

### 7. Get Course Videos (فيديوهات الكورس)

**Endpoint:** `GET /videos/:courseId`  
**Access:** Private (Enrolled Students Only)

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم جلب فيديوهات الكورس بنجاح",
  "data": [
    {
      "_id": "...",
      "title": "مقدمة الكورس",
      "description": "...",
      "bunnyVideoId": "12345-bunny-id",
      "duration": 600,
      "order": 1,
      "isFreePreview": true
    }
  ]
}
```

---

### 8. Add Video (إضافة فيديو - Admin)

**Endpoint:** `POST /videos`  
**Access:** Private/Admin

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Request Body:**
```json
{
  "courseId": "course_id_here",
  "title": "الدرس الأول",
  "description": "شرح المقدمة",
  "bunnyVideoId": "12345-bunny-video-id",
  "duration": 600,
  "order": 1,
  "isFreePreview": false
}
```

---

## 💳 Order Endpoints

### 9. Create Order (إنشاء طلب شراء)

**Endpoint:** `POST /orders`  
**Access:** Private

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "courseId": "course_id_here",
  "paymentMethod": "vodafone_cash",
  "screenshotUrl": "https://cloudinary.com/screenshot.jpg"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "تم إرسال طلبك بنجاح! سيتم مراجعته قريباً ✅",
  "data": {
    "_id": "...",
    "userId": "...",
    "courseId": "...",
    "paymentMethod": "vodafone_cash",
    "screenshotUrl": "...",
    "status": "pending",
    "price": 250,
    "createdAt": "..."
  }
}
```

---

### 10. Get My Orders (طلباتي)

**Endpoint:** `GET /orders/my-orders`  
**Access:** Private

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

---

### 11. Approve Order (الموافقة - Admin)

**Endpoint:** `PATCH /orders/:id/approve`  
**Access:** Private/Admin

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم الموافقة على الطلب وإضافة الكورس للطالب بنجاح ✅",
  "data": {
    "_id": "...",
    "status": "approved",
    "approvedBy": "admin_id",
    "approvedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 👨‍💼 Admin Endpoints

### 12. Dashboard Stats (إحصائيات)

**Endpoint:** `GET /admin/stats`  
**Access:** Private/Admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم جلب الإحصائيات بنجاح",
  "data": {
    "stats": {
      "totalStudents": 150,
      "totalCourses": 10,
      "publishedCourses": 8,
      "pendingOrders": 5,
      "approvedOrders": 100,
      "totalRevenue": 25000
    },
    "recentOrders": [...]
  }
}
```

---

### 13. Get All Students (الطلاب)

**Endpoint:** `GET /admin/students`  
**Access:** Private/Admin

---

### 14. Block/Unblock Student (حظر)

**Endpoint:** `PATCH /admin/students/:id/block`  
**Access:** Private/Admin

---

## 📤 Upload Endpoints

### 15. Upload Image (رفع صورة)

**Endpoint:** `POST /upload/image`  
**Access:** Private

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
```
image: [file]
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم رفع الصورة بنجاح",
  "data": {
    "url": "https://res.cloudinary.com/.../image.jpg",
    "publicId": "e-learning/xyz123"
  }
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "خطأ في البيانات المدخلة",
  "errors": [
    {
      "field": "email",
      "message": "البريد الإلكتروني غير صالح"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "غير مصرح لك بالدخول - لا يوجد توكن"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "غير مصرح لك - هذه الصفحة للمشرفين فقط"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "الكورس غير موجود"
}
```

---

## 💡 Notes

- كل الـ endpoints المحمية تحتاج `Authorization: Bearer TOKEN`
- التوكن فيه: `id, name, phone, role`
- كل الـ responses بالشكل الموحد: `{ success, message, data }`
