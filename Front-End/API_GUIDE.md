# 🔌 دليل الـ APIs السريع

## 🔐 Authentication APIs

```typescript
import { authAPI } from "@/lib/api";

// تسجيل حساب جديد
const response = await authAPI.register({
  name: "أحمد محمد",
  email: "ahmed@example.com",
  phone: "01012345678",
  password: "password123",
});

// تسجيل الدخول
const response = await authAPI.login({
  email: "ahmed@example.com",
  password: "password123",
});

// جلب بيانات المستخدم الحالي
const profile = await authAPI.getProfile();

// تحديث البيانات الشخصية
await authAPI.updateProfile({
  name: "أحمد محمود",
  email: "new@example.com",
});
```

---

## 📚 Courses APIs

```typescript
import { coursesAPI } from "@/lib/api";

// جلب جميع الكورسات المنشورة (Public)
const response = await coursesAPI.getAllCourses();
const courses = response.data.data;

// جلب تفاصيل كورس معين (Public/OptionalAuth)
const response = await coursesAPI.getCourseById("course_id");
const course = response.data.data;

// ✨ Admin only - إنشاء كورس جديد
const formData = new FormData();
formData.append("title", "كورس React");
formData.append("description", "تعلم React من الصفر");
formData.append("price", "200");
formData.append("category", "برمجة");
formData.append("thumbnail", imageFile);

await coursesAPI.createCourse(formData);

// ✨ Admin only - تعديل كورس
await coursesAPI.updateCourse("course_id", formData);

// ✨ Admin only - نشر/إخفاء كورس
await coursesAPI.togglePublish("course_id");

// ✨ Admin only - جميع الكورسات (منشورة وغير منشورة)
const allCourses = await coursesAPI.getAllCoursesAdmin();
```

---

## 🎥 Videos APIs

```typescript
import { videosAPI } from "@/lib/api";

// 🔒 جلب فيديوهات الكورس (للمشتركين فقط)
const response = await videosAPI.getCourseVideos("course_id");
const videos = response.data.data;

// 🔒 مشاهدة فيديو محدد (للمشتركين أو Free Preview)
const video = await videosAPI.getVideoById("video_id");

// ✨ Admin only - إضافة فيديو جديد
await videosAPI.createVideo({
  courseId: "course_id",
  title: "المحاضرة الأولى",
  bunnyVideoId: "bunny_video_id_here",
  duration: 3600, // بالثواني
  order: 1,
  isFreePreview: false,
});

// ✨ Admin only - تعديل فيديو
await videosAPI.updateVideo("video_id", {
  title: "عنوان جديد",
  order: 2,
});

// ✨ Admin only - حذف فيديو
await videosAPI.deleteVideo("video_id");
```

---

## 💰 Orders APIs

```typescript
import { ordersAPI } from "@/lib/api";

// 🛒 إنشاء طلب شراء جديد (Student)
const formData = new FormData();
formData.append("courseId", "course_id");
formData.append("paymentMethod", "vodafone_cash"); // vodafone_cash, instapay, bank_transfer
formData.append("screenshot", imageFile); // صورة التحويل

const response = await ordersAPI.createOrder(formData);

// 📋 جلب طلبات المستخدم (Student)
const myOrders = await ordersAPI.getMyOrders();

// ✨ Admin only - جلب الطلبات المعلقة
const pendingOrders = await ordersAPI.getPendingOrders();

// ✨ Admin only - جلب جميع الطلبات مع فلترة
const allOrders = await ordersAPI.getAllOrders({
  status: "pending", // pending, approved, rejected
  page: 1,
  limit: 20,
});

// ✨ Admin only - قبول طلب
await ordersAPI.approveOrder("order_id");
// النظام يضيف الكورس للطالب تلقائياً!

// ✨ Admin only - رفض طلب
await ordersAPI.rejectOrder("order_id", "السعر غير صحيح");

// ✨ Admin only - حذف طلب
await ordersAPI.deleteOrder("order_id");
```

---

## ⚙️ Admin APIs

```typescript
import { adminAPI } from "@/lib/api";

// ✨ Admin only - إحصائيات Dashboard
const stats = await adminAPI.getDashboardStats();
// { totalRevenue, totalStudents, totalCourses, pendingOrders }

// ✨ Admin only - جميع الطلاب
const students = await adminAPI.getAllStudents();

// ✨ Admin only - البحث عن طالب
const results = await adminAPI.searchStudents("أحمد");

// ✨ Admin only - حظر/إلغاء حظر طالب
await adminAPI.blockStudent("user_id", true); // حظر
await adminAPI.blockStudent("user_id", false); // إلغاء الحظر

// ✨ Admin only - حذف طالب
await adminAPI.deleteStudent("user_id");
```

---

## 📤 Upload APIs

```typescript
import { uploadAPI } from "@/lib/api";

// رفع صورة إلى Cloudinary
const file = event.target.files[0];
const response = await uploadAPI.uploadImage(file);
const imageUrl = response.data.data.url;
```

---

## 🎯 استخدام مع Error Handling

```typescript
import { coursesAPI } from "@/lib/api";
import { handleApiError, showSuccess } from "@/lib/toast";

try {
  const response = await coursesAPI.getAllCourses();
  const courses = response.data.data;

  showSuccess(response.data.message); // "تم جلب الكورسات بنجاح"
} catch (error) {
  handleApiError(error); // يستخرج الرسالة من Backend ويعرضها
}
```

---

## 📝 شكل الـ Response الموحد

كل الـ APIs ترجع بنفس الشكل:

### ✅ نجاح

```json
{
  "success": true,
  "message": "تم جلب الكورسات بنجاح",
  "data": {
    // البيانات الفعلية هنا
  },
  "pagination": {
    // اختياري
    "currentPage": 1,
    "totalPages": 5
  }
}
```

### ❌ خطأ

```json
{
  "success": false,
  "message": "رسالة الخطأ",
  "errorCode": "INVALID_CREDENTIALS",
  "errors": [
    // اختياري
    {
      "field": "email",
      "message": "البريد غير صحيح"
    }
  ]
}
```

---

## 🔑 ملاحظات مهمة

1. **التوكن تلقائي**: كل الطلبات تأخذ التوكن تلقائياً من Store
2. **401 = Logout**: لو التوكن منتهي، تسجيل خروج تلقائي
3. **FormData للصور**: أي ملف يُرفع استخدم FormData
4. **Admin APIs**: تحتاج role = admin في التوكن

---

## 🚀 جاهز للاستخدام!

البنية جاهزة، كل الـ APIs شغالة وموثقة.
ابدأ ببناء الصفحات واستخدم الـ APIs مباشرة! 💪
