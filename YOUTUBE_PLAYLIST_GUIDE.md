# 🎬 دليل إضافة YouTube Playlist للمنصة

## ✅ الـ Playlist المحددة:
**Fundamentals Of Programming With C++**
- Link: https://www.youtube.com/playlist?list=PLDoPjvoNmBAwy-rS6WKudwVeb_x63EzgS
- Channel: Elzero Web School
- Playlist ID: `PLDoPjvoNmBAwy-rS6WKudwVeb_x63EzgS`

---

## 🚀 طريقة 1: استخدام Script جاهز (أسرع)

### الخطوات:

```bash
# 1. تأكد من تشغيل MongoDB
# 2. شغل الـ Script
cd Back-End
node scripts/importYouTubePlaylist.js
```

**النتيجة:**
- ✅ كورس جديد بعنوان "Fundamentals Of Programming With C++"
- ✅ 5 فيديوهات جاهزة
- ✅ السعر = 0 (مجاني)
- ✅ أول فيديوهين Free Preview

---

## 📝 طريقة 2: إضافة يدوي (للتحكم الكامل)

### 1️⃣ إنشاء الكورس:

```bash
POST http://localhost:5000/api/courses
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "title": "Fundamentals Of Programming With C++",
  "description": "كورس شامل لتعلم C++ من الصفر",
  "price": 0,
  "thumbnail": "https://i.ytimg.com/vi/XDuWyYxksXU/maxresdefault.jpg",
  "category": "programming",
  "level": "beginner",
  "instructor": {
    "name": "Elzero Web School",
    "bio": "مدرب برمجة محترف"
  },
  "whatYouWillLearn": [
    "أساسيات البرمجة",
    "لغة C++ من الصفر",
    "البرمجة الكائنية"
  ],
  "isPublished": true
}
```

**احفظ الـ `_id` اللي هيرجع ← هتحتاجه في الخطوة التالية**

---

### 2️⃣ إضافة الفيديوهات:

```bash
POST http://localhost:5000/api/videos
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "courseId": "COURSE_ID_FROM_STEP_1",
  "title": "#001 - Important Introduction About The Course",
  "videoProvider": "youtube",
  "youtubeVideoId": "XDuWyYxksXU",
  "duration": 630,
  "order": 1,
  "isFreePreview": true
}
```

**كرر نفس الطريقة لكل فيديو:**

| Order | Title | Video ID | Duration |
|-------|-------|----------|----------|
| 1 | #001 - Important Introduction | XDuWyYxksXU | 630 |
| 2 | #002 - Why C++ Language | EZwy2rKi4JA | 452 |
| 3 | #003 - What Is C++ | N7EZNTbKxd8 | 382 |
| 4 | #004 - Check If Your Computer Ready | k5R74gWaLjA | 428 |
| 5 | #005 - Install Code::Blocks Editor | ALAcY7kF2Fg | 384 |

---

## 🎯 طريقة 3: استخدام Postman Collection

### Import الـ Collection:

```json
{
  "info": { "name": "Add YouTube Playlist" },
  "item": [
    {
      "name": "1. Create Course",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/courses",
        "header": [
          { "key": "Authorization", "value": "Bearer {{adminToken}}" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Fundamentals Of Programming With C++\",\n  \"price\": 0\n}"
        }
      }
    },
    {
      "name": "2. Add Video #1",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/videos",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"courseId\": \"{{courseId}}\",\n  \"youtubeVideoId\": \"XDuWyYxksXU\"\n}"
        }
      }
    }
  ]
}
```

---

## 📊 كيف تجيب معلومات الفيديو من YouTube؟

### استخراج Video ID:
```
من: https://www.youtube.com/watch?v=XDuWyYxksXU
→ Video ID: XDuWyYxksXU
```

### حساب Duration (بالثواني):
```
5:30 دقيقة = (5 × 60) + 30 = 330 ثانية
10:45 دقيقة = (10 × 60) + 45 = 645 ثانية
```

### صورة الـ Thumbnail:
```
https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
```

---

## ✅ بعد الإضافة:

### تجربة الكورس:

```bash
# 1. جلب الكورسات
GET http://localhost:5000/api/courses

# 2. التسجيل في الكورس (Sandbox)
POST http://localhost:5000/api/orders/sandbox/pay
{
  "courseId": "YOUR_COURSE_ID"
}

# 3. مشاهدة الفيديوهات
GET http://localhost:5000/api/videos/YOUR_COURSE_ID
```

---

## 🎬 في الفرونت اند:

```tsx
import YouTubePlayer from '@/components/YouTubePlayer';

function VideoPage() {
  const [video, setVideo] = useState(null);
  
  useEffect(() => {
    // جلب بيانات الفيديو
    fetch('/api/videos/watch/VIDEO_ID')
      .then(res => res.json())
      .then(data => setVideo(data.data));
  }, []);
  
  return (
    <div>
      <h1>{video?.title}</h1>
      <YouTubePlayer 
        videoId={video?.youtubeVideoId}
        title={video?.title}
      />
    </div>
  );
}
```

---

## 💡 نصائح:

1. ✅ **أول 2-3 فيديوهات خليهم Free Preview** عشان الناس تجرب
2. ✅ **السعر = 0** للتجربة
3. ✅ **استخدم Sandbox Payment** للاختبار
4. ✅ **YouTube مجاني لكن بدون حماية** - للإنتاج استخدم Vimeo/Bunny

---

## 🔧 Troubleshooting:

**المشكلة:** الفيديو مش بيشتغل
**الحل:** تأكد من الـ Video ID صحيح ومن YouTube مش Private

**المشكلة:** مش قادر أشوف الفيديوهات
**الحل:** تأكد انك مسجل في الكورس أو الفيديو Free Preview

---

**محتاج مساعدة؟** شغل الـ Script وهيعمل كل حاجة أوتوماتيك! 🚀
