# 🎮 دليل استخدام نظام Sandbox للتجربة

## ✅ التعديلات المنفذة:

### 1️⃣ **دعم YouTube Videos**
- تم تعديل `Video.js` model لدعم كل من YouTube و Bunny.net
- حقل `videoProvider` لتحديد نوع الفيديو
- `youtubeVideoId` للفيديوهات من YouTube
- `bunnyVideoId` يبقى موجود للمستقبل

### 2️⃣ **Sandbox Payment Gateway**
- API جديد: `POST /api/orders/sandbox/pay`
- يقبل الدفع تلقائياً بدون تحقق حقيقي
- يسجل الطالب في الكورس مباشرة

### 3️⃣ **YouTube Player Component**
- Component جاهز للفرونت اند
- يدعم autoplay و customization
- Responsive design

---

## 🚀 كيفية الاستخدام:

### **1. إضافة كورس بفيديوهات YouTube:**

\`\`\`javascript
// POST /api/videos
{
  "courseId": "course_id_here",
  "title": "مقدمة للبرمجة",
  "description": "فيديو تعريفي",
  "videoProvider": "youtube",
  "youtubeVideoId": "dQw4w9WgXcQ", // من رابط YouTube
  "duration": 600, // بالثواني
  "order": 1,
  "isFreePreview": false,
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
}
\`\`\`

### **2. الدفع التجريبي (Sandbox):**

\`\`\`javascript
// POST /api/orders/sandbox/pay
// Headers: Authorization: Bearer <token>
{
  "courseId": "course_id_here"
}

// Response:
{
  "success": true,
  "message": "✅ تم التسجيل في الكورس بنجاح (Sandbox Mode)",
  "data": {
    "isEnrolled": true,
    "sandboxMode": true,
    "note": "هذا دفع تجريبي - لن يتم خصم أي مبلغ حقيقي"
  }
}
\`\`\`

### **3. التحقق من التسجيل:**

\`\`\`javascript
// GET /api/orders/enrollment/:courseId
{
  "success": true,
  "data": {
    "isEnrolled": true,
    "courseId": "..."
  }
}
\`\`\`

---

## 🎬 استخدام YouTube Player في React:

\`\`\`tsx
import YouTubePlayer from '@/components/YouTubePlayer';

function VideoLesson({ video }) {
  return (
    <div>
      <h2>{video.title}</h2>
      <YouTubePlayer 
        videoId={video.youtubeVideoId}
        title={video.title}
        autoplay={false}
      />
    </div>
  );
}
\`\`\`

---

## 📝 استخراج YouTube Video ID:

من الرابط: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Video ID: `dQw4w9WgXcQ`

من الرابط: `https://youtu.be/dQw4w9WgXcQ`
- Video ID: `dQw4w9WgXcQ`

---

## 🔐 Flow كامل للطالب:

1. **يشوف الكورسات** → `GET /api/courses`
2. **يختار كورس** → `GET /api/courses/:id`
3. **يضغط "اشترك الآن"** → `POST /api/orders/sandbox/pay`
4. **يتسجل تلقائياً** ✅
5. **يشاهد الفيديوهات** → `GET /api/videos/:courseId`

---

## ⚠️ ملاحظات مهمة:

- ✅ الـ Sandbox للتجربة فقط
- ✅ YouTube مجاني لكن بدون حماية قوية
- ✅ للإنتاج استبدل بـ Vimeo أو Bunny.net
- ✅ Orders تتسجل في Database كـ "approved"

---

## 🎯 الخطوة التالية:

**جرب النظام:**
1. ارفع كورس تجريبي
2. أضف فيديوهات من YouTube playlist
3. جرب الدفع الوهمي
4. شوف الفيديوهات بتشتغل

**محتاج مساعدة في حاجة معينة؟** 🚀
