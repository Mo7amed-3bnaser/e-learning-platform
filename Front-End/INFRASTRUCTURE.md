# 🏗️ البنية التحتية للفرونت إند

تم بناء البنية الأساسية التي ستستخدمها في جميع الصفحات القادمة.

## ✅ ما تم إنجازه

### 1️⃣ **Authentication Store** (`src/store/authStore.ts`)

نظام إدارة حالة المستخدم باستخدام Zustand مع الحفظ التلقائي في localStorage.

**الاستخدام:**

```typescript
import { useAuthStore } from "@/store/authStore";

// في أي component
const { user, isAuthenticated, login, logout } = useAuthStore();

// تسجيل الدخول
login(token, user);

// تسجيل الخروج
logout();

// التحقق من تسجيل الدخول
if (isAuthenticated) {
  // المستخدم مسجل دخول
}

// الوصول لبيانات المستخدم
console.log(user.name, user.phone, user.role);
```

---

### 2️⃣ **API Service Layer** (`src/lib/api.ts`)

جميع استدعاءات الـ API جاهزة ومنظمة حسب الوحدات.

**المميزات:**

- ✅ إضافة التوكن تلقائياً في كل طلب
- ✅ معالجة الأخطاء تلقائياً
- ✅ تسجيل خروج تلقائي عند انتهاء الجلسة (401)

**الاستخدام:**

```typescript
import { coursesAPI, ordersAPI, videosAPI } from "@/lib/api";

// جلب جميع الكورسات
const response = await coursesAPI.getAllCourses();
const courses = response.data.data;

// جلب تفاصيل كورس
const course = await coursesAPI.getCourseById(courseId);

// إنشاء طلب شراء
const formData = new FormData();
formData.append("courseId", courseId);
formData.append("paymentMethod", "vodafone_cash");
formData.append("screenshot", imageFile);

const order = await ordersAPI.createOrder(formData);
```

**الـ APIs المتاحة:**

- `authAPI` - التسجيل والدخول
- `coursesAPI` - الكورسات (عرض، إضافة، تعديل)
- `videosAPI` - الفيديوهات
- `ordersAPI` - الطلبات والشراء
- `adminAPI` - لوحة التحكم
- `uploadAPI` - رفع الصور

---

### 3️⃣ **Protected Route Component** (`src/components/ProtectedRoute.tsx`)

لحماية الصفحات المحمية (Dashboard, Admin Panel).

**الاستخدام:**

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

// صفحة للطلاب المسجلين فقط
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>محتوى الصفحة المحمية</div>
    </ProtectedRoute>
  );
}

// صفحة للأدمن فقط
export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div>لوحة تحكم الأدمن</div>
    </ProtectedRoute>
  );
}
```

---

### 4️⃣ **Toast Notifications** (`src/lib/toast.ts`)

نظام إشعارات موحد وجميل.

**الاستخدام:**

```typescript
import { showSuccess, showError, handleApiError } from "@/lib/toast";

// رسالة نجاح
showSuccess("تم الحفظ بنجاح!");

// رسالة خطأ
showError("حدث خطأ ما");

// معالجة أخطاء الـ API تلقائياً
try {
  await coursesAPI.getAllCourses();
} catch (error) {
  handleApiError(error); // يستخرج الرسالة من الباك إند ويعرضها
}
```

---

### 5️⃣ **Auth Initializer** (`src/components/AuthInitializer.tsx`)

يحمل بيانات المستخدم تلقائياً عند فتح الموقع.

---

## 📝 التحديثات على الملفات القديمة

### ✅ `login/page.tsx` - محدّث

- استخدام `useAuthStore` بدلاً من localStorage مباشرة
- استخدام `authAPI.login()` بدلاً من fetch
- استخدام `showSuccess` و `handleApiError` بدلاً من alert

### ✅ `register/page.tsx` - محدّث

- نفس التحديثات السابقة
- التوجيه حسب نوع المستخدم (admin/student)

### ✅ `layout.tsx` - محدّث

- إضافة `<Toaster>` للإشعارات
- إضافة `<AuthInitializer>` لتحميل البيانات

---

## 🎯 الخطوة القادمة

البنية الأساسية جاهزة الآن! يمكنك البدء ببناء:

### الأولوية 1: Student Flow 🎓

1. **صفحة الكورسات** (`/courses`)

   ```typescript
   const courses = await coursesAPI.getAllCourses();
   ```

2. **صفحة تفاصيل الكورس** (`/courses/[id]`)

   ```typescript
   const course = await coursesAPI.getCourseById(id);
   ```

3. **صفحة الشراء** (`/checkout/[courseId]`)

   ```typescript
   const order = await ordersAPI.createOrder(formData);
   ```

4. **صفحة الطلبات** (`/orders`)

   ```typescript
   const orders = await ordersAPI.getMyOrders();
   ```

5. **مشغل الفيديو** (`/courses/[id]/watch`)
   ```typescript
   const videos = await videosAPI.getCourseVideos(courseId);
   ```

### الأولوية 2: Admin Panel ⚙️

6. **Dashboard** - `adminAPI.getDashboardStats()`
7. **Orders Management** - `ordersAPI.getPendingOrders()`
8. **Courses Management** - `coursesAPI.createCourse()`
9. **Students Management** - `adminAPI.getAllStudents()`

---

## 💡 نصائح مهمة

1. **استخدم الـ API Layer دائماً** - لا تستخدم fetch مباشرة
2. **استخدم Toast بدلاً من alert** - للتجربة أفضل
3. **تحقق من isAuthenticated قبل عرض المحتوى**
4. **استخدم ProtectedRoute للصفحات المحمية**
5. **البيانات محفوظة تلقائياً** - لا تقلق من localStorage

---

## 🧪 الاختبار

جرب الآن:

1. سجل دخول في `/login`
2. افتح Console واكتب: `localStorage.getItem('auth-storage')`
3. ستجد البيانات محفوظة بشكل آمن

البنية جاهزة للعمل! 🚀
