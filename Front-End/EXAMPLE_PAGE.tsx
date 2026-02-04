/**
 * 📚 مثال عملي: كيف تبني صفحة جديدة باستخدام البنية الجديدة
 * 
 * هذا المثال يوضح كيفية إنشاء صفحة "Dashboard" للطالب
 */

"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { coursesAPI, ordersAPI } from '@/lib/api';
import { showSuccess, showError, handleApiError } from '@/lib/toast';
import ProtectedRoute from '@/components/ProtectedRoute';

// 1️⃣ تعريف الـ Types
interface Course {
  _id: string;
  title: string;
  thumbnail: string;
  instructor: {
    name: string;
  };
}

interface Order {
  _id: string;
  courseId: {
    title: string;
  };
  status: 'pending' | 'approved' | 'rejected';
}

export default function DashboardPage() {
  // 2️⃣ استخدام Auth Store
  const { user } = useAuthStore();
  
  // 3️⃣ تعريف الـ State
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 4️⃣ جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // جلب الطلبات
      const ordersResponse = await ordersAPI.getMyOrders();
      setOrders(ordersResponse.data.data);
      
      // جلب الكورسات المشترك فيها
      // TODO: إضافة API للكورسات المشترك فيها
      
      showSuccess('تم تحميل البيانات بنجاح');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 5️⃣ التأكد من الحماية بـ ProtectedRoute
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              مرحباً، {user?.name} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              البريد: {user?.email} | رقم الهاتف: {user?.phone}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enrolled Courses */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">الكورسات المشترك فيها</h2>
                {enrolledCourses.length === 0 ? (
                  <p className="text-gray-500">لم تشترك في أي كورس بعد</p>
                ) : (
                  <div className="space-y-3">
                    {enrolledCourses.map((course) => (
                      <div key={course._id} className="border rounded p-3">
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-gray-600">
                          {course.instructor.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Orders */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">طلباتي</h2>
                {orders.length === 0 ? (
                  <p className="text-gray-500">لا توجد طلبات</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order._id} className="border rounded p-3">
                        <h3 className="font-semibold">
                          {order.courseId.title}
                        </h3>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                            order.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status === 'approved'
                            ? 'مقبول'
                            : order.status === 'pending'
                            ? 'قيد المراجعة'
                            : 'مرفوض'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

/**
 * 📝 ملاحظات مهمة:
 * 
 * 1. استخدم ProtectedRoute لحماية الصفحة
 * 2. استخدم useAuthStore للوصول لبيانات المستخدم
 * 3. استخدم API Layer (coursesAPI, ordersAPI) للطلبات
 * 4. استخدم Toast للإشعارات بدلاً من alert
 * 5. استخدم handleApiError لمعالجة الأخطاء تلقائياً
 * 
 * هذا المثال يمكنك نسخه وتعديله لبناء أي صفحة جديدة!
 */
