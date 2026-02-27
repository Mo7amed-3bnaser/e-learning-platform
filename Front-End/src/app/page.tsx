import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "منصة مسار التعليمية — ابدأ رحلتك نحو النجاح والتميز",
  description:
    "منصة تعليمية عربية متكاملة تقدم +500 كورس في البرمجة والتصميم والأعمال. احصل على شهادات معتمدة وتعلّم على يد +50 مدرب خبير.",
  openGraph: {
    title: "منصة مسار التعليمية",
    description:
      "منصة تعليمية عربية متكاملة — +500 كورس، +10K طالب نشط، شهادات معتمدة",
    type: "website",
    locale: "ar_EG",
  },
};

/**
 * Home page — Server Component wrapper.
 *
 * SSR-rendered metadata + SEO-friendly static content for crawlers,
 * while <HomeClient> handles all interactive (client-side) logic.
 */
export default function HomePage() {
  return (
    <>
      {/* SEO-critical static content rendered server-side for crawlers */}
      <noscript>
        <div dir="rtl" lang="ar">
          <h1>منصة مسار التعليمية — ابدأ رحلتك نحو النجاح والتميز</h1>
          <p>
            تعلّم من خبراء معتمدين، احصل على شهادات موثّقة، وطوّر مهاراتك في
            البرمجة والتصميم والأعمال — بالعربية، في أي وقت.
          </p>
          <ul>
            <li>+500 دورة تعليمية</li>
            <li>+10K طالب نشط</li>
            <li>+50 مدرب خبير</li>
            <li>4.9 تقييم المنصة</li>
          </ul>
          <h2>التخصصات</h2>
          <ul>
            <li>البرمجة وتطوير الويب</li>
            <li>التصوير والإنتاج</li>
            <li>الأعمال والمال</li>
            <li>اللغات والترجمة</li>
            <li>التصميم والجرافيك</li>
            <li>التسويق الرقمي</li>
          </ul>
          <h2>لماذا مسار؟</h2>
          <ul>
            <li>محتوى فيديو عالي الجودة</li>
            <li>شهادات معتمدة</li>
            <li>مدربون محترفون</li>
            <li>تطور مستمر</li>
            <li>تعلم بسرعتك</li>
            <li>تتبع تقدمك</li>
          </ul>
          <h2>كيف تبدأ؟</h2>
          <ol>
            <li>سجّل مجاناً — أنشئ حسابك في ثوانٍ وابدأ رحلتك التعليمية فوراً</li>
            <li>اختر كورسك — تصفح مئات الكورسات واختر ما يناسب أهدافك</li>
            <li>تعلم واحترف — شاهد الدروس، أنجز المهام، واحصل على شهادتك</li>
          </ol>
          <p>© 2026 منصة مسار — جميع الحقوق محفوظة</p>
        </div>
      </noscript>

      <HomeClient />
    </>
  );
}
