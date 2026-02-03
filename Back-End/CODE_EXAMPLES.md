# 💻 أمثلة كود جاهزة - للفرونت إند

## 🔧 إعداد Axios

```javascript
// lib/axios.js أو utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// إضافة التوكن تلقائياً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // التوكن منتهي - ارجع للـ Login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔐 Authentication

### Login Component

```jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import jwt_decode from 'jwt-decode';

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);

      if (response.data.success) {
        const { token } = response.data.data;
        
        // حفظ التوكن
        localStorage.setItem('token', token);
        
        // فك التوكن
        const decoded = jwt_decode(token);
        console.log('Logged in user:', decoded);
        
        // Redirect
        if (decoded.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/courses');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="كلمة المرور"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'جاري الدخول...' : 'دخول'}
      </button>
    </form>
  );
}
```

---

## 📚 عرض الكورسات

```jsx
'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import CourseCard from '@/components/CourseCard';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
}
```

---

## 🎥 Video Player مع العلامة المائية

```jsx
'use client';
import { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export default function VideoPlayer({ bunnyVideoId, bunnyLibraryId }) {
  const [watermarkPosition, setWatermarkPosition] = useState({ top: '10%', left: '10%' });
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // جيب بيانات المستخدم من التوكن
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      setUserInfo(decoded);
    }

    // حرك العلامة المائية كل 5 ثواني
    const moveWatermark = () => {
      const randomTop = Math.random() * 70 + 10;   // 10-80%
      const randomLeft = Math.random() * 70 + 10;  // 10-80%
      
      setWatermarkPosition({
        top: `${randomTop}%`,
        left: `${randomLeft}%`
      });
    };

    const interval = setInterval(moveWatermark, 5000);
    
    // Anti-Tamper Protection
    const observer = new MutationObserver((mutations) => {
      const watermark = document.getElementById('video-watermark');
      
      if (!watermark) {
        alert('⚠️ تم اكتشاف محاولة تلاعب! سيتم إيقاف الفيديو.');
        const iframe = document.getElementById('video-iframe');
        if (iframe) iframe.src = '';
        window.location.href = '/courses';
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  if (!userInfo) return <div>جاري التحميل...</div>;

  return (
    <div className="relative w-full aspect-video bg-black">
      {/* Bunny Video Player */}
      <iframe
        id="video-iframe"
        src={`https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${bunnyVideoId}?autoplay=false&preload=true`}
        loading="lazy"
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />

      {/* 🛡️ العلامة المائية */}
      <div
        id="video-watermark"
        className="absolute text-white/70 bg-black/30 px-3 py-1 rounded text-sm pointer-events-none select-none transition-all duration-1000"
        style={{
          top: watermarkPosition.top,
          left: watermarkPosition.left,
          zIndex: 9999,
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {userInfo.name} - {userInfo.phone}
      </div>

      {/* منع Right Click */}
      <div 
        className="absolute inset-0 z-[9998]"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
```

---

## 💳 صفحة الدفع

```jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function CheckoutPage({ courseId, price }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('vodafone_cash');
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // رفع الصورة
  const handleUploadScreenshot = async (file) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setScreenshot(response.data.data.url);
      }
    } catch (error) {
      alert('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  // إرسال الطلب
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!screenshot) {
      alert('برجاء رفع صورة التحويل');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/orders', {
        courseId,
        paymentMethod,
        screenshotUrl: screenshot
      });

      if (response.data.success) {
        alert('تم إرسال طلبك بنجاح! سيتم مراجعته قريباً');
        router.push('/orders');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">إتمام الشراء</h2>
      
      <div className="bg-blue-50 p-4 rounded mb-4">
        <p className="text-sm">المبلغ المطلوب: <strong>{price} جنيه</strong></p>
      </div>

      {/* معلومات التحويل */}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <p className="font-bold mb-2">خطوات الدفع:</p>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>حول المبلغ على: <strong>01012345678</strong></li>
          <li>التقط صورة للعملية</li>
          <li>ارفع الصورة أدناه</li>
        </ol>
      </div>

      {/* اختيار طريقة الدفع */}
      <div className="mb-4">
        <label className="block mb-2">طريقة الدفع:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="vodafone_cash">Vodafone Cash</option>
          <option value="instapay">InstaPay</option>
        </select>
      </div>

      {/* رفع الصورة */}
      <div className="mb-4">
        <label className="block mb-2">صورة التحويل:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUploadScreenshot(e.target.files[0])}
          disabled={uploading}
          className="w-full p-2 border rounded"
        />
        {uploading && <p className="text-sm text-gray-500 mt-2">جاري الرفع...</p>}
        {screenshot && (
          <img src={screenshot} alt="Screenshot" className="mt-2 w-full rounded" />
        )}
      </div>

      <button
        type="submit"
        disabled={!screenshot || submitting}
        className="w-full bg-blue-600 text-white py-3 rounded disabled:opacity-50"
      >
        {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
      </button>
    </form>
  );
}
```

---

## 🎯 Zustand Store

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
      
      // Login
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
      
      // Logout
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
      
      // Helpers
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin',
      getToken: () => get().token,
      getUser: () => get().user
    }),
    {
      name: 'auth-storage'
    }
  )
);

export default useAuthStore;
```

---

## 🔒 Protected Route Middleware

```javascript
// middleware.js (Next.js)
import { NextResponse } from 'next/server';
import jwt_decode from 'jwt-decode';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;

  // Protected routes
  const protectedPaths = ['/courses/watch', '/orders', '/profile'];
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin routes
  const adminPaths = ['/admin'];
  const isAdminRoute = adminPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decoded = jwt_decode(token);
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
```

---

**كل الأمثلة جاهزة للاستخدام! 🚀**
